import { randomUUID } from 'crypto';
import BaseManager from './BaseManager';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';

/**
 * A job type that can be registered with the BackgroundJobManager.
 */
export interface JobDefinition {
  /** Unique job type ID, e.g. 'pages.reindex' */
  id: string;
  /** Human-readable name shown in UI and notifications */
  displayName: string;
  /** The work to perform. Resolves with a JobResult. */
  run: () => Promise<JobResult>;
}

/**
 * Result returned by a completed job run.
 */
export interface JobResult {
  success: boolean;
  /** e.g. "Scanned 14 327 files, added 12, updated 3" */
  summary?: string;
  error?: string;
}

/**
 * State of a single job run instance.
 */
export interface JobRun {
  runId: string;
  jobId: string;
  displayName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  result?: JobResult;
}

/**
 * BackgroundJobManager — async long-running admin operations.
 *
 * Managers and plugins register job types at startup via registerJob().
 * Callers enqueue a job by ID; the job runs in the background and the
 * caller can poll getStatus(runId) for progress.
 *
 * Only one instance of a given jobId runs at a time — duplicate enqueue
 * returns the existing runId.
 *
 * On completion, a system notification is posted via NotificationManager.
 */
class BackgroundJobManager extends BaseManager {
  /** Registered job types, keyed by jobId */
  private jobs: Map<string, JobDefinition> = new Map();

  /** All run records (completed runs are kept for status polling) */
  private runs: Map<string, JobRun> = new Map();

  /** Maps jobId → runId for currently active (pending/running) runs */
  private activeByJobId: Map<string, string> = new Map();

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);
    logger.info('BackgroundJobManager initialized');
  }

  /**
   * Register a job type. Called at startup by managers and plugins.
   */
  registerJob(def: JobDefinition): void {
    if (this.jobs.has(def.id)) {
      logger.warn(`[BackgroundJobManager] Job '${def.id}' already registered — overwriting`);
    }
    this.jobs.set(def.id, def);
    logger.debug(`[BackgroundJobManager] Registered job: ${def.id} (${def.displayName})`);
  }

  /**
   * Enqueue a job by ID. Returns the runId immediately.
   * If the job is already pending/running, returns the existing runId.
   *
   * @throws Error if jobId is not registered
   */
  async enqueue(jobId: string): Promise<string> {
    const existingRunId = this.activeByJobId.get(jobId);
    if (existingRunId) {
      const existing = this.runs.get(existingRunId);
      if (existing && (existing.status === 'pending' || existing.status === 'running')) {
        logger.info(`[BackgroundJobManager] Job '${jobId}' already active (${existingRunId}) — returning existing runId`);
        return existingRunId;
      }
    }

    const def = this.jobs.get(jobId);
    if (!def) {
      throw new Error(`BackgroundJobManager: unknown job '${jobId}'`);
    }

    const runId = randomUUID();
    const run: JobRun = {
      runId,
      jobId,
      displayName: def.displayName,
      status: 'pending',
      startedAt: new Date()
    };
    this.runs.set(runId, run);
    this.activeByJobId.set(jobId, runId);

    // Fire and forget — caller polls via getStatus()
    void this.executeJob(def, run);

    return runId;
  }

  /**
   * Get the current state of a run by runId.
   * Returns null if the runId is unknown.
   */
  getStatus(runId: string): JobRun | null {
    return this.runs.get(runId) ?? null;
  }

  /**
   * Get all currently pending or running jobs.
   */
  getActiveJobs(): JobRun[] {
    const active: JobRun[] = [];
    for (const runId of this.activeByJobId.values()) {
      const run = this.runs.get(runId);
      if (run) active.push(run);
    }
    return active;
  }

  /**
   * Get all registered job IDs.
   */
  getRegisteredJobIds(): string[] {
    return Array.from(this.jobs.keys());
  }

  private async executeJob(def: JobDefinition, run: JobRun): Promise<void> {
    run.status = 'running';
    const startMs = Date.now();
    logger.info(`[BackgroundJobManager] job.started { jobId: "${def.id}", runId: "${run.runId}", displayName: "${def.displayName}" }`);

    try {
      const result = await def.run();
      const durationMs = Date.now() - startMs;
      run.completedAt = new Date();
      run.result = result;

      if (result.success) {
        run.status = 'completed';
        logger.info(`[BackgroundJobManager] job.completed { jobId: "${def.id}", runId: "${run.runId}", durationMs: ${durationMs}, summary: "${result.summary ?? ''}" }`);
        await this.sendNotification('info', `${def.displayName} complete`, result.summary ?? 'Job completed successfully');
      } else {
        run.status = 'failed';
        logger.warn(`[BackgroundJobManager] job.failed { jobId: "${def.id}", runId: "${run.runId}", durationMs: ${durationMs}, error: "${result.error ?? ''}" }`);
        await this.sendNotification('error', `${def.displayName} failed`, result.error ?? 'Job failed');
      }
    } catch (err: unknown) {
      const durationMs = Date.now() - startMs;
      const message = err instanceof Error ? err.message : String(err);
      run.status = 'failed';
      run.result = { success: false, error: message };
      run.completedAt = new Date();
      logger.error(`[BackgroundJobManager] job.failed { jobId: "${def.id}", runId: "${run.runId}", durationMs: ${durationMs} }`, err);
      await this.sendNotification('error', `${def.displayName} failed`, message);
    } finally {
      this.activeByJobId.delete(def.id);
    }
  }

  private async sendNotification(
    level: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string
  ): Promise<void> {
    try {
      const notificationManager = this.engine.getManager<{ addNotification: (n: object) => Promise<string> }>('NotificationManager');
      if (notificationManager) {
        await notificationManager.addNotification({ type: 'system', title, message, level });
      }
    } catch (err) {
      logger.warn('[BackgroundJobManager] Failed to post notification:', err);
    }
  }

  async shutdown(): Promise<void> {
    const active = this.getActiveJobs();
    if (active.length > 0) {
      logger.warn(`[BackgroundJobManager] Shutting down with ${active.length} job(s) still active`);
    }
    await super.shutdown();
  }
}

export default BackgroundJobManager;
module.exports = BackgroundJobManager;
