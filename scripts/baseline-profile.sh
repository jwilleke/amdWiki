#!/usr/bin/env bash
#
# baseline-profile.sh — Capture a startup + memory + response-time snapshot.
#
# Fills the gaps left by scripts/performance-test.ts (#603):
#   - cold-start time to "Engine initialized"
#   - memory at idle (RSS via pm2)
#   - response-time samples for a few representative routes
#
# Usage:
#   scripts/baseline-profile.sh                    # measure current install
#   scripts/baseline-profile.sh --cold-start       # also stop/start the server
#   scripts/baseline-profile.sh --compare          # diff vs the most recent
#                                                  # prior baseline (#611)
#   scripts/baseline-profile.sh --compare <FILE>   # diff vs a specific file
#
# When --compare is set, the script appends a "Drift vs <previous>" section
# to the new baseline file AND prints the same table to stdout. Exits
# non-zero if any threshold trips:
#
#   BASELINE_MEM_DELTA_PCT  default 25  (memory % regression)
#   BASELINE_RT_DELTA_PCT   default 50  (route % regression)
#   BASELINE_RT_DELTA_MS    default 50  (route absolute regression — both
#                                       % and ms thresholds must trip
#                                       together to flag, so we don't
#                                       false-positive on already-fast
#                                       routes that wobble by 1 ms)
#
# Output:
#   docs/performance/baseline-<version>-<date>.md
#
# Requirements: ./server.sh, jq, gh, curl, pm2 available via npx.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

VERSION=$(node -p "require('./package.json').version")
TODAY=$(date +%Y-%m-%d)
OUT_DIR="$REPO_ROOT/docs/performance"
OUT_FILE="$OUT_DIR/baseline-v${VERSION}-${TODAY}.md"
mkdir -p "$OUT_DIR"

# #611: don't clobber an existing same-day baseline for the same version —
# that's almost certainly the release-time capture, and re-runs (especially
# under --compare during development) would silently replace it with whatever
# state the server is in now (often cold-cache, post-restart, with very
# different numbers). If the file exists, suffix the new one with -rN.
if [[ -f "$OUT_FILE" ]]; then
  i=2
  while [[ -f "$OUT_DIR/baseline-v${VERSION}-${TODAY}-r${i}.md" ]]; do
    i=$((i + 1))
  done
  OUT_FILE="$OUT_DIR/baseline-v${VERSION}-${TODAY}-r${i}.md"
fi

PORT=$(grep -E '^PORT=' .env 2>/dev/null | head -1 | cut -d= -f2 || echo "3000")
BASE_URL="http://localhost:${PORT}"

# ── Argument parsing ─────────────────────────────────────────────────────────

