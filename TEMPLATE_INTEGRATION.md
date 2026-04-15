# Template Integration Guide

This guide explains how to apply this project template to your existing or new projects.

## What Gets Integrated

The integration script applies all improvements from this template:

- **Documentation standards** (DRY principle, Single Source of Truth)
- **Agent Context Protocol** (YAML frontmatter, priority matrix)
- **Markdownlint enforcement** (MD036 rule, consistent formatting)
- **Complete package.json** with all quality tooling
- **Config files** (eslint.config.mjs, .prettierrc.json, .markdownlint.json, tsconfig.json)
- **Pre-commit hooks** (Husky with code + markdown linting)
- **Documentation templates** (AGENTS.md, CODE_STANDARDS.md, etc.)

## Integration Methods

### Method 1: Integrate into Existing Project

Apply template to your current project directory:

```bash
# Navigate to your project
cd /path/to/your/project

# Clone this template
git clone https://github.com/jwilleke/mjs-project-template /tmp/template

# Run integration script
/tmp/template/integrate_template.sh /tmp/template

# Choose option:
# [N] Normal copy - Only add new files, skip existing (RECOMMENDED for existing projects)
# [O] Overwrite all - Replace all files (use with caution!)
# [C] Cancel
```

### Method 2: Integrate via GitHub URL

Automatically clone and integrate:

```bash
# Navigate to your project
cd /path/to/your/project

# Run with GitHub URL (script will clone automatically)
bash <(curl -s https://raw.githubusercontent.com/jwilleke/mjs-project-template/master/integrate_template.sh) \
  https://github.com/jwilleke/mjs-project-template
```

### Method 3: New Project from Template

Start a new project with the template:

```bash
# Clone the template
git clone https://github.com/jwilleke/mjs-project-template my-new-project

# Navigate to new project
cd my-new-project

# Remove template's git history
rm -rf .git

# Initialize your own git repo
git init
git add .
git commit -m "Initial commit from template"
```

## Integration Options Explained

When running the script, you'll see three options:

### [N] Normal Copy (Safe for existing projects)

