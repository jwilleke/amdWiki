# Semver Release

Cut a new semver release: bump `package.json` (and `config/app-default-config.json` + `CHANGELOG.md`) via ngdpbase's `src/utils/version.ts`, create an annotated git tag, push it, and create a GitHub release with auto-generated notes.

## Usage

`/semver <bump>` — where `<bump>` is one of:

- `patch` — `0.2.0` → `0.2.1` (bug fixes, docs, chores; no new features, no breaking changes)
- `minor` — `0.2.0` → `0.3.0` (new features; for pre-1.0 also use this for breaking changes)
- `major` — `0.2.0` → `1.0.0` (breaking changes once the API is stable; rarely used pre-1.0)

If the user did not specify a bump type, ask them which one before proceeding.

## Steps

### Step 1: Verify the working tree is clean and on master

Run in parallel:

- `git status --porcelain` — must be empty. If not, stop and tell the user to commit or stash first.
- `git rev-parse --abbrev-ref HEAD` — must be `master`. If not, ask the user to confirm before proceeding.
- `git fetch origin && git rev-list --count HEAD..origin/master` — must be `0`. If the local branch is behind, stop and tell the user to pull first.

### Step 2: Determine current and next version

- Read `package.json` `version` field.
- Compute the next version from the requested bump (`patch` increments the third number, `minor` increments the second and zeros the third, `major` increments the first and zeros the rest).
- Show the user: `current → next` and confirm before continuing **only if** the bump is `major` or if there are no commits since the last tag (i.e., nothing to release). For `patch` / `minor` with new commits, proceed without prompting.

### Step 3: Summarize what's in the release

- Run `git log <last-tag>..HEAD --oneline` to list commits since the previous tag.
- If there are zero commits since the last tag, stop and tell the user there's nothing to release.

### Step 4: Build, then run the full test suite

A release that doesn't pass tests should not exist. Run tests **before** any version bump so nothing on disk has to be rolled back if a test fails.

Run sequentially:

- `npm run build` — compiles TypeScript. Required so both the test build and `dist/src/utils/version.js` (used in Step 5) are fresh.
- `npm test` — must pass (Vitest unit + integration).
- `npm run test:e2e` — must pass (Playwright). The dev server must be up; if it isn't, run `./server.sh restart` and wait for `http://localhost:3000` before invoking E2E.

If anything fails, **stop**. Fix the failures and start again from Step 1. The working tree is still clean at this point — nothing to roll back.

### Step 5: Bump the version with `version.ts`

ngdpbase ships its own version tool at `src/utils/version.ts` which keeps `package.json`, `config/app-default-config.json`, and `CHANGELOG.md` in lockstep. **Do not** edit those files by hand.

Run sequentially:

- `node dist/src/utils/version.js <bump>` — bumps all three files in one shot. Output looks like `Version updated: 3.3.6 → 3.3.7`.
- Stage the three updated files: `git add package.json config/app-default-config.json CHANGELOG.md`.
  - Stage `package-lock.json` too only if it actually changed (rare for version-only edits).

### Step 6: Commit, tag, and push

Run sequentially:

- `git commit -m "chore: release v<next>"` (with the standard `Co-Authored-By` trailer).
- `git tag -a v<next> -m "v<next>"` — keep the tag message short; the GitHub release will carry the detailed notes.
- `git push origin master` — push the commit first.
- `git push origin v<next>` — then the tag, so the release commit is reachable on the default branch.

### Step 7: Create the GitHub release

- `gh release create v<next> --title "v<next>" --generate-notes --notes-start-tag v<previous>`
  - `--generate-notes` autogenerates from merged PRs and commits in the range.
  - `--notes-start-tag` makes the range explicit so notes don't accidentally span multiple releases.

### Step 8: Update sister installs

Sister ngdpbase installs (e.g., The Fairways, ve-geology) need to be told about the new release. Invoke the `/othersites` skill — it knows the list and how to update each one.

### Step 9: Report

Output to the user:

- Old version → new version
- Tag URL (from `gh release view v<next> --json url --jq .url`)
- Number of commits in this release (from Step 3)
- Whether `/othersites` propagation succeeded.

## Rules

- Never tag if the working tree is dirty.
- Never tag a commit that hasn't been pushed.
- Never skip the test suite before tagging.
- Never skip the GitHub release — auto-generated notes are the whole point of cutting a tag.
- Use annotated tags (`-a`), never lightweight tags.
- Tag names are always prefixed with `v` (e.g., `v3.3.7`, not `3.3.7`).
- For pre-1.0 versions, treat breaking changes as `minor` bumps (the standard pre-1.0 convention).
- `CHANGELOG.md` is updated automatically by `version.ts`; do not edit it by hand for release entries. (Manual edits are fine for descriptive prose between releases, but the version-bump line itself is owned by the tool.)
- Do not bump versions through `npm version` — it skips `app-default-config.json` and `CHANGELOG.md`.