DO_COLD_START=0
DO_COMPARE=0
COMPARE_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cold-start)
      DO_COLD_START=1
      shift
      ;;
    --compare)
      DO_COMPARE=1
      # Optional filename argument (must not start with --)
      if [[ $# -ge 2 && "${2:0:2}" != "--" ]]; then
        COMPARE_FILE="$2"
        shift 2
      else
        shift
      fi
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

INSTANCE_NAME=$(npx pm2 jlist 2>/dev/null \
  | jq -r --arg port "$PORT" '.[] | select(.pm2_env.PORT == $port or (.pm2_env.env.PORT // "") == $port) | .name' \
  | head -1)
INSTANCE_NAME="${INSTANCE_NAME:-jimstest}"

echo "Repo:      $REPO_ROOT"
echo "Version:   v${VERSION}"
echo "Instance:  $INSTANCE_NAME (port $PORT)"
echo "Output:    $OUT_FILE"
echo

# ── Cold-start timing (optional) ──────────────────────────────────────────────

COLD_START_MS=""
LINK_GRAPH_MS=""
LINK_GRAPH_ENTRIES=""

if [[ "$DO_COLD_START" -eq 1 ]]; then
  echo "→ Measuring cold start (./server.sh stop && start)…"
  ./server.sh stop >/dev/null 2>&1 || true
  sleep 2
  START_TS=$(date +%s%3N)
  ./server.sh start >/dev/null 2>&1 || true
  # Wait for the engine-ready marker
  for _ in {1..60}; do
    if grep -q '✅ ngdpbase Engine initialized successfully' "${FAST_STORAGE:-./data}/logs/pm2-out.log" 2>/dev/null; then
      break
    fi
    sleep 1
  done
  END_TS=$(date +%s%3N)
  COLD_START_MS=$((END_TS - START_TS))
  echo "  cold-start: ${COLD_START_MS} ms"
fi

# Always look back for the most recent link-graph entry-count + duration.
PM2_OUT="${FAST_STORAGE:-./data}/logs/pm2-out.log"
if [[ -f "$PM2_OUT" ]]; then
  LINK_GRAPH_LINE=$(grep 'Link graph built with' "$PM2_OUT" | tail -1)
  if [[ -n "$LINK_GRAPH_LINE" ]]; then
    LINK_GRAPH_ENTRIES=$(echo "$LINK_GRAPH_LINE" | grep -oE '[0-9]+ entries' | grep -oE '[0-9]+')
  fi
fi

# ── Memory snapshot via pm2 ───────────────────────────────────────────────────

MEM_BYTES=$(npx pm2 jlist 2>/dev/null \
  | jq -r --arg name "$INSTANCE_NAME" '.[] | select(.name == $name) | .monit.memory' \
  | head -1)
MEM_MB=$(awk -v b="${MEM_BYTES:-0}" 'BEGIN { printf "%.1f", b / 1024 / 1024 }')
# Page count: actual live data lives at $SLOW_STORAGE/pages, not the in-repo
# data/pages (which is just seed/test fixtures). Exclude versions/ subdirs —
# those are stored historical revisions, not current pages.
PAGES_DIR="${SLOW_STORAGE:-./data}/pages"
PAGE_COUNT=$(find "$PAGES_DIR" -name '*.md' -not -path '*/versions/*' 2>/dev/null | wc -l | tr -d ' ')

echo "→ Memory snapshot: ${MEM_MB} MB resident"
echo "→ Pages on disk:   ${PAGE_COUNT}"

# ── Response-time samples ─────────────────────────────────────────────────────

echo "→ Sampling response times (10 iterations per route)…"

# Parallel arrays — macOS bash 3.2 has no associative arrays.
# Routes are chosen for unauthenticated access. /edit/* and admin routes are
# excluded because they 302 to /login; their timings would reflect login page
# render, not the actual feature.
ROUTES=("/" "/view/Welcome" "/search?q=test" "/login")
ROUTE_TIMES=()
for route in "${ROUTES[@]}"; do
  total=0
  samples=0
  for _ in {1..10}; do
    ms=$(curl -sSL -o /dev/null -w '%{time_total}' --max-time 10 "${BASE_URL}${route}" 2>/dev/null \
      | awk '{ printf "%d", $1 * 1000 }')
    if [[ -n "$ms" ]]; then
      total=$((total + ms))
      samples=$((samples + 1))
    fi
  done
  if [[ "$samples" -gt 0 ]]; then
    ROUTE_TIMES+=("$((total / samples))")
  else
    ROUTE_TIMES+=("-")
  fi
done

# ── Write the markdown report ─────────────────────────────────────────────────

{
  echo "# Performance baseline — v${VERSION}"
  echo
  echo "Captured ${TODAY} on instance \`${INSTANCE_NAME}\` (port ${PORT})."
  echo
  echo "## Snapshot"
  echo
  echo "| Metric | Value |"
  echo "| --- | --- |"
  echo "| Version | v${VERSION} |"
  echo "| Pages on disk | ${PAGE_COUNT} |"
  echo "| Resident memory (idle) | ${MEM_MB} MB |"
  if [[ -n "$LINK_GRAPH_ENTRIES" ]]; then
    echo "| Link-graph entries | ${LINK_GRAPH_ENTRIES} |"
  fi
  if [[ -n "$COLD_START_MS" ]]; then
    echo "| Cold-start time (./server.sh start → Engine initialized) | ${COLD_START_MS} ms |"
  fi
  echo
  echo "## Response times (mean across 10 samples)"
  echo
  echo "| Route | Time |"
  echo "| --- | --- |"
  for i in "${!ROUTES[@]}"; do
    echo "| \`${ROUTES[$i]}\` | ${ROUTE_TIMES[$i]} ms |"
  done
  echo
  echo "## Methodology"
  echo
  echo "Generated by \`scripts/baseline-profile.sh\`. Memory read from \`pm2 jlist\` for the running instance. Response times measured with \`curl -L --time_total\` (follows redirects) against a warm server, 10 iterations per route, mean reported. Routes chosen are unauthenticated — \`/edit/*\` and admin routes redirect to \`/login\`, so their timings would not reflect the actual feature. Cold-start time measured only when invoked with \`--cold-start\` — wraps \`./server.sh stop\` + \`./server.sh start\` and waits for the \"Engine initialized\" marker in \`pm2-out.log\`."
  echo
  echo "Re-run on each release to track drift over time. Compare against the previous baseline file in \`docs/performance/\` to spot regressions."
} > "$OUT_FILE"

echo
echo "✅ Baseline written to: $OUT_FILE"

# ── Drift comparison vs prior baseline (#611) ───────────────────────────────

if [[ "$DO_COMPARE" -eq 1 ]]; then
  if [[ -z "$COMPARE_FILE" ]]; then
    # Auto-detect: most recent baseline file other than the one we just wrote.
    COMPARE_FILE=$(ls -t "$OUT_DIR"/baseline-v*.md 2>/dev/null | grep -v "^${OUT_FILE}$" | head -1)
  fi

  if [[ -z "$COMPARE_FILE" || ! -f "$COMPARE_FILE" ]]; then
    echo
    echo "ℹ️  --compare requested but no prior baseline found in $OUT_DIR"
    exit 0
  fi

  echo
  echo "→ Comparing against $(basename "$COMPARE_FILE")…"

  # Threshold env vars (with defaults)
  MEM_THRESHOLD_PCT="${BASELINE_MEM_DELTA_PCT:-25}"
  RT_THRESHOLD_PCT="${BASELINE_RT_DELTA_PCT:-50}"
  RT_THRESHOLD_MS="${BASELINE_RT_DELTA_MS:-50}"

  # Extract metric from a baseline file. Args: file, metric_name, unit_pattern.
  # Returns numeric value or empty string.
  extract_metric() {
    local file="$1" pattern="$2"
    grep -E "$pattern" "$file" | head -1 | sed -E 's/.*\| ([0-9]+(\.[0-9]+)?) [^|]*\|.*/\1/'
  }

  PREV_MEM=$(extract_metric "$COMPARE_FILE" '^\| Resident memory')
  CURR_MEM="$MEM_MB"

  declare -a PREV_TIMES=()
  for route in "${ROUTES[@]}"; do
    # Use grep -F (literal) to avoid regex-meta troubles with `?` etc.
    val=$(grep -F "| \`${route}\` " "$COMPARE_FILE" | head -1 | sed -E 's/.*\| ([0-9]+) ms.*/\1/')
    PREV_TIMES+=("${val:-}")
  done

  # Build the diff table + warnings into one buffer
  REGRESSION_FLAGS=""
  DIFF_TABLE=""

  fmt_delta_mem() {
    local prev="$1" curr="$2"
    if [[ -z "$prev" || -z "$curr" ]]; then
      printf "n/a"
      return
    fi
    awk -v p="$prev" -v c="$curr" 'BEGIN {
      d = c - p
      pct = (p == 0 ? 0 : (d / p) * 100)
      sign = (d >= 0 ? "+" : "")
      printf "%s%.1f MB (%s%.1f%%)", sign, d, sign, pct
    }'
  }

  fmt_delta_ms() {
    local prev="$1" curr="$2"
    if [[ -z "$prev" || -z "$curr" || "$curr" == "-" ]]; then
      printf "n/a"
      return
    fi
    awk -v p="$prev" -v c="$curr" 'BEGIN {
      d = c - p
      pct = (p == 0 ? 0 : (d / p) * 100)
      sign = (d >= 0 ? "+" : "")
      printf "%s%d ms (%s%.1f%%)", sign, d, sign, pct
    }'
  }

  # Memory regression check
  if [[ -n "$PREV_MEM" && -n "$CURR_MEM" ]]; then
    mem_pct_delta=$(awk -v p="$PREV_MEM" -v c="$CURR_MEM" 'BEGIN { if (p==0) print 0; else printf "%.1f", ((c - p) / p) * 100 }')
    if awk -v pct="$mem_pct_delta" -v thresh="$MEM_THRESHOLD_PCT" 'BEGIN { exit !(pct > thresh) }'; then
      REGRESSION_FLAGS="${REGRESSION_FLAGS}memory (+${mem_pct_delta}%); "
    fi
  fi

  # Per-route regression check
  for i in "${!ROUTES[@]}"; do
    prev="${PREV_TIMES[$i]:-}"
    curr="${ROUTE_TIMES[$i]}"
    if [[ -n "$prev" && -n "$curr" && "$curr" != "-" && "$prev" != "0" ]]; then
      pct=$(awk -v p="$prev" -v c="$curr" 'BEGIN { printf "%.1f", ((c - p) / p) * 100 }')
      ms=$((curr - prev))
      # Flag only if BOTH thresholds trip (avoids 1ms-on-already-fast-route noise)
      if awk -v pct="$pct" -v thresh="$RT_THRESHOLD_PCT" 'BEGIN { exit !(pct > thresh) }' \
        && [[ "$ms" -gt "$RT_THRESHOLD_MS" ]]; then
        REGRESSION_FLAGS="${REGRESSION_FLAGS}${ROUTES[$i]} (+${pct}%, +${ms}ms); "
      fi
    fi
  done

  # Append the drift section to the new baseline file + print to stdout
  {
    echo
    echo "## Drift vs $(basename "$COMPARE_FILE")"
    echo
    if [[ -n "$REGRESSION_FLAGS" ]]; then
      echo "⚠️  **Regression candidate(s):** ${REGRESSION_FLAGS%; }"
      echo
    fi
    echo "| Metric | Previous | New | Δ |"
    echo "| --- | --- | --- | --- |"
    printf "| Memory (idle) | %s MB | %s MB | %s |\n" "$PREV_MEM" "$CURR_MEM" "$(fmt_delta_mem "$PREV_MEM" "$CURR_MEM")"
    for i in "${!ROUTES[@]}"; do
      prev="${PREV_TIMES[$i]:-}"
      curr="${ROUTE_TIMES[$i]}"
      printf "| \`%s\` | %s ms | %s ms | %s |\n" "${ROUTES[$i]}" "${prev:--}" "$curr" "$(fmt_delta_ms "$prev" "$curr")"
    done
    echo
    echo "Thresholds (override via env): memory ${MEM_THRESHOLD_PCT}% / route ${RT_THRESHOLD_PCT}% AND ${RT_THRESHOLD_MS}ms (both must trip)."
  } | tee -a "$OUT_FILE"

  # Exit non-zero if any threshold tripped (per #611 spec — release flow stops
  # so a human can review before tagging).
  if [[ -n "$REGRESSION_FLAGS" ]]; then
    echo
    echo "⚠️  Exiting 1 — at least one threshold tripped. Set thresholds higher via env vars or investigate."
    exit 1
  fi
fi
