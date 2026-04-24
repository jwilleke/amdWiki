/**
 * logger tests
 *
 * @jest-environment node
 */
import os from 'os';
import path from 'path';
import fs from 'fs';
import { createLoggerWithConfig, reconfigureLogger } from '../logger';

describe('createLoggerWithConfig', () => {
  test('creates logger with default config', () => {
    const logger = createLoggerWithConfig();
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('creates logger with custom log level', () => {
    const logger = createLoggerWithConfig({ level: 'debug' });
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  test('creates logger with warn level', () => {
    const logger = createLoggerWithConfig({ level: 'warn' });
    expect(logger).toBeDefined();
  });

  test('creates logger with numeric maxSize', () => {
    const logger = createLoggerWithConfig({ maxSize: 2048 });
    expect(logger).toBeDefined();
  });

  test('creates logger with MB string maxSize', () => {
    const logger = createLoggerWithConfig({ maxSize: '2MB' });
    expect(logger).toBeDefined();
  });

  test('creates logger with KB string maxSize', () => {
    const logger = createLoggerWithConfig({ maxSize: '512KB' });
    expect(logger).toBeDefined();
  });

  test('creates logger with B string maxSize', () => {
    const logger = createLoggerWithConfig({ maxSize: '1024B' });
    expect(logger).toBeDefined();
  });

  test('creates logger with file transport when dir is provided', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-test-'));
    try {
      const logger = createLoggerWithConfig({ dir: tmpDir });
      expect(logger).toBeDefined();
      expect(typeof logger.error).toBe('function');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('creates logger with empty options', () => {
    const logger = createLoggerWithConfig({});
    expect(logger).toBeDefined();
  });

  test('logger can log messages without throwing', () => {
    const logger = createLoggerWithConfig({ level: 'error' });
    expect(() => logger.error('test error message')).not.toThrow();
  });
});

describe('reconfigureLogger', () => {
  test('reconfigures existing logger instance', async () => {
    const logger = createLoggerWithConfig({ level: 'info' });
    // Inject it as the loggerInstance — test via module default
    // reconfigureLogger operates on the singleton
    // We test it by importing the default and reconfiguring
    const { default: defaultLogger } = await import('../logger');
    expect(() => reconfigureLogger({ level: 'warn' })).not.toThrow();
    // Restore
    reconfigureLogger({ level: 'info' });
  });

  test('throws if called on uninitialized logger would fail — default is always initialized', async () => {
    // The module-level loggerInstance is always initialized, so reconfigure should succeed
    expect(() => reconfigureLogger({ level: 'debug' })).not.toThrow();
    reconfigureLogger({ level: 'info' }); // restore
  });
});
