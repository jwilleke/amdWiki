const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Notification Manager - Handles system notifications and user alerts
 * Extends BaseManager following the modular manager pattern
 */
class NotificationManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.notifications = new Map(); // Store active notifications
    this.notificationId = 0;
    this.storagePath = null;
    this.saveQueue = new Set(); // Track notifications that need saving
  }

  /**
   * Initialize the notification manager
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    await super.initialize(config);
    this.logger = logger.child({ component: 'NotificationManager' });

    // Pull settings from ConfigurationManager (with safe fallbacks)
    const cfgMgr =
      this.engine?.getManager?.('ConfigurationManager') ||
      this.engine?.getManager?.('ConfigManager');

    const defaultDir = config.wiki?.dataDir || './data';
    const dataDirCfg = cfgMgr?.getProperty?.('amdwiki.notifications.dir', defaultDir) ?? defaultDir;
    const fileNameCfg = cfgMgr?.getProperty?.('amdwiki.notifications.file', 'notifications.json') ?? 'notifications.json';
    const intervalCfg = cfgMgr?.getProperty?.('amdwiki.notifications.autoSaveInterval') ?? (5 * 60 * 1000);

    // validate values
    const dataDirAbs = path.resolve(process.cwd(), String(dataDirCfg));
    this.storagePath = path.resolve(dataDirAbs, String(fileNameCfg));
    const intervalMs = Number.isFinite(Number(intervalCfg)) ? Number(intervalCfg) : 5 * 60 * 1000;

    // Ensure data directory exists
    const dataDirPath = path.dirname(this.storagePath);
    try {
      await fs.mkdir(dataDirPath, { recursive: true });
    } catch (error) {
      this.logger.warn('Failed to create data directory:', error.message);
    }

    // Load existing notifications
    await this.loadNotifications();

    // Set up periodic save
    if (this.saveInterval) clearInterval(this.saveInterval);
    this.saveInterval = setInterval(() => {
      this.saveNotifications();
    }, Math.max(1000, intervalMs));

    this.logger.info(
      `NotificationManager initialized with persistence: path=${this.storagePath}, intervalMs=${Math.max(1000, intervalMs)}`
    );
  }

  /**
   * Load notifications from storage
   */
  async loadNotifications() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      const notificationsData = JSON.parse(data);

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
      if (error.code === 'ENOENT') {
        this.logger.info('No existing notification storage file found, starting fresh');
      } else {
        this.logger.error('Failed to load notifications from storage:', error.message);
      }
    }
  }

  /**
   * Save notifications to storage
   */
  async saveNotifications() {
    if (!this.storagePath) return;

    try {
      const notificationsData = {
        lastSaved: new Date().toISOString(),
        notifications: Object.fromEntries(this.notifications)
      };

      await fs.writeFile(this.storagePath, JSON.stringify(notificationsData, null, 2));
      this.logger.debug(`Saved ${this.notifications.size} notifications to storage`);
    } catch (error) {
      this.logger.error('Failed to save notifications to storage:', error.message);
    }
  }

  /**
   * Create a new notification
   * @param {Object} notification - Notification object
   * @param {string} notification.type - Type of notification (maintenance, system, user)
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.level - Severity level (info, warning, error, success)
   * @param {Array} notification.targetUsers - Array of usernames to notify (empty for all)
   * @param {Date} notification.expiresAt - When notification expires
   * @returns {string} Notification ID
   */
  async createNotification(notification) {
    const id = `notification_${++this.notificationId}`;
    const fullNotification = {
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
   * @param {Object} notification - Notification object
   * @returns {string} Notification ID
   */
  async addNotification(notification) {
    return this.createNotification(notification);
  }
  

  /**
   * Get notifications for a specific user
   * @param {string} username - Username to get notifications for
   * @param {boolean} includeExpired - Include expired notifications
   * @returns {Array} Array of notifications
   */
  getUserNotifications(username, includeExpired = false) {
    const now = new Date();
    const userNotifications = [];

    for (const [id, notification] of this.notifications.entries()) {
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
   * @returns {boolean} Success status
   */
  async dismissNotification(notificationId, username) {
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
   * @param {Object} config - Maintenance configuration
   * @returns {string} Notification ID
   */
  async createMaintenanceNotification(enabled, adminUsername, config = {}) {
    const title = enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled';
    const message = enabled
      ? `The system is now in maintenance mode. Regular users will see a maintenance page until it is disabled by ${adminUsername}.`
      : `Maintenance mode has been disabled by ${adminUsername}. The system is now fully accessible to all users.`;

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
   * @returns {Array} Array of all notifications
   */
  getAllNotifications(includeExpired = false) {
    const now = new Date();
    const allNotifications = [];

    for (const [id, notification] of this.notifications.entries()) {
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
  async cleanupExpiredNotifications() {
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
   * @returns {number} Number of cleared notifications
   */
  async clearAllActive() {
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
   * @returns {Object} Statistics object
   */
  getStats() {
    const now = new Date();
    let active = 0;
    let expired = 0;
    const byType = {};
    const byLevel = {};

    for (const [id, notification] of this.notifications.entries()) {
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
  async shutdown() {
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

module.exports = NotificationManager;