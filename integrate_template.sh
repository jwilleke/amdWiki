#!/bin/bash

# This script integrates the project template into the current directory.
# It should be run from within an existing project folder.
#
# Usage:
#   ./integrate_template.sh                           # Integrate from current template directory
#   ./integrate_template.sh <github-url>              # Clone and integrate from GitHub
#   ./integrate_template.sh <github-url> <dest-dir>   # Clone and integrate to specific directory

# If a GitHub URL is provided as the first argument, clone it.
if [ -n "$1" ]; then
  REPO_URL="$1"
  TEMP_DIR=$(mktemp -d)
  echo "Cloning repository from $REPO_URL to $TEMP_DIR..."
  git clone "$REPO_URL" "$TEMP_DIR"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to clone repository."
    rm -rf "$TEMP_DIR"
    exit 1
  fi
  TEMPLATE_DIR="$TEMP_DIR"
  CLEANUP_TEMP_DIR=true
else
  TEMPLATE_DIR="$(dirname "$0")"
  CLEANUP_TEMP_DIR=false
fi

# Determine the destination directory
if [ -n "$2" ]; then
  DEST_DIR="$2"
else
  DEST_DIR="$(pwd)"
fi

# Ensure the destination directory exists
mkdir -p "$DEST_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to create destination directory $DEST_DIR."
  if [ "$CLEANUP_TEMP_DIR" = true ]; then
    rm -rf "$TEMP_DIR"
  fi
  exit 1
fi


echo "Integrating template from: $TEMPLATE_DIR"
echo "Into current directory: $DEST_DIR"

# Categorize files: overwritten and new
ALL_TEMPLATE_FILES=()
for file in "$TEMPLATE_DIR"/*; do
  BASENAME=$(basename "$file")
  if [ "$BASENAME" != "integrate_template.sh" ]; then
    ALL_TEMPLATE_FILES+=("$BASENAME")
  fi
done

OVERWRITTEN_FILES=()
NEW_FILES=()
for file in "${ALL_TEMPLATE_FILES[@]}"; do
  if [ -e "$DEST_DIR/$file" ]; then
    OVERWRITTEN_FILES+=("$file")
  else
    NEW_FILES+=("$file")
  fi
done

echo ""
if [ ${#OVERWRITTEN_FILES[@]} -gt 0 ]; then
  echo "Warning: The following files in the destination directory will be overwritten:"
  for file in "${OVERWRITTEN_FILES[@]}"; do
    echo "- $file"
  done
fi

if [ ${#NEW_FILES[@]} -gt 0 ]; then
  echo "Info: The following new files will be copied to the destination directory:"
  for file in "${NEW_FILES[@]}"; do
    echo "- $file"
  done
fi

if [ ${#OVERWRITTEN_FILES[@]} -gt 0 ] || [ ${#NEW_FILES[@]} -gt 0 ]; then
  echo "\nChoose an action:"
  echo "  [C]ancel integration"
  echo "  [N]ormal copy (copy new files, skip existing)"
  echo "  [O]verwrite all (copy all files, overwrite existing)"
  read -p "Enter your choice (C/N/O): " -n 1 -r
  echo

  case "$REPLY" in
    [Cc] )
      echo "Integration cancelled."
      if [ "$CLEANUP_TEMP_DIR" = true ]; then
        rm -rf "$TEMP_DIR"
      fi
      exit 1
      ;;
    [Nn] )
      echo "Proceeding with normal copy (copying new files, skipping existing)."
      # Copy only new files
      # Use rsync with --ignore-existing to not overwrite
      rsync -av --ignore-existing \
        --exclude="integrate_template.sh" \
        --exclude=".git" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude=".env" \
        "$TEMPLATE_DIR/" "$DEST_DIR"
      ;;
    [Oo] )
      echo "Proceeding to overwrite all files."
      # Overwrite all files
      rsync -av \
        --exclude="integrate_template.sh" \
        --exclude=".git" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude=".env" \
        "$TEMPLATE_DIR/" "$DEST_DIR"
      ;;
    * )
      echo "Invalid choice. Integration cancelled."
      if [ "$CLEANUP_TEMP_DIR" = true ]; then
        rm -rf "$TEMP_DIR"
      fi
      exit 1
      ;;
  esac
else
  echo "No template files to integrate."
fi

echo "\nProject template integrated successfully!"

# Clean up temporary directory if it was created
if [ "$CLEANUP_TEMP_DIR" = true ]; then
  echo "Cleaning up temporary directory: $TEMP_DIR"
  rm -rf "$TEMP_DIR"
fi

echo ""
echo "==================================================================="
echo "Next Steps:"
echo "==================================================================="
echo ""
echo "1. Install dependencies:"
echo "   cd $DEST_DIR"
echo "   npm install"
echo ""
echo "2. Update project-specific values:"
echo "   - Edit .env.example and create .env with your values"
echo "   - Update AGENTS.md:"
echo "     - Set PROJECT_NAME in Context Overview"
echo "     - Update project_state, last_updated in YAML frontmatter"
echo "     - Add your project description"
echo "     - Update Architecture & Tech Stack section"
echo "   - Update package.json:"
echo "     - name, version, description, author, license"
echo "   - Update README.md with project-specific information"
echo ""
echo "3. Verify setup:"
echo "   npm run lint          # Check code and markdown quality"
echo "   npm run typecheck     # Verify TypeScript configuration"
echo "   npm run build         # Test build process"
echo ""
echo "4. Initialize git hooks (if not already done):"
echo "   npm run prepare       # Sets up Husky pre-commit hooks"
echo ""
echo "5. Review documentation:"
echo "   - CODE_STANDARDS.md - Coding standards and guiding principles"
echo "   - ARCHITECTURE.md - Update with your architecture"
echo "   - SECURITY.md - Review security practices"
echo ""
echo "==================================================================="
