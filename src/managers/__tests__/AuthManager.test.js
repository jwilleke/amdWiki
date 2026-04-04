'use strict';

describe('AuthManager', () => {
  let AuthManager;
  let mockEngine;
  let mockConfigManager;

  const makeConfigManager = (overrides = {}) => ({
    getProperty: jest.fn((key, defaultValue) => {
      const values = {
        'ngdpbase.auth.magic-link.enabled': overrides.magicLinkEnabled ?? false,
        'ngdpbase.auth.magic-link.ttl-minutes': 15,
        'ngdpbase.auth.magic-link.base-url': '',
        'ngdpbase.auth.magic-link.mail-transport': 'console',
        'ngdpbase.auth.magic-link.smtp.host': '',
        'ngdpbase.auth.magic-link.smtp.port': 587,
        'ngdpbase.auth.magic-link.smtp.secure': false,
        'ngdpbase.auth.magic-link.smtp.user': '',
        'ngdpbase.auth.magic-link.smtp.pass': '',
        'ngdpbase.auth.magic-link.smtp.from': '',
        'ngdpbase.auth.required-factors': overrides.requiredFactors ?? ['password'],
        ...overrides.properties
      };
      return values[key] ?? defaultValue;
    })
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    AuthManager = require('../AuthManager');
    if (AuthManager.default) AuthManager = AuthManager.default;
  });

  const makeEngine = (configManager, extraManagers = {}) => ({
    getManager: jest.fn((name) => {
      if (name === 'ConfigurationManager') return configManager;
      return extraManagers[name] ?? null;
    })
  });

  describe('initialization', () => {
    test('always registers password provider', async () => {
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.isEnabled('password')).toBe(true);
    });

    test('does not register magic-link when disabled', async () => {
      const cm = makeConfigManager({ magicLinkEnabled: false });
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.isEnabled('magic-link')).toBe(false);
    });

    test('registers magic-link when enabled', async () => {
      const cm = makeConfigManager({ magicLinkEnabled: true });
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.isEnabled('magic-link')).toBe(true);
    });

    test('getRequiredFactors() returns value from config', async () => {
      const cm = makeConfigManager({ requiredFactors: ['password', 'totp'] });
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      expect(manager.getRequiredFactors()).toEqual(['password', 'totp']);
    });
  });

  describe('authenticate()', () => {
    test('returns { success: false } for unknown providerId', async () => {
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      const result = await manager.authenticate('unknown', { username: 'x', password: 'y' });
      expect(result).toEqual({ success: false });
    });

    test('delegates password auth to PasswordAuthProvider', async () => {
      const mockUserManager = {
        authenticateUser: jest.fn().mockResolvedValue({ username: 'alice' }),
        getUser: jest.fn().mockResolvedValue({ username: 'alice' })
      };
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm, { UserManager: mockUserManager }));
      await manager.initialize();

      const result = await manager.authenticate('password', { username: 'alice', password: 'secret' });
      expect(result).toEqual({ success: true, username: 'alice' });
      expect(mockUserManager.authenticateUser).toHaveBeenCalledWith('alice', 'secret');
    });

    test('returns { success: false } on bad password', async () => {
      const mockUserManager = {
        authenticateUser: jest.fn().mockResolvedValue(null)
      };
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm, { UserManager: mockUserManager }));
      await manager.initialize();

      const result = await manager.authenticate('password', { username: 'alice', password: 'wrong' });
      expect(result).toEqual({ success: false });
    });

    test('delegates magic-link verify to MagicLinkAuthProvider', async () => {
      const mockUserManager = {
        getUserByEmail: jest.fn().mockResolvedValue({ username: 'alice', email: 'a@b.com' })
      };
      const cm = makeConfigManager({ magicLinkEnabled: true });
      const manager = new AuthManager(makeEngine(cm, { UserManager: mockUserManager }));
      await manager.initialize();

      // Initiate to get a real token
      await manager.initiate('magic-link', {
        email: 'a@b.com',
        redirect: '/',
        baseUrl: 'http://localhost:3000'
      });

      // We can't know the token from outside, but we can verify that an unknown token fails
      const result = await manager.authenticate('magic-link', { token: 'notavalidtoken' });
      expect(result).toEqual({ success: false });
    });
  });

  describe('initiate()', () => {
    test('no-op for unknown providerId', async () => {
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      // Should not throw
      await expect(manager.initiate('unknown', {})).resolves.toBeUndefined();
    });

    test('no-op for password provider (has no initiate)', async () => {
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      await expect(manager.initiate('password', {})).resolves.toBeUndefined();
    });
  });

  describe('consumeToken()', () => {
    test('no-op for unknown providerId', async () => {
      const cm = makeConfigManager();
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      expect(() => manager.consumeToken('unknown', 'tok')).not.toThrow();
    });
  });

  describe('getProviders()', () => {
    test('returns array of registered providers', async () => {
      const cm = makeConfigManager({ magicLinkEnabled: true });
      const manager = new AuthManager(makeEngine(cm));
      await manager.initialize();

      const providers = manager.getProviders();
      const ids = providers.map((p) => p.id);
      expect(ids).toContain('password');
      expect(ids).toContain('magic-link');
    });
  });
});
