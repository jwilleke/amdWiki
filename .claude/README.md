# Claude MCP Commands

This directory contains Model Context Protocol (MCP) configuration and custom commands for Claude integration with this project.

## Overview

MCP (Model Context Protocol) allows Claude to quickly access project context through custom slash commands. These commands provide quick access to important project information without needing to manually read files each session.

## Files

- **`mcp.json`** - MCP server configuration (currently empty, ready for extension)
- **`commands/`** - Directory containing command definitions

## Available Commands

### `/context`

**File:** `commands/context.md`

Reads and summarizes the AGENTS.md file to get the current project state.

**What it shows:**

- Project name, description, and goals
- Current progress and status
- Architecture and technology stack
- Known blockers or issues
- TODO items and next priorities

**When to use:** At the start of each session to understand what's been done and what needs attention.

**Example usage:**

```
/context
```

### `/check-todos`

**File:** `commands/check-todos.md`

Displays actionable work items organized by priority level.

**What it shows:**

- High priority tasks (should start here)
- Medium priority tasks (important but not blocking)
- Low priority tasks (nice to have)
- Known blockers preventing progress

**When to use:** To decide what to work on in the current session and focus effort appropriately.

**Example usage:**

```
/check-todos
```

### `/update-agents`

**File:** `commands/update-agents.md`

Reminds you to update AGENTS.md with your session's progress.

**What it helps document:**

- Work completed this session
- Files modified
- Decisions made
- New blockers discovered
- Recommended next steps

**When to use:** At the end of a session to document progress for the next agent or human contributor.

**Example usage:**

```
/update-agents
```

## Typical Workflow

1. **Start session:** Use `/context` to understand project state
2. **Check priorities:** Use `/check-todos` to pick what to work on
3. **Work on tasks:** Complete your assigned work, following CODE_STANDARDS.md
4. **End session:** Use `/update-agents` to document progress in AGENTS.md

## Extending MCP

To add new commands:

1. Create a new `.md` file in the `commands/` directory
2. Name it descriptively (e.g., `setup-env.md`)
3. Follow the format of existing commands:
   - Clear title/description
   - Explain what information it provides
   - Show when to use it
   - Include usage example

4. Update `mcp.json` if you need to connect it to actual MCP servers

## Notes

- Commands are currently documentation-based slash commands you invoke in Claude
- The `mcp.json` file is pre-configured but empty, ready for future MCP server integration
- These commands provide quick access to context without context window overhead
- Always run `/context` at the start of a new session with Claude to stay synchronized with other agents' work

## See Also

- [AGENTS.md](../AGENTS.md) - The source of truth for project context
- [CODE_STANDARDS.md](../CODE_STANDARDS.md) - Coding guidelines
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution workflow
