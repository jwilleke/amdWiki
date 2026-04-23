'use strict';

import * as path from 'path';
import { promises as fsp } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const FieldSchema = z.object({
  name:          z.string(),
  type:          z.enum(['text', 'email', 'tel', 'textarea', 'date', 'time', 'dropdown', 'checkbox', 'hidden', 'section']),
  label:         z.string(),
  required:      z.boolean().default(false),
  description:   z.string().optional(),
  placeholder:   z.string().optional(),
  optionsSource: z.string().optional(),
  options:       z.array(z.string()).optional(),
  prefill:       z.string().optional()
});

export const FormDefinitionSchema = z.object({
  id:              z.string().regex(/^[a-z0-9-]+$/, 'Form id must be lowercase alphanumeric with hyphens'),
  title:           z.string(),
  description:     z.string().optional(),
  handler:         z.string().optional(),
  proxySubmission: z.boolean().default(false),
  notifyRole:      z.string().default('admin'),
  confirmationUrl: z.string().optional(),
  fields:          z.array(FieldSchema).min(1)
});

export type FormField      = z.infer<typeof FieldSchema>;
export type FormDefinition = z.infer<typeof FormDefinitionSchema>;

export const SubmissionSchema = z.object({
  id:          z.string(),
  formId:      z.string(),
  submittedAt: z.string(),
  submittedBy: z.string(),
  onBehalfOf:  z.object({
    name:    z.string().optional(),
    email:   z.string().optional(),
    phone:   z.string().optional(),
    address: z.string().optional()
  }).optional(),
  data:          z.record(z.string(), z.unknown()),
  status:        z.enum(['pending', 'processed', 'rejected']).default('pending'),
  handlerResult: z.unknown().optional(),
  notes:         z.string().optional()
});

export type FormSubmission   = z.infer<typeof SubmissionSchema>;
export type SubmissionStatus = 'pending' | 'processed' | 'rejected';

// ── Validator builder ─────────────────────────────────────────────────────────

export function buildSubmissionValidator(form: FormDefinition): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of form.fields) {
    if (field.type === 'hidden' || field.type === 'section') continue;
    let rule: z.ZodTypeAny;
    if (field.type === 'email') {
      rule = z.string().email(`${field.label} must be a valid email`);
    } else if (field.type === 'tel') {
      rule = z.string().min(7, `${field.label} must be at least 7 characters`);
    } else if (field.type === 'checkbox') {
      rule = z.union([z.literal('on'), z.literal('true'), z.literal('1')]);
    } else {
      rule = field.required
        ? z.string().min(1, `${field.label} is required`)
        : z.string();
    }
    if (!field.required) rule = rule.optional().or(z.literal(''));
    shape[field.name] = rule;
  }
  return z.object(shape);
}

// ── FormsDataManager ──────────────────────────────────────────────────────────

export default class FormsDataManager {
  private dataPath: string;
  private definitions: Map<string, FormDefinition> = new Map();

  constructor(_engine: unknown, dataPath: string) {
    this.dataPath = dataPath;
  }

  async initialize(): Promise<void> {
    await fsp.mkdir(path.join(this.dataPath, 'definitions'), { recursive: true });
    await fsp.mkdir(path.join(this.dataPath, 'submissions'), { recursive: true });
    await this.loadDefinitions();
  }

  private async loadDefinitions(): Promise<void> {
    const defsDir = path.join(this.dataPath, 'definitions');
    let files: string[];
    try {
      files = (await fsp.readdir(defsDir)).filter(f => f.endsWith('.json'));
    } catch {
      return;
    }

    for (const file of files) {
      try {
        const raw = await fsp.readFile(path.join(defsDir, file), 'utf8');
        const json: unknown = JSON.parse(raw);
        const result = FormDefinitionSchema.safeParse(json);
        if (!result.success) {
          console.warn(`[FormsDataManager] Invalid form definition ${file}:`, result.error.format());
          continue;
        }
        this.definitions.set(result.data.id, result.data);
      } catch (err) {
        console.warn(`[FormsDataManager] Failed to load definition ${file}:`, (err as Error).message);
      }
    }
    console.info(`[FormsDataManager] Loaded ${this.definitions.size} form definition(s)`);
  }

  getDefinition(formId: string): FormDefinition | undefined {
    return this.definitions.get(formId);
  }

  getAllDefinitions(): FormDefinition[] {
    return Array.from(this.definitions.values());
  }

  async saveSubmission(submission: Omit<FormSubmission, 'id'> & { id?: string }): Promise<FormSubmission> {
    const full: FormSubmission = {
      ...submission,
      id: submission.id ?? uuidv4(),
      status: submission.status ?? 'pending'
    };

    const dir = path.join(this.dataPath, 'submissions', full.formId);
    await fsp.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${full.id}.json`);
    const tmp = `${filePath}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(full, null, 2), 'utf8');
    await fsp.rename(tmp, filePath);
    return full;
  }

  async getSubmissions(formId?: string): Promise<FormSubmission[]> {
    const subsDir = path.join(this.dataPath, 'submissions');
    const submissions: FormSubmission[] = [];

    try {
      const formDirs = formId
        ? [formId]
        : await fsp.readdir(subsDir);

      for (const fid of formDirs) {
        const dir = path.join(subsDir, fid);
        try {
          const stat = await fsp.stat(dir);
          if (!stat.isDirectory()) continue;
          const files = (await fsp.readdir(dir)).filter(f => f.endsWith('.json'));
          for (const file of files) {
            try {
              const raw = await fsp.readFile(path.join(dir, file), 'utf8');
              const parsed = JSON.parse(raw) as FormSubmission;
              submissions.push(parsed);
            } catch { /* skip corrupt files */ }
          }
        } catch { /* skip missing dirs */ }
      }
    } catch { /* no submissions dir yet */ }

    return submissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async updateStatus(submissionId: string, formId: string, status: SubmissionStatus, notes?: string): Promise<boolean> {
    const filePath = path.join(this.dataPath, 'submissions', formId, `${submissionId}.json`);
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const submission = JSON.parse(raw) as FormSubmission;
      submission.status = status;
      if (notes !== undefined) submission.notes = notes;
      const tmp = `${filePath}.tmp`;
      await fsp.writeFile(tmp, JSON.stringify(submission, null, 2), 'utf8');
      await fsp.rename(tmp, filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getSubmissionCount(formId: string): Promise<number> {
    const dir = path.join(this.dataPath, 'submissions', formId);
    try {
      const files = await fsp.readdir(dir);
      return files.filter(f => f.endsWith('.json')).length;
    } catch {
      return 0;
    }
  }
}
