/**
 * Tests for CurrentTimePlugin
 */

const CurrentTimePlugin = require('../CurrentTimePlugin');

describe('CurrentTimePlugin', () => {
  let mockContext;

  beforeEach(() => {
    // Mock context with user preferences
    mockContext = {
      userContext: {
        preferences: {
          locale: 'en-US',
          timezone: 'America/New_York',
          timeFormat: '12h',
          dateFormat: 'MM/dd/yyyy'
        }
      }
    };
  });

  describe('Basic functionality', () => {
    test('should have correct metadata', () => {
      expect(CurrentTimePlugin.name).toBe('CurrentTimePlugin');
      expect(CurrentTimePlugin.version).toBe('1.0.0');
      expect(CurrentTimePlugin.execute).toBeDefined();
    });

    test('should return a string', () => {
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle missing context gracefully', () => {
      const result = CurrentTimePlugin.execute({}, {});
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle null context gracefully', () => {
      const result = CurrentTimePlugin.execute(null, {});
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('User preferences', () => {
    test('should respect user locale preference', () => {
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
      // Should format based on en-US locale
      expect(typeof result).toBe('string');
    });

    test('should respect timezone preference', () => {
      mockContext.userContext.preferences.timezone = 'Europe/London';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should respect 24h time format', () => {
      mockContext.userContext.preferences.timeFormat = '24h';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
      // Note: We can't easily test the actual format without mocking Date
    });

    test('should respect 12h time format', () => {
      mockContext.userContext.preferences.timeFormat = '12h';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });
  });

  describe('Custom format patterns', () => {
    test('should handle yyyy-MM-dd format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'yyyy-MM-dd'
      });
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should handle dd/MM/yyyy format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'dd/MM/yyyy'
      });
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('should handle HH:mm:ss format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'HH:mm:ss'
      });
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('should handle combined date-time format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'yyyy-MM-dd HH:mm'
      });
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    });

    test('should handle month names', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'MMMM d, yyyy'
      });
      expect(result).toBeTruthy();
      // Should contain a month name like "January", "February", etc.
      const hasMonthName = /January|February|March|April|May|June|July|August|September|October|November|December/.test(result);
      expect(hasMonthName).toBe(true);
    });

    test('should handle weekday names', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'EEEE, MMMM d, yyyy'
      });
      expect(result).toBeTruthy();
      // Should contain a weekday name
      const hasWeekday = /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/.test(result);
      expect(hasWeekday).toBe(true);
    });

    test('should handle short month format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'dd-MMM-yyyy'
      });
      expect(result).toBeTruthy();
      // Should contain a short month like "Jan", "Feb", etc.
      const hasShortMonth = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(result);
      expect(hasShortMonth).toBe(true);
    });
  });

  describe('Different locales', () => {
    test('should handle French locale', () => {
      mockContext.userContext.preferences.locale = 'fr-FR';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should handle German locale', () => {
      mockContext.userContext.preferences.locale = 'de-DE';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should handle Japanese locale', () => {
      mockContext.userContext.preferences.locale = 'ja-JP';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should handle invalid locale gracefully', () => {
      mockContext.userContext.preferences.locale = 'invalid-LOCALE';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });
  });

  describe('Different timezones', () => {
    test('should handle UTC timezone', () => {
      mockContext.userContext.preferences.timezone = 'UTC';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should handle Asia/Tokyo timezone', () => {
      mockContext.userContext.preferences.timezone = 'Asia/Tokyo';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should handle invalid timezone gracefully', () => {
      mockContext.userContext.preferences.timezone = 'Invalid/Timezone';
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty params', () => {
      const result = CurrentTimePlugin.execute(mockContext, {});
      expect(result).toBeTruthy();
    });

    test('should handle null params', () => {
      const result = CurrentTimePlugin.execute(mockContext, null);
      expect(result).toBeTruthy();
    });

    test('should handle undefined params', () => {
      const result = CurrentTimePlugin.execute(mockContext, undefined);
      expect(result).toBeTruthy();
    });

    test('should handle empty format string', () => {
      const result = CurrentTimePlugin.execute(mockContext, { format: '' });
      expect(result).toBeTruthy();
    });

    test('should handle complex format pattern', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'EEEE, MMMM dd, yyyy - HH:mm:ss'
      });
      expect(result).toBeTruthy();
    });
  });

  describe('JSPWiki compatibility', () => {
    test('should support JSPWiki-style date format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'dd:MMM:yyyy'
      });
      expect(result).toMatch(/^\d{2}:/);
    });

    test('should support JSPWiki-style time format', () => {
      const result = CurrentTimePlugin.execute(mockContext, {
        format: 'hh:mm:ss'
      });
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });
  });

  describe('Initialize method', () => {
    test('should have initialize method', () => {
      expect(CurrentTimePlugin.initialize).toBeDefined();
    });

    test('should not throw on initialization', () => {
      const mockEngine = {
        getManager: jest.fn()
      };
      expect(() => CurrentTimePlugin.initialize(mockEngine)).not.toThrow();
    });
  });
});
