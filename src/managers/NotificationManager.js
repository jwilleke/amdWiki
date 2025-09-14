const BaseManager = require('./BaseManager');
const logger = require('../utils/logger');

/**
 * Notification Manager - Handles system notifications and user alerts
 * Extends BaseManager following the modular manager pattern
 */
class NotificationManager extends BaseManager {
  constructor(engine) {
    super(engine);
    this.notifications = new Map(); // Store active notifications
    this.notificationId = 0;
  }

  /**
   * Initialize the notification manager
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    await super.initialize(config);
    this.logger = logger.child({ component: 'NotificationManager' });
    this.logger.info('NotificationManager initialized');
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
  createNotification(notification) {
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

    return id;
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
  dismissNotification(notificationId, username) {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    if (!notification.dismissedBy.includes(username)) {
      notification.dismissedBy.push(username);
      this.logger.info(`Notification ${notificationId} dismissed by ${username}`);
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
  createMaintenanceNotification(enabled, adminUsername, config = {}) {
    const title = enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled';
    const message = enabled
      ? `The system is now in maintenance mode. Regular users will see a maintenance page until it is disabled by ${adminUsername}.`
      : `Maintenance mode has been disabled by ${adminUsername}. The system is now fully accessible to all users.`;

    const level = enabled ? 'warning' : 'success';

    // Set expiration - maintenance notifications expire when mode changes
    const expiresAt = enabled ? null : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for disable notifications

    return this.createNotification({
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
  cleanupExpiredNotifications() {
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
    }
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
}

module.exports = NotificationManager;