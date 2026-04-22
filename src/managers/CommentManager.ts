import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import BaseManager from './BaseManager';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';
import type { PageComment } from '../types/Comment';

export default class CommentManager extends BaseManager {
  private commentsDir: string = './data/comments';
  private enabled: boolean = true;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(): Promise<void> {
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (configManager) {
      this.enabled = configManager.getProperty('ngdpbase.comments.allow', true) as boolean;
      this.commentsDir = configManager.getResolvedDataPath(
        'ngdpbase.comments.storagedir',
        './data/comments'
      );
    }
    if (this.enabled) {
      fs.mkdirSync(this.commentsDir, { recursive: true });
      logger.debug('CommentManager initialized');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async getComments(pageUuid: string): Promise<PageComment[]> {
    const dir = path.join(this.commentsDir, pageUuid);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const comments: PageComment[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const comment = JSON.parse(raw) as PageComment;
        if (!comment.deleted) comments.push(comment);
      } catch {
        // skip corrupt files
      }
    }
    return comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async addComment(pageUuid: string, author: string, authorDisplayName: string, content: string): Promise<PageComment> {
    const id = randomUUID();
    const comment: PageComment = {
      id,
      pageUuid,
      author,
      authorDisplayName,
      content,
      createdAt: new Date().toISOString()
    };

    const dir = path.join(this.commentsDir, pageUuid);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(comment, null, 2), 'utf-8');
    this.invalidateHandlerCache(pageUuid);
    return comment;
  }

  async deleteComment(pageUuid: string, commentId: string, deletedBy: string): Promise<boolean> {
    const filePath = path.join(this.commentsDir, pageUuid, `${commentId}.json`);
    if (!fs.existsSync(filePath)) return false;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const comment = JSON.parse(raw) as PageComment;
    comment.deleted = true;
    comment.deletedBy = deletedBy;
    comment.deletedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(comment, null, 2), 'utf-8');
    this.invalidateHandlerCache(pageUuid);
    return true;
  }

  async getComment(pageUuid: string, commentId: string): Promise<PageComment | null> {
    const filePath = path.join(this.commentsDir, pageUuid, `${commentId}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as PageComment;
    } catch {
      return null;
    }
  }

  async shutdown(): Promise<void> {}
}
