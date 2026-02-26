import BaseManager from './BaseManager';
import logger from '../utils/logger';
import { promises as fs } from 'fs';
import path from 'path';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';

/**
 * Notification object structure
 */
export interface Notification {
  id: string;
  type: 'maintenance' | 'system' | 'user';
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  targetUsers: string[];
  createdAt: Date;
  expiresAt: Date | null;
  dismissedBy: string[];
}

/**
 * Input for creating a notification
 */
export interface NotificationInput {
  type?: 'maintenance' | 'system' | 'user';
  title?: string;
  message?: string;
  level?: 'info' | 'warning' | 'error' | 'success';
  targetUsers?: string[];
  expiresAt?: Date | null;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  active: number;
  expired: number;
  byType: Record<string, number>;
  byLevel: Record<string, number>;
}

/**
 * Maintenance configuration
 */
export interface MaintenanceConfig {
  [key: string]: unknown;
}

/**
 * Stored notifications data structure
 */
interface NotificationsData {
  lastSaved: string;
  notifications: Record<string, Notification>;
}

/**
 * NotificationManager - Handles system notifications and user alerts
 *
 * Manages user-facing notifications and system alerts with persistent storage.
 * Extends BaseManager following the modular manager pattern.
 *
 * @class NotificationManager
 * @extends BaseManager
 *
 * @property {Map<string, Notification>} notifications - Active notifications by ID
 * @property {number} notificationId - Auto-incrementing notification ID
 * @property {string|null} storagePath - Path to notifications storage file
 *
 * @see {@link BaseManager} for base functionality
 *
 * @example
 * const notificationManager = engine.getManager('NotificationManager');
 * notificationManager.addNotification({ title: 'Welcome!', level: 'info' });
 */
class NotificationManager extends BaseManager {
  private notifications: Map<string, Notification>;
  private notificationId: number;
  private storagePath: string | null;
  private saveInterval: NodeJS.Timeout | null;
  private logger: typeof logger;

  /**
   * Creates a new NotificationManager instance
   *
   * @constructor
   * @param {any} engine - The wiki engine instance
   */

  constructor(engine: WikiEngine) {
    super(engine);
    this.notifications = new Map();
    this.notificationId = 0;
    this.storagePath = null;
    this.saveInterval = null;
    this.logger = logger.child({ component: 'NotificationManager' });
  }