- **Copies:** Only NEW files that don't exist in your project
- **Skips:** All existing files (won't overwrite your code)
- **Use when:** Adding template to existing project with custom code
- **Safe:** Yes - won't touch your existing files
- **⚠️ Limitation:** You'll miss new sections added to existing files (like AGENTS.md improvements)

### [O] Overwrite All (Destructive!)

- **Copies:** ALL template files
- **Overwrites:** Any existing files with same names
- **Use when:** You want to completely reset to template standards
- **Safe:** No - destroys custom content!
- **⚠️ Warning:** You'll lose project-specific content in AGENTS.md, package.json, etc.

### [C] Cancel

- **Does:** Nothing
- **Use when:** You want to review what would change first

## BETTER OPTION: Smart Merge (Recommended for Existing Projects)

For existing projects with custom content in AGENTS.md, package.json, etc., use the **smart merge** utility:

```bash
# Step 1: Copy template to temp location
git clone https://github.com/jwilleke/mjs-project-template /tmp/template

# Step 2: Navigate to your project
cd /path/to/your/project

# Step 3: Install tools (one-time)
cd /tmp/template/tools
npm install

# Step 4: Run smart merge (dry-run first to preview)
npx ts-node merge-template.ts \
  --template-dir /tmp/template \
  --project-dir /path/to/your/project \
  --dry-run

# Step 5: Review changes, then run for real
npx ts-node merge-template.ts \
  --template-dir /tmp/template \
  --project-dir /path/to/your/project
```

### What Smart Merge Does

**For AGENTS.md:**

- ✅ Adds NEW sections: Agent Context Protocol, Priority Matrix, Known Limitations
- ✅ Keeps EXISTING content: Your project name, description, custom sections
- ✅ Updates YAML frontmatter: Merges intelligently
- ✅ Preserves custom sections: Any sections you added

**For package.json:**

- ✅ Adds NEW scripts: lint:md, lint:md:fix, typecheck
- ✅ Adds NEW dependencies: markdownlint-cli, husky
- ✅ Keeps YOUR metadata: name, version, description, author
- ✅ Merges dependencies: Combines template + your existing deps

**Example:**

```markdown
<!-- Your existing AGENTS.md -->
# Project Context

## Context Overview
- Project Name: my-awesome-app          ← KEPT
- Description: My custom description    ← KEPT

## Our Custom Section                    ← KEPT
Custom content here

<!-- After smart merge -->
---
project_state: "active"                  ← ADDED (YAML)
last_updated: "2025-12-21"              ← ADDED (YAML)
---

# Project Context

## Agent Context Protocol                ← ADDED (New section)
...

## Context Overview
- Project Name: my-awesome-app          ← KEPT (Your content)
- Description: My custom description    ← KEPT (Your content)

## Agent Priority Matrix                 ← ADDED (New section)
...

## Our Custom Section                    ← KEPT (Your content)
Custom content here
```

## What Gets Excluded

The integration script automatically excludes:

- `.git/` - Your git history
- `node_modules/` - Dependencies (reinstall with npm install)
- `dist/` - Build output
- `.env` - Your environment secrets
- `integrate_template.sh` - The script itself

## After Integration

### 1. Install Dependencies

```bash
npm install
```

This installs:

- TypeScript, ESLint, Prettier
- markdownlint-cli (for documentation quality)
- Husky (for git hooks)
- All devDependencies from template

### 2. Update Project-Specific Values

#### AGENTS.md (YAML frontmatter)

```yaml
---
project_state: "active"              # Change from "template"
last_updated: "2025-12-21"          # Update to today
agent_priority_level: "high"         # Set based on urgency
blockers: ["waiting on API design"]  # Add your blockers
---
```

#### AGENTS.md (Context Overview)

```markdown
## Context Overview

- Project Name: `your-project-name`  # Update this
- Description: Your actual project description
```

#### package.json

```json
{
  "name": "your-project-name",        // Change this
  "version": "1.0.0",                 // Your version
  "description": "Your description",  // Your description
  "author": "Your Name",              // Your name
  "license": "MIT"                    // Your license
}
```

#### .env

```bash
# Copy example and customize
cp .env.example .env
# Edit .env with your actual values (never commit this!)
```

### 3. Verify Setup

```bash
# Check code quality (TypeScript + Markdown)
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Verify TypeScript configuration
npm run typecheck

# Test build (if applicable)
npm run build
```

### 4. Initialize Git Hooks

```bash
# Set up Husky pre-commit hooks
npm run prepare

# Now all commits will be checked for:
# - Code linting (ESLint)
# - Markdown linting (markdownlint)
# - TypeScript errors
```

### 5. Review and Customize Documentation

Update these files for your project:

- **ARCHITECTURE.md** - Document your actual architecture
- **SECURITY.md** - Review and customize security policies
- **README.md** - Add project-specific information
- **CONTRIBUTING.md** - Adjust workflow if needed

## Troubleshooting

### "npm: command not found"

Install Node.js v18+ from <https://nodejs.org/>

### "Husky - Git hooks failed"

```bash
# Reinstall git hooks
npx husky
```

### "Markdownlint errors"

```bash
# Auto-fix markdown issues
npm run lint:md:fix

# Some issues require manual fixes (like MD036 - bold as headings)
```

### Existing Files Conflict

If you get conflicts and want to review changes:

```bash
# Use git to see what would change
git diff AGENTS.md        # Compare specific file
git status                # See all changes
```

## Best Practices

### For Existing Projects with Custom Content

1. **Use Smart Merge** - Intelligently combines template + your content
2. **Run with --dry-run first** - Preview changes before applying
3. **Review backups** - Smart merge creates .backup files
4. **Test thoroughly** - Run `npm run lint` after merge

### For Existing Projects (Simple/New)

1. **Use Normal Copy [N]** - If you have minimal custom content
2. **Review new files** before committing
3. **Manually update** key files like AGENTS.md if needed
4. **Test thoroughly** after integration

### For New Projects

1. **Clone template directly** (Method 3)
2. **Update all project-specific values**
3. **Delete unused files** (if any)
4. **Start coding** with best practices built-in

### For Team Projects

1. **Create feature branch** for integration
2. **Review changes** with team
3. **Update docs together** to match your workflow
4. **Merge after approval**

## What You Get

After successful integration:

✅ **Complete documentation framework** (DRY, SSoT, Agent Context Protocol)
✅ **Quality enforcement** (ESLint, Prettier, Markdownlint)
✅ **Pre-commit hooks** (Automatic checking before commits)
✅ **TypeScript strict mode** (Catch errors at compile time)
✅ **Markdown linting** (MD036 enforced - no bold as headings)
✅ **Agent-friendly context** (Machine-readable metadata)
✅ **Model-agnostic guidance** (Works with any AI assistant)
✅ **Production-ready setup** (All tooling configured)

## Support

Issues with integration?

1. Check this guide first
2. Review [AGENTS.md](./AGENTS.md) for template structure
3. See [CODE_STANDARDS.md](./CODE_STANDARDS.md) for linting rules
4. Check [README.md](./README.md#quick-start) for setup

## Example Integration

Here's a complete example of integrating into an existing project:

```bash
# Step 1: Navigate to your project
cd ~/projects/my-app

# Step 2: Back up important files (optional but recommended)
cp AGENTS.md AGENTS.md.backup 2>/dev/null || true

# Step 3: Run integration
bash <(curl -s https://raw.githubusercontent.com/jwilleke/mjs-project-template/master/integrate_template.sh) \
  https://github.com/jwilleke/mjs-project-template

# Step 4: Choose option
# Enter: N (normal copy)

# Step 5: Install dependencies
npm install

# Step 6: Update project values
# Edit AGENTS.md, package.json, .env

# Step 7: Verify
npm run lint
npm run typecheck

# Step 8: Commit changes
git add .
git commit -m "feat: integrate project template

- Add DRY documentation framework
- Add Agent Context Protocol
- Add markdown linting enforcement
- Add pre-commit hooks for quality checks

Applied template from: https://github.com/jwilleke/mjs-project-template"
```

Now your project has all the template improvements!
