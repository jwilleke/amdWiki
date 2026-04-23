
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import BaseManager from '../../../dist/src/managers/BaseManager.js';
import type { WikiEngine } from '../../../dist/src/types/WikiEngine.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  body: string;
}

// ── Built-in defaults ─────────────────────────────────────────────────────────

const BUILTIN_TEMPLATES: JournalTemplate[] = [
  {
    id: 'free-write',
    name: 'Free Write',
    description: 'Blank page — write whatever comes to mind.',
    body: ''
  },
  {
    id: 'morning-reflection',
    name: 'Morning Reflection',
    description: 'Gratitude and intentions to start the day.',
    body: `## Morning Reflection

### I'm grateful for…
1.
2.
3.

### My intention for today
_What's the one thing that would make today a success?_

### Today's focus
-

### How I'm feeling
`
  },
  {
    id: 'evening-review',
    name: 'Evening Review',
    description: 'Wins, lessons learned, and tomorrow\'s focus.',
    body: `## Evening Review

### Wins today
-

### What I learned
-

### What I'd do differently
-

### Tomorrow's focus
_One thing I want to accomplish tomorrow:_

`
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    description: 'Reflect on the past week and set goals for the next.',
    body: `## Weekly Review — Week of {{date}}

### Highlights this week
-

### Challenges I faced
-

### Lessons learned
-

### Goals for next week
1.
2.
3.

### Overall mood this week


`
  }
];

// ── Manager ───────────────────────────────────────────────────────────────────

class JournalTemplateManager extends BaseManager {
  private templateDir: string;
  private templates: Map<string, JournalTemplate>;

  readonly description = 'Journal writing-prompt template manager';

  constructor(engine: WikiEngine, dataPath: string) {
    super(engine);
    this.templateDir = path.join(dataPath, 'templates');
    this.templates = new Map();
  }

  async initialize(): Promise<void> {
    // Seed built-in templates first
    for (const t of BUILTIN_TEMPLATES) {
      this.templates.set(t.id, t);
    }

    // Load any custom templates from dataPath/templates/*.md
    if (!existsSync(this.templateDir)) {
      try { mkdirSync(this.templateDir, { recursive: true }); } catch { /* ok */ }
      return;
    }

    let files: string[];
    try {
      files = readdirSync(this.templateDir).filter(f => f.endsWith('.md'));
    } catch {
      return;
    }

    for (const file of files) {
      try {
        const raw  = await readFile(path.join(this.templateDir, file), 'utf8');
        const tmpl = this.parseTemplateFile(file, raw);
        if (tmpl) this.templates.set(tmpl.id, tmpl);
      } catch {
        // Skip unreadable files
      }
    }
  }

  listTemplates(): JournalTemplate[] {
    return [...this.templates.values()];
  }

  getTemplate(id: string): JournalTemplate | undefined {
    return this.templates.get(id);
  }

  count(): number {
    return this.templates.size;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Parse a markdown file with optional YAML-like header comments into a template. */
  private parseTemplateFile(filename: string, raw: string): JournalTemplate | null {
    const id   = filename.replace(/\.md$/, '');
    let name   = id;
    let desc   = '';
    let body   = raw;

    // Support simple frontmatter: <!-- name: ...\ndescription: ... -->
    const fmMatch = raw.match(/^<!--\s*([\s\S]*?)-->\s*/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const nameMatch = fm.match(/^name:\s*(.+)$/m);
      const descMatch = fm.match(/^description:\s*(.+)$/m);
      if (nameMatch) name = nameMatch[1].trim();
      if (descMatch) desc = descMatch[1].trim();
      body = raw.slice(fmMatch[0].length);
    }

    return { id, name, description: desc, body };
  }
}

export default JournalTemplateManager;