  /**
   * Initialize the notification manager
   *
   * @async
   * @param {Record<string, unknown>} [config={}] - Configuration object
   * @returns {Promise<void>}
   */
  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);
    this.logger = logger.child({ component: 'NotificationManager' });

    // Pull settings from ConfigurationManager (with safe fallbacks)
    const cfgMgr = this.engine?.getManager<ConfigurationManager>('ConfigurationManager');

    // Use getResolvedDataPath to support INSTANCE_DATA_FOLDER
    const dataDirAbs = cfgMgr?.getResolvedDataPath?.(
      'amdwiki.notifications.dir',
      './data/notifications'
    ) ?? path.resolve(process.cwd(), process.env.FAST_STORAGE || process.env.INSTANCE_DATA_FOLDER || './data', 'notifications');
    const fileNameCfg = (cfgMgr?.getProperty?.('amdwiki.notifications.file', 'notifications.json') as string | null) ?? 'notifications.json';
    const intervalCfg = Number(cfgMgr?.getProperty?.('amdwiki.notifications.autoSaveInterval') ?? 5 * 60 * 1000);

    // Build storage path from resolved directory
    this.storagePath = path.join(dataDirAbs, String(fileNameCfg));
    const intervalMs = Number.isFinite(Number(intervalCfg)) ? Number(intervalCfg) : 5 * 60 * 1000;

    // Ensure data directory exists
    const dataDirPath = path.dirname(this.storagePath);
    try {
      await fs.mkdir(dataDirPath, { recursive: true });
    } catch (error) {
      this.logger.warn('Failed to create data directory:', (error as Error).message);
    }

    // Load existing notifications
    await this.loadNotifications();

    // Set up periodic save
    if (this.saveInterval) clearInterval(this.saveInterval);
    this.saveInterval = setInterval(
      () => {
        void this.saveNotifications();
      },
      Math.max(1000, intervalMs)
    );

    this.logger.info(`NotificationManager initialized with persistence: path=${this.storagePath}, intervalMs=${Math.max(1000, intervalMs)}`);
  }

  /**
   * Load notifications from storage
   */
  private async loadNotifications(): Promise<void> {
    if (!this.storagePath) return;

    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      const notificationsData = JSON.parse(data) as NotificationsData;

      // Restore notifications from storage
      for (const [id, notification] of Object.entries(notificationsData.notifications || {})) {
        // Convert date strings back to Date objects
        if (notification.createdAt) {
          notification.createdAt = new Date(notification.createdAt);
        }
        if (notification.expiresAt) {
          notification.expiresAt = new Date(notification.expiresAt);
        }

        this.notifications.set(id, notification);

        // Update notification ID counter
        const idNum = parseInt(id.split('_')[1]);
        if (idNum > this.notificationId) {
          this.notificationId = idNum;
        }
      }

      this.logger.info(`Loaded ${this.notifications.size} notifications from storage`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.info('No existing notification storage file found, starting fresh');
      } else {
        this.logger.error('Failed to load notifications from storage:', (error as Error).message);
      }
    }
  }

  /**
   * Save notifications to storage
   */
  private async saveNotifications(): Promise<void> {
    if (!this.storagePath) return;

    try {
      const notificationsData: NotificationsData = {
        lastSaved: new Date().toISOString(),
        notifications: Object.fromEntries(this.notifications)
      };

      await fs.writeFile(this.storagePath, JSON.stringify(notificationsData, null, 2));
      this.logger.debug(`Saved ${this.notifications.size} notifications to storage`);
    } catch (error) {
      this.logger.error('Failed to save notifications to storage:', (error as Error).message);
    }
  }

  /**
   * Create a new notification
   * @param {NotificationInput} notification - Notification object
   * @param {string} notification.type - Type of notification (maintenance, system, user)
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.level - Severity level (info, warning, error, success)
   * @param {Array} notification.targetUsers - Array of usernames to notify (empty for all)
   * @param {Date} notification.expiresAt - When notification expires
   * @returns {Promise<string>} Notification ID
   */
  async createNotification(notification: NotificationInput): Promise<string> {
    const id = `notification_${++this.notificationId}`;
    const fullNotification: Notification = {
      id,
      type: notification.type || 'system',
      title: notification.title || 'System Notification',
      message: notification.message || '',
      level: notification.level || 'info',
      targetUsers: notification.targetUsers || [],
      createdAt: new Date(),
      expiresAt: notification.expiresAt || null,
      dismissedBy: []
    };

    this.notifications.set(id, fullNotification);

    this.logger.info(`Created notification: ${id}`, {
      type: fullNotification.type,
      level: fullNotification.level,
      title: fullNotification.title
    });

    // Save to storage
    await this.saveNotifications();

    return id;
  }

  /**
   * Add a notification (alias for createNotification for backward compatibility)
   * @param {NotificationInput} notification - Notification object
   * @returns {Promise<string>} Notification ID
   */
  async addNotification(notification: NotificationInput): Promise<string> {
    return this.createNotification(notification);
  }

  /**
   * Get notifications for a specific user
   * @param {string} username - Username to get notifications for
   * @param {boolean} includeExpired - Include expired notifications
   * @returns {Notification[]} Array of notifications
   */
  getUserNotifications(username: string, includeExpired: boolean = false): Notification[] {
    const now = new Date();
    const userNotifications: Notification[] = [];

    for (const notification of this.notifications.values()) {
      // Check if notification is expired
      if (!includeExpired && notification.expiresAt && notification.expiresAt < now) {
        continue;
      }

      // Check if notification is for this user or all users
      if (notification.targetUsers.length === 0 || notification.targetUsers.includes(username)) {
        // Check if user has dismissed this notification
        if (!notification.dismissedBy.includes(username)) {
          userNotifications.push(notification);
        }
      }
    }

    return userNotifications;
  }

  /**
   * Dismiss a notification for a user
   * @param {string} notificationId - Notification ID
   * @param {string} username - Username dismissing the notification
   * @returns {Promise<boolean>} Success status
   */
  async dismissNotification(notificationId: string, username: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    if (!notification.dismissedBy.includes(username)) {
      notification.dismissedBy.push(username);
      this.logger.info(`Notification ${notificationId} dismissed by ${username}`);

      // Save to storage
      await this.saveNotifications();
    }

    return true;
  }

  /**
   * Create maintenance mode notification
   * @param {boolean} enabled - Whether maintenance mode is enabled
   * @param {string} adminUsername - Admin who toggled maintenance mode
   * @param {MaintenanceConfig} config - Maintenance configuration
   * @returns {Promise<string>} Notification ID
   */
  async createMaintenanceNotification(enabled: boolean, adminUsername: string, _config: MaintenanceConfig = {}): Promise<string> {
    const title = enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled';
    const message = enabled ? `The system is now in maintenance mode. Regular users will see a maintenance page until it is disabled by ${adminUsername}.` : `Maintenance mode has been disabled by ${adminUsername}. The system is now fully accessible to all users.`;

    const level = enabled ? 'warning' : 'success';

    // Set expiration - maintenance notifications expire when mode changes
    const expiresAt = enabled ? null : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for disable notifications

    return await this.createNotification({
      type: 'maintenance',
      title,
      message,
      level,
      targetUsers: [], // All users
      expiresAt
    });
  }

  /**
   * Get all active notifications
   * @param {boolean} includeExpired - Include expired notifications
   * @returns {Notification[]} Array of all notifications
   */
  getAllNotifications(includeExpired: boolean = false): Notification[] {
    const now = new Date();
    const allNotifications: Notification[] = [];

    for (const notification of this.notifications.values()) {
      if (!includeExpired && notification.expiresAt && notification.expiresAt < now) {
        continue;
      }
      allNotifications.push(notification);
    }

    return allNotifications;
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<void> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} expired notifications`);

      // Save to storage after cleanup
      await this.saveNotifications();
    }
  }

  /**
   * Clear all active (non-expired) notifications
   * @returns {Promise<number>} Number of cleared notifications
   */
  async clearAllActive(): Promise<number> {
    const now = new Date();
    let clearedCount = 0;

    for (const [id, notification] of this.notifications.entries()) {
      // Only delete active notifications (not expired ones)
      if (!notification.expiresAt || notification.expiresAt >= now) {
        this.notifications.delete(id);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      this.logger.info(`Cleared ${clearedCount} active notifications`);

      // Save to storage after clearing
      await this.saveNotifications();
    }

    return clearedCount;
  }

  /**
   * Get notification statistics
   * @returns {NotificationStats} Statistics object
   */
  getStats(): NotificationStats {
    const now = new Date();
    let active = 0;
    let expired = 0;
    const byType: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    for (const notification of this.notifications.values()) {
      if (notification.expiresAt && notification.expiresAt < now) {
        expired++;
      } else {
        active++;
      }

      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byLevel[notification.level] = (byLevel[notification.level] || 0) + 1;
    }

    return {
      total: this.notifications.size,
      active,
      expired,
      byType,
      byLevel
    };
  }

  /**
   * Shutdown the notification manager
   */
  async shutdown(): Promise<void> {
    // Clear the save interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }

    // Final save
    await this.saveNotifications();

    this.logger.info('NotificationManager shutdown complete');
  }
}

export default NotificationManager;

// CommonJS compatibility
module.exports = NotificationManager;
