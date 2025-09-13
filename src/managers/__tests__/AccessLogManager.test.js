const AccessLogManager = require('../AccessLogManager');
const fs = require('fs').promises;
const path = require('path');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn()
  }
}));

describe('AccessLogManager', () => {
  let accessLogManager;
  let mockEngine;
  let mockConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfig = {
      get: jest.fn().mockReturnValue({
        logFile: './test-logs/access-log.json',
        maxLogEntries: 100,
        retentionDays: 30,
        consoleLogging: true
      })
    };
    
    mockEngine = {
      getConfig: jest.fn().mockReturnValue(mockConfig)
    };
    
    accessLogManager = new AccessLogManager(mockEngine);
  });

  describe('initialization', () => {
    it('should initialize with default config', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      
      await accessLogManager.initialize();
      
      expect(fs.mkdir).toHaveBeenCalledWith('./test-logs', { recursive: true });
      expect(accessLogManager.logs).toEqual([]);
    });

    it('should load existing logs from file', async () => {
      const existingLogs = [
        { id: 'test-1', timestamp: '2023-01-01T00:00:00Z', action: 'view' },
        { id: 'test-2', timestamp: '2023-01-01T01:00:00Z', action: 'edit' }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(existingLogs));
      
      await accessLogManager.initialize();
      
      expect(accessLogManager.logs).toEqual(existingLogs);
    });
  });

  describe('logAccess', () => {
    beforeEach(async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      await accessLogManager.initialize();
    });

    it('should log access decision with complete context', async () => {
      const context = {
        action: 'view',
        resource: 'TestPage',
        user: {
          username: 'testuser',
          displayName: 'Test User',
          roles: ['reader'],
          isAuthenticated: true
        },
        allowed: true,
        reason: 'User has read permission',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        method: 'GET',
        url: '/wiki/TestPage',
        sessionId: 'session-123'
      };

      const logId = await accessLogManager.logAccess(context);
      
      expect(logId).toBeDefined();
      expect(accessLogManager.logs).toHaveLength(1);
      
      const logEntry = accessLogManager.logs[0];
      expect(logEntry.id).toBe(logId);
      expect(logEntry.action).toBe('view');
      expect(logEntry.resource).toBe('TestPage');
      expect(logEntry.user.username).toBe('testuser');
      expect(logEntry.decision.allowed).toBe(true);
      expect(logEntry.decision.reason).toBe('User has read permission');
      expect(logEntry.request.ip).toBe('192.168.1.100');
    });

    it('should log denied access with appropriate context', async () => {
      const context = {
        action: 'edit',
        resource: 'AdminPage',
        user: {
          username: 'normaluser',
          displayName: 'Normal User',
          roles: ['reader'],
          isAuthenticated: true
        },
        allowed: false,
        reason: 'Insufficient permissions for admin page',
        ip: '10.0.0.5',
        userAgent: 'curl/7.68.0'
      };

      await accessLogManager.logAccess(context);
      
      const logEntry = accessLogManager.logs[0];
      expect(logEntry.decision.allowed).toBe(false);
      expect(logEntry.decision.reason).toBe('Insufficient permissions for admin page');
      expect(logEntry.user.username).toBe('normaluser');
    });
  });

  describe('getAccessLogs', () => {
    beforeEach(async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      await accessLogManager.initialize();
      
      // Add some test logs
      const testLogs = [
        {
          id: '1', timestamp: '2023-01-01T10:00:00Z', action: 'view',
          resource: 'Page1', user: { username: 'user1' },
          decision: { allowed: true }, request: { ip: '192.168.1.1' }
        },
        {
          id: '2', timestamp: '2023-01-01T11:00:00Z', action: 'edit',
          resource: 'Page2', user: { username: 'user2' },
          decision: { allowed: false }, request: { ip: '192.168.1.2' }
        },
        {
          id: '3', timestamp: '2023-01-01T12:00:00Z', action: 'view',
          resource: 'Page1', user: { username: 'user1' },
          decision: { allowed: true }, request: { ip: '192.168.1.1' }
        }
      ];
      accessLogManager.logs = testLogs;
    });

    it('should return all logs without filters', async () => {
      const result = await accessLogManager.getAccessLogs();
      
      expect(result.logs).toHaveLength(3);
      expect(result.pagination.totalCount).toBe(3);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter logs by username', async () => {
      const result = await accessLogManager.getAccessLogs({ username: 'user1' });
      
      expect(result.logs).toHaveLength(2);
      expect(result.logs.every(log => log.user.username === 'user1')).toBe(true);
    });

    it('should filter logs by action', async () => {
      const result = await accessLogManager.getAccessLogs({ action: 'edit' });
      
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe('edit');
    });

    it('should filter logs by allowed decision', async () => {
      const result = await accessLogManager.getAccessLogs({ allowed: false });
      
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].decision.allowed).toBe(false);
    });

    it('should handle pagination', async () => {
      const result = await accessLogManager.getAccessLogs({ limit: 2, page: 1 });
      
      expect(result.logs).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });
  });

  describe('getAccessStatistics', () => {
    beforeEach(async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      await accessLogManager.initialize();
      
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const testLogs = [
        {
          timestamp: now.toISOString(), action: 'view', user: { username: 'user1' },
          decision: { allowed: true, reason: 'Permission granted' }, request: { ip: '192.168.1.1' }
        },
        {
          timestamp: oneHourAgo.toISOString(), action: 'edit', user: { username: 'user2' },
          decision: { allowed: false, reason: 'Permission denied' }, request: { ip: '192.168.1.2' }
        },
        {
          timestamp: now.toISOString(), action: 'view', user: { username: 'user1' },
          decision: { allowed: true, reason: 'Permission granted' }, request: { ip: '192.168.1.1' }
        }
      ];
      accessLogManager.logs = testLogs;
    });

    it('should calculate correct statistics', async () => {
      const stats = await accessLogManager.getAccessStatistics({ period: 24 });
      
      expect(stats.totalAccess).toBe(3);
      expect(stats.allowedAccess).toBe(2);
      expect(stats.deniedAccess).toBe(1);
      expect(stats.uniqueUsers).toBe(2);
      expect(stats.uniqueIPs).toBe(2);
      expect(stats.topActions).toEqual([
        { item: 'view', count: 2 },
        { item: 'edit', count: 1 }
      ]);
    });
  });

  describe('exportLogs', () => {
    beforeEach(async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      await accessLogManager.initialize();
      
      const testLogs = [
        {
          timestamp: '2023-01-01T10:00:00Z',
          user: { username: 'user1' },
          action: 'view',
          resource: 'Page1',
          decision: { allowed: true, reason: 'Permission granted' },
          request: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
          session: { sessionId: 'session1' }
        }
      ];
      accessLogManager.logs = testLogs;
    });

    it('should export logs as JSON', async () => {
      const exported = await accessLogManager.exportLogs('json');
      
      expect(exported).toBe(JSON.stringify(accessLogManager.logs, null, 2));
    });

    it('should export logs as CSV', async () => {
      const exported = await accessLogManager.exportLogs('csv');
      
      expect(exported).toContain('Timestamp,Username,Action,Resource');
      expect(exported).toContain('2023-01-01T10:00:00Z,user1,view,Page1');
    });
  });

  describe('log rotation', () => {
    beforeEach(async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      accessLogManager.maxLogEntries = 3;
      await accessLogManager.initialize();
    });

    it('should rotate logs when exceeding max entries', async () => {
      // Fill up logs beyond max entries
      for (let i = 0; i < 5; i++) {
        accessLogManager.logs.push({ id: `log-${i}`, timestamp: new Date().toISOString() });
      }
      
      await accessLogManager.rotateLogs();
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/access-log-archive-.*\.json$/),
        expect.any(String)
      );
      expect(accessLogManager.logs.length).toBeLessThanOrEqual(3);
    });
  });

  describe('cleanup', () => {
    it('should clean old logs based on retention policy', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      accessLogManager.retentionDays = 1;
      await accessLogManager.initialize();
      
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago
      
      const newDate = new Date();
      
      accessLogManager.logs = [
        { id: 'old', timestamp: oldDate.toISOString() },
        { id: 'new', timestamp: newDate.toISOString() }
      ];
      
      await accessLogManager.cleanOldLogs();
      
      expect(accessLogManager.logs).toHaveLength(1);
      expect(accessLogManager.logs[0].id).toBe('new');
    });
  });
});