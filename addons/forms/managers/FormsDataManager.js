'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionSchema = exports.FormDefinitionSchema = exports.FieldSchema = void 0;
exports.buildSubmissionValidator = buildSubmissionValidator;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
// ── Zod schemas ───────────────────────────────────────────────────────────────
exports.FieldSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['text', 'email', 'tel', 'textarea', 'date', 'time', 'dropdown', 'checkbox', 'hidden', 'section']),
    label: zod_1.z.string(),
    required: zod_1.z.boolean().default(false),
    description: zod_1.z.string().optional(),
    placeholder: zod_1.z.string().optional(),
    optionsSource: zod_1.z.string().optional(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    prefill: zod_1.z.string().optional(),
});
exports.FormDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[a-z0-9-]+$/, 'Form id must be lowercase alphanumeric with hyphens'),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    handler: zod_1.z.string().optional(),
    proxySubmission: zod_1.z.boolean().default(false),
    notifyRole: zod_1.z.string().default('admin'),
    confirmationUrl: zod_1.z.string().optional(),
    fields: zod_1.z.array(exports.FieldSchema).min(1),
});
exports.SubmissionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    formId: zod_1.z.string(),
    submittedAt: zod_1.z.string(),
    submittedBy: zod_1.z.string(),
    onBehalfOf: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }).optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    status: zod_1.z.enum(['pending', 'processed', 'rejected']).default('pending'),
    handlerResult: zod_1.z.unknown().optional(),
    notes: zod_1.z.string().optional(),
});
// ── Validator builder ─────────────────────────────────────────────────────────
function buildSubmissionValidator(form) {
    const shape = {};
    for (const field of form.fields) {
        if (field.type === 'hidden' || field.type === 'section')
            continue;
        let rule;
        if (field.type === 'email') {
            rule = zod_1.z.string().email(`${field.label} must be a valid email`);
        } else if (field.type === 'tel') {
            rule = zod_1.z.string().min(7, `${field.label} must be at least 7 characters`);
        } else if (field.type === 'checkbox') {
            rule = zod_1.z.union([zod_1.z.literal('on'), zod_1.z.literal('true'), zod_1.z.literal('1')]);
        } else {
            rule = field.required
                ? zod_1.z.string().min(1, `${field.label} is required`)
                : zod_1.z.string();
        }
        if (!field.required)
            rule = rule.optional().or(zod_1.z.literal(''));
        shape[field.name] = rule;
    }
    return zod_1.z.object(shape);
}
// ── FormsDataManager ──────────────────────────────────────────────────────────
class FormsDataManager {
    dataPath;
    definitions = new Map();
    constructor(_engine, dataPath) {
        this.dataPath = dataPath;
    }
    async initialize() {
        await fs_1.promises.mkdir(path.join(this.dataPath, 'definitions'), { recursive: true });
        await fs_1.promises.mkdir(path.join(this.dataPath, 'submissions'), { recursive: true });
        await this.loadDefinitions();
    }
    async loadDefinitions() {
        const defsDir = path.join(this.dataPath, 'definitions');
        let files;
        try {
            files = (await fs_1.promises.readdir(defsDir)).filter(f => f.endsWith('.json'));
        }
        catch {
            return;
        }
        for (const file of files) {
            try {
                const raw = await fs_1.promises.readFile(path.join(defsDir, file), 'utf8');
                const json = JSON.parse(raw);
                const result = exports.FormDefinitionSchema.safeParse(json);
                if (!result.success) {
                    console.warn(`[FormsDataManager] Invalid form definition ${file}:`, result.error.format());
                    continue;
                }
                this.definitions.set(result.data.id, result.data);
            }
            catch (err) {
                console.warn(`[FormsDataManager] Failed to load definition ${file}:`, err.message);
            }
        }
        console.info(`[FormsDataManager] Loaded ${this.definitions.size} form definition(s)`);
    }
    getDefinition(formId) {
        return this.definitions.get(formId);
    }
    getAllDefinitions() {
        return Array.from(this.definitions.values());
    }
    async saveSubmission(submission) {
        const full = {
            ...submission,
            id: submission.id ?? (0, uuid_1.v4)(),
            status: submission.status ?? 'pending',
        };
        const dir = path.join(this.dataPath, 'submissions', full.formId);
        await fs_1.promises.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, `${full.id}.json`);
        const tmp = `${filePath}.tmp`;
        await fs_1.promises.writeFile(tmp, JSON.stringify(full, null, 2), 'utf8');
        await fs_1.promises.rename(tmp, filePath);
        return full;
    }
    async getSubmissions(formId) {
        const subsDir = path.join(this.dataPath, 'submissions');
        const submissions = [];
        try {
            const formDirs = formId
                ? [formId]
                : await fs_1.promises.readdir(subsDir);
            for (const fid of formDirs) {
                const dir = path.join(subsDir, fid);
                try {
                    const stat = await fs_1.promises.stat(dir);
                    if (!stat.isDirectory())
                        continue;
                    const files = (await fs_1.promises.readdir(dir)).filter(f => f.endsWith('.json'));
                    for (const file of files) {
                        try {
                            const raw = await fs_1.promises.readFile(path.join(dir, file), 'utf8');
                            const parsed = JSON.parse(raw);
                            submissions.push(parsed);
                        }
                        catch { /* skip corrupt files */ }
                    }
                }
                catch { /* skip missing dirs */ }
            }
        }
        catch { /* no submissions dir yet */ }
        return submissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }
    async updateStatus(submissionId, formId, status, notes) {
        const filePath = path.join(this.dataPath, 'submissions', formId, `${submissionId}.json`);
        try {
            const raw = await fs_1.promises.readFile(filePath, 'utf8');
            const submission = JSON.parse(raw);
            submission.status = status;
            if (notes !== undefined)
                submission.notes = notes;
            const tmp = `${filePath}.tmp`;
            await fs_1.promises.writeFile(tmp, JSON.stringify(submission, null, 2), 'utf8');
            await fs_1.promises.rename(tmp, filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async getSubmissionCount(formId) {
        const dir = path.join(this.dataPath, 'submissions', formId);
        try {
            const files = await fs_1.promises.readdir(dir);
            return files.filter(f => f.endsWith('.json')).length;
        }
        catch {
            return 0;
        }
    }
    async saveDefinition(form) {
        const filePath = path.join(this.dataPath, 'definitions', `${form.id}.json`);
        const tmp = `${filePath}.tmp`;
        await fs_1.promises.writeFile(tmp, JSON.stringify(form, null, 2), 'utf8');
        await fs_1.promises.rename(tmp, filePath);
        this.definitions.set(form.id, form);
    }
    async deleteDefinition(formId) {
        const filePath = path.join(this.dataPath, 'definitions', `${formId}.json`);
        try {
            await fs_1.promises.unlink(filePath);
            this.definitions.delete(formId);
            return true;
        }
        catch {
            return false;
        }
    }
    async reloadDefinition(formId) {
        const filePath = path.join(this.dataPath, 'definitions', `${formId}.json`);
        try {
            const raw = await fs_1.promises.readFile(filePath, 'utf8');
            const json = JSON.parse(raw);
            const result = exports.FormDefinitionSchema.safeParse(json);
            if (!result.success) {
                console.warn(`[FormsDataManager] Invalid form definition ${formId}.json:`, result.error.format());
                return undefined;
            }
            this.definitions.set(result.data.id, result.data);
            return result.data;
        }
        catch {
            return undefined;
        }
    }
}
exports.default = FormsDataManager;
//# sourceMappingURL=FormsDataManager.js.map