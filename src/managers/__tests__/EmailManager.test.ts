'use strict';

describe('EmailManager', () => {
  let EmailManager;
  let mockLogger;

  const makeConfigManager = (overrides: Record<string, unknown> = {}) => ({
    getProperty: jest.fn((key, defaultValue) => {
      const values = {
        'ngdpbase.mail.enabled':               overrides.enabled    ?? false,
        'ngdpbase.mail.provider':              overrides.provider   ?? 'console',
        'ngdpbase.mail.from':                  overrides.from       ?? '',
        'ngdpbase.mail.provider.smtp.host':    overrides.smtpHost   ?? '',
        'ngdpbase.mail.provider.smtp.port':    overrides.smtpPort   ?? 587,
        'ngdpbase.mail.provider.smtp.secure':  overrides.smtpSecure ?? false,
        'ngdpbase.mail.provider.smtp.user':    overrides.smtpUser   ?? '',
        'ngdpbase.mail.provider.smtp.pass':    overrides.smtpPass   ?? '',
        'ngdpbase.mail.provider.smtp.from':    overrides.smtpFrom   ?? '',
        ...overrides.properties
      };
      return values[key] ?? defaultValue;
    })
  });

  const makeEngine = (configManager) => ({
    getManager: jest.fn((name) => {
      if (name === 'ConfigurationManager') return configManager;
      return null;
    })
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Get the globally-mocked logger (from jest.setup.js) after resetModules
    EmailManager = require('../EmailManager');
    if (EmailManager.default) EmailManager = EmailManager.default;
    mockLogger = require('../../utils/logger');
  });

  describe('initialization', () => {
    test('1. defaults to console provider and warns when provider=console', async () => {
      const cm = makeConfigManager({ enabled: true, provider: 'console' });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.getProviderName()).toBe('console');
      expect(manager.isEnabled()).toBe(true);
      const warnCalls = mockLogger.warn.mock.calls.map((c) => c.join(' '));
      expect(warnCalls.some((m) => m.includes('printed to the server log'))).toBe(true);
    });

    test('2. warns when provider=console and mail.enabled=true', async () => {
      const cm = makeConfigManager({ enabled: true, provider: 'console' });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      const warnCalls = mockLogger.warn.mock.calls.map((c) => c.join(' '));
      expect(warnCalls.some((m) => m.includes('printed to the server log'))).toBe(true);
    });

    test('3. no console warning when provider=smtp', async () => {
      const cm = makeConfigManager({
        enabled: true,
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        smtpFrom: 'noreply@example.com',
        smtpUser: 'u',
        smtpPass: 'p'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      const warnCalls = mockLogger.warn.mock.calls.map((c) => c.join(' '));
      expect(warnCalls.some((m) => m.includes('printed to the server log'))).toBe(false);
    });

    test('4. uses smtp provider when configured', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        smtpFrom: 'noreply@example.com',
        smtpUser: 'user',
        smtpPass: 'pass'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.getProviderName()).toBe('smtp');
    });

    test('5. logs error when smtp.host is missing', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: '',
        smtpFrom: 'noreply@example.com',
        smtpUser: 'u',
        smtpPass: 'p'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      const errorCalls = mockLogger.error.mock.calls.map((c) => c.join(' '));
      expect(errorCalls.some((m) => m.includes('smtp.host'))).toBe(true);
    });

    test('6. logs error when both smtp.from and mail.from are empty', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        smtpFrom: '',
        from: '',
        smtpUser: 'u',
        smtpPass: 'p'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      const errorCalls = mockLogger.error.mock.calls.map((c) => c.join(' '));
      expect(errorCalls.some((m) => m.includes('from address'))).toBe(true);
    });

    test('7. warns when smtp.user is empty', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        smtpFrom: 'noreply@example.com',
        smtpUser: '',
        smtpPass: 'pass'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      const warnCalls = mockLogger.warn.mock.calls.map((c) => c.join(' '));
      expect(warnCalls.some((m) => m.includes('smtp.user'))).toBe(true);
    });

    test('7b. warns when smtp.pass is empty', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        smtpFrom: 'noreply@example.com',
        smtpUser: 'user',
        smtpPass: ''
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      const warnCalls = mockLogger.warn.mock.calls.map((c) => c.join(' '));
      expect(warnCalls.some((m) => m.includes('smtp.pass'))).toBe(true);
    });

    test('smtp.from overrides mail.from as effective from address', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        from: 'global@example.com',
        smtpFrom: 'smtp-specific@example.com',
        smtpUser: 'u',
        smtpPass: 'p'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.getFrom()).toBe('smtp-specific@example.com');
    });

    test('falls back to mail.from when smtp.from is empty', async () => {
      const cm = makeConfigManager({
        provider: 'smtp',
        smtpHost: 'smtp.example.com',
        from: 'global@example.com',
        smtpFrom: '',
        smtpUser: 'u',
        smtpPass: 'p'
      });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.getFrom()).toBe('global@example.com');
    });
  });

  describe('send()', () => {
    test('8. delegates to underlying provider', async () => {
      const cm = makeConfigManager({ provider: 'console' });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      // Console provider prints — just ensure no throw
      await expect(
        manager.send({ to: 'user@example.com', subject: 'Hi', text: 'Hello' })
      ).resolves.toBeUndefined();
    });

    test('9. injects from address when message.from is absent', async () => {
      const cm = makeConfigManager({ provider: 'console', from: 'noreply@example.com' });
      const manager = new EmailManager(makeEngine(cm));
      await manager.initialize();

      // Replace the internal provider with a spy
      const spy = jest.fn().mockResolvedValue(undefined);
      manager.provider = { send: spy };

      await manager.send({ to: 'user@example.com', subject: 'Hi', text: 'Hello' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'noreply@example.com' })
      );
    });
  });

  describe('isEnabled()', () => {
    test('10. reflects ngdpbase.mail.enabled config', async () => {
      const cmOn  = makeConfigManager({ enabled: true });
      const cmOff = makeConfigManager({ enabled: false });

      const mOn  = new EmailManager(makeEngine(cmOn));
      const mOff = new EmailManager(makeEngine(cmOff));
      await mOn.initialize();
      await mOff.initialize();

      expect(mOn.isEnabled()).toBe(true);
      expect(mOff.isEnabled()).toBe(false);
    });
  });
});
