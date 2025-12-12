#!/bin/bash
# migrate-to-data-dir.sh
# Migration script for amdWiki v1.4.0+
#
# Migrates existing data directories into the consolidated ./data/ structure.
# Run this BEFORE upgrading to v1.4.0 if you have an existing installation.
#
# Usage:
#   ./scripts/migrate-to-data-dir.sh [--dry-run]
#
# Options:
#   --dry-run    Show what would be moved without making changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DRY_RUN=false

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
    echo ""
fi

echo "=========================================="
echo "amdWiki Data Directory Migration Script"
echo "=========================================="
echo ""

# Detect project root (script is in scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"
echo "Project root: $PROJECT_ROOT"
echo ""

# Check if already migrated
if [[ -d "data/pages" && -f "data/pages/"*.md ]] 2>/dev/null; then
    echo -e "${GREEN}✓ Migration appears to already be complete (data/pages exists with content)${NC}"
    echo "  If you need to re-run, remove the data/ directory first."
    exit 0
fi

# Create data directory structure
echo "Creating data directory structure..."
if [[ "$DRY_RUN" == false ]]; then
    mkdir -p data/pages
    mkdir -p data/users
    mkdir -p data/attachments
    mkdir -p data/logs
    mkdir -p data/search-index
    mkdir -p data/backups
    mkdir -p data/sessions
    mkdir -p data/versions
fi
echo -e "${GREEN}✓ Created data/ subdirectories${NC}"
echo ""

# Migration function
migrate_dir() {
    local src="$1"
    local dest="$2"
    local name="$3"

    if [[ -d "$src" ]]; then
        local count=$(find "$src" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$count" -gt 0 ]]; then
            echo "  Moving $name: $src -> $dest ($count files)"
            if [[ "$DRY_RUN" == false ]]; then
                # Move contents, not the directory itself
                cp -r "$src"/* "$dest"/ 2>/dev/null || true
                cp -r "$src"/.[!.]* "$dest"/ 2>/dev/null || true
                # Keep old directory as backup with timestamp
                mv "$src" "${src}.backup-$(date +%Y%m%d%H%M%S)"
            fi
            echo -e "  ${GREEN}✓ Migrated $name${NC}"
        else
            echo -e "  ${YELLOW}○ $name: directory exists but is empty, skipping${NC}"
        fi
    else
        echo -e "  ${YELLOW}○ $name: not found, skipping${NC}"
    fi
}

echo "Migrating directories..."
echo ""

# Migrate each directory
migrate_dir "pages" "data/pages" "Wiki pages"
migrate_dir "users" "data/users" "User data"
migrate_dir "logs" "data/logs" "Log files"
migrate_dir "search-index" "data/search-index" "Search index"
migrate_dir "backups" "data/backups" "Backup files"
migrate_dir "sessions" "data/sessions" "Session files"

# Handle data/attachments specially (it was already in data/)
if [[ -d "data/attachments" ]]; then
    echo -e "  ${GREEN}✓ Attachments already in data/attachments${NC}"
fi

# Handle data/versions specially (it was already in data/)
if [[ -d "data/versions" ]]; then
    echo -e "  ${GREEN}✓ Versions already in data/versions${NC}"
fi

echo ""
echo "=========================================="

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}DRY RUN COMPLETE - No changes were made${NC}"
    echo "Run without --dry-run to perform the migration."
else
    echo -e "${GREEN}MIGRATION COMPLETE${NC}"
    echo ""
    echo "Old directories have been backed up with .backup-TIMESTAMP suffix."
    echo "You can delete them once you've verified the migration worked:"
    echo ""
    ls -d *.backup-* 2>/dev/null || echo "  (no backup directories found)"
    echo ""
    echo "To delete backups: rm -rf *.backup-*"
fi

echo ""
echo "New data structure:"
echo "  data/"
echo "  ├── pages/        - Wiki content"
echo "  ├── users/        - User accounts"
echo "  ├── attachments/  - File attachments"
echo "  ├── logs/         - Application logs"
echo "  ├── search-index/ - Search index"
echo "  ├── backups/      - Backup files"
echo "  ├── sessions/     - Session files"
echo "  └── versions/     - Page versions"
echo ""
