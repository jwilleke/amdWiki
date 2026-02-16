const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock logger before requiring MetricsManager
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock OpenTelemetry modules to avoid port conflicts and real metric collection
const mockCounter = { add: jest.fn() };
const mockHistogram = { record: jest.fn() };
const mockMeter = {
  createCounter: jest.fn(() => mockCounter),
  createHistogram: jest.fn(() => mockHistogram)
};
const mockMeterProvider = {
  getMeter: jest.fn(() => mockMeter),
  shutdown: jest.fn().mockResolvedValue(undefined)
};
const mockGetMetricsRequestHandler = jest.fn();
const mockPrometheusExporter = {
  getMetricsRequestHandler: mockGetMetricsRequestHandler
};
const mockOtlpReaderShutdown = jest.fn().mockResolvedValue(undefined);
const mockOtlpReader = {
  shutdown: mockOtlpReaderShutdown
};
const mockOtlpExporter = {};

jest.mock('@opentelemetry/sdk-metrics', () => ({
  MeterProvider: jest.fn(() => mockMeterProvider),
  PeriodicExportingMetricReader: jest.fn(() => mockOtlpReader)
}));

jest.mock('@opentelemetry/exporter-prometheus', () => ({
  PrometheusExporter: jest.fn(() => mockPrometheusExporter)
}));

jest.mock('@opentelemetry/exporter-metrics-otlp-http', () => ({
  OTLPMetricExporter: jest.fn(() => mockOtlpExporter)
}));

jest.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: jest.fn((attrs) => ({ attributes: attrs }))
}));

jest.mock('@opentelemetry/semantic-conventions', () => ({
  ATTR_SERVICE_NAME: 'service.name'
}));

jest.mock('@opentelemetry/api', () => ({
  metrics: {
    setGlobalMeterProvider: jest.fn(),
    disable: jest.fn()
  }
}));

const MetricsManager = require('../MetricsManager');

describe('MetricsManager', () => {
  let manager;
  let mockEngine;
  let mockConfigManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfigManager = {
      getProperty: jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': false,
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000
        };
        return key in config ? config[key] : defaultValue;
      })
    };

    mockEngine = {
      getManager: jest.fn((name) => {
        if (name === 'ConfigurationManager') return mockConfigManager;
        return undefined;
      })
    };

    manager = new MetricsManager(mockEngine);
  });

  afterEach(async () => {
    if (manager.isInitialized()) {
      await manager.shutdown();
    }
  });

  describe('disabled mode', () => {
    test('should initialize successfully when disabled', async () => {
      await manager.initialize();
      expect(manager.isInitialized()).toBe(true);
      expect(manager.isEnabled()).toBe(false);
    });

    test('should have all record methods as safe no-ops when disabled', async () => {
      await manager.initialize();

      // None of these should throw
      expect(() => manager.recordPageView(100)).not.toThrow();
      expect(() => manager.recordPageSave(200)).not.toThrow();
      expect(() => manager.recordPageDelete(50)).not.toThrow();
      expect(() => manager.recordSearchRebuild(5000)).not.toThrow();
      expect(() => manager.recordPageIndexSave(30)).not.toThrow();
      expect(() => manager.recordLoginAttempt()).not.toThrow();
      expect(() => manager.recordEngineInit(90000)).not.toThrow();
      expect(() => manager.recordHttpRequest(15, {
        method: 'GET', route: '/wiki/:page', status: '200'
      })).not.toThrow();
    });

    test('should return null from getMetricsHandler when disabled', async () => {
      await manager.initialize();
      expect(manager.getMetricsHandler()).toBeNull();
    });
  });

  describe('enabled mode', () => {
    beforeEach(() => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000
        };
        return key in config ? config[key] : defaultValue;
      });
    });

    test('should initialize and create metric instruments when enabled', async () => {
      await manager.initialize();
      expect(manager.isEnabled()).toBe(true);

      // Should create counters and histograms
      expect(mockMeter.createCounter).toHaveBeenCalledTimes(7);
      expect(mockMeter.createHistogram).toHaveBeenCalledTimes(7);
    });

    test('should create counters with correct names', async () => {
      await manager.initialize();

      const counterNames = mockMeter.createCounter.mock.calls.map(c => c[0]);
      expect(counterNames).toContain('amdwiki_page_views_total');
      expect(counterNames).toContain('amdwiki_page_saves_total');
      expect(counterNames).toContain('amdwiki_page_deletes_total');
      expect(counterNames).toContain('amdwiki_search_rebuilds_total');
      expect(counterNames).toContain('amdwiki_page_index_saves_total');
      expect(counterNames).toContain('amdwiki_login_attempts_total');
      expect(counterNames).toContain('amdwiki_http_requests_total');
    });

    test('should create histograms with correct names', async () => {
      await manager.initialize();

      const histogramNames = mockMeter.createHistogram.mock.calls.map(c => c[0]);
      expect(histogramNames).toContain('amdwiki_page_view_duration_ms');
      expect(histogramNames).toContain('amdwiki_page_save_duration_ms');
      expect(histogramNames).toContain('amdwiki_page_delete_duration_ms');
      expect(histogramNames).toContain('amdwiki_search_rebuild_duration_ms');
      expect(histogramNames).toContain('amdwiki_page_index_save_duration_ms');
      expect(histogramNames).toContain('amdwiki_engine_init_duration_ms');
      expect(histogramNames).toContain('amdwiki_http_request_duration_ms');
    });

    test('should derive metric prefix from applicationName', async () => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.applicationName': 'jimstest',
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();

      const counterNames = mockMeter.createCounter.mock.calls.map(c => c[0]);
      expect(counterNames).toContain('jimstest_page_views_total');
      expect(counterNames).toContain('jimstest_http_requests_total');

      const histogramNames = mockMeter.createHistogram.mock.calls.map(c => c[0]);
      expect(histogramNames).toContain('jimstest_page_view_duration_ms');

      expect(mockMeterProvider.getMeter).toHaveBeenCalledWith('jimstest', '1.0.0');
    });

    test('should record page view metrics', async () => {
      await manager.initialize();
      manager.recordPageView(150);

      expect(mockCounter.add).toHaveBeenCalledWith(1);
      expect(mockHistogram.record).toHaveBeenCalledWith(150);
    });

    test('should record HTTP request metrics with attributes', async () => {
      await manager.initialize();
      const attrs = { method: 'GET', route: '/wiki/:page', status: '200' };
      manager.recordHttpRequest(25, attrs);

      expect(mockCounter.add).toHaveBeenCalledWith(1, attrs);
      expect(mockHistogram.record).toHaveBeenCalledWith(25, attrs);
    });

    test('should set service.name resource from telemetry.serviceName config', async () => {
      const { MeterProvider } = require('@opentelemetry/sdk-metrics');
      const { resourceFromAttributes } = require('@opentelemetry/resources');

      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.applicationName': 'jimstest',
          'amdwiki.telemetry.serviceName': 'jimstest-wiki',
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();

      expect(resourceFromAttributes).toHaveBeenCalledWith({ 'service.name': 'jimstest-wiki' });
      expect(MeterProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: expect.objectContaining({ attributes: { 'service.name': 'jimstest-wiki' } })
        })
      );
    });

    test('should fall back to prefix for service.name when serviceName not configured', async () => {
      const { resourceFromAttributes } = require('@opentelemetry/resources');

      // Default config has no serviceName — falls back to prefix
      await manager.initialize();

      expect(resourceFromAttributes).toHaveBeenCalledWith({ 'service.name': 'amdwiki' });
    });

    test('should return a metrics handler when enabled', async () => {
      await manager.initialize();
      const handler = manager.getMetricsHandler();
      expect(handler).not.toBeNull();
      expect(typeof handler).toBe('function');
    });
  });

  describe('shutdown', () => {
    test('should clean up meter provider on shutdown', async () => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        if (key === 'amdwiki.telemetry.enabled') return true;
        const config = {
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();
      expect(manager.isEnabled()).toBe(true);

      await manager.shutdown();
      expect(mockMeterProvider.shutdown).toHaveBeenCalled();
      expect(manager.isInitialized()).toBe(false);
    });

    test('should handle shutdown gracefully when disabled', async () => {
      await manager.initialize();
      await expect(manager.shutdown()).resolves.not.toThrow();
    });
  });

  describe('OTLP export', () => {
    const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
    const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should create OTLP reader when otlp.enabled=true and endpoint is set', async () => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000,
          'amdwiki.telemetry.otlp.enabled': true,
          'amdwiki.telemetry.otlp.endpoint': 'https://otel.example.com/v1/metrics',
          'amdwiki.telemetry.otlp.headers': {},
          'amdwiki.telemetry.otlp.interval': 15000,
          'amdwiki.telemetry.otlp.timeout': 30000
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();

      expect(OTLPMetricExporter).toHaveBeenCalledWith({
        url: 'https://otel.example.com/v1/metrics',
        headers: {},
        timeoutMillis: 30000
      });
      expect(PeriodicExportingMetricReader).toHaveBeenCalledWith({
        exporter: mockOtlpExporter,
        exportIntervalMillis: 15000,
        exportTimeoutMillis: 30000
      });
    });

    test('should NOT create OTLP reader when otlp.enabled=false', async () => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000,
          'amdwiki.telemetry.otlp.enabled': false,
          'amdwiki.telemetry.otlp.endpoint': 'https://otel.example.com/v1/metrics'
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();

      expect(OTLPMetricExporter).not.toHaveBeenCalled();
      expect(PeriodicExportingMetricReader).not.toHaveBeenCalled();
    });

    test('should NOT create OTLP reader when endpoint is empty', async () => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000,
          'amdwiki.telemetry.otlp.enabled': true,
          'amdwiki.telemetry.otlp.endpoint': ''
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();

      expect(OTLPMetricExporter).not.toHaveBeenCalled();
      expect(PeriodicExportingMetricReader).not.toHaveBeenCalled();
    });

    test('should shut down OTLP reader on shutdown', async () => {
      mockConfigManager.getProperty = jest.fn((key, defaultValue) => {
        const config = {
          'amdwiki.telemetry.enabled': true,
          'amdwiki.telemetry.metrics.port': 9464,
          'amdwiki.telemetry.metrics.host': '0.0.0.0',
          'amdwiki.telemetry.metrics.path': '/metrics',
          'amdwiki.telemetry.metrics.interval': 15000,
          'amdwiki.telemetry.otlp.enabled': true,
          'amdwiki.telemetry.otlp.endpoint': 'https://otel.example.com/v1/metrics',
          'amdwiki.telemetry.otlp.headers': {},
          'amdwiki.telemetry.otlp.interval': 15000,
          'amdwiki.telemetry.otlp.timeout': 30000
        };
        return key in config ? config[key] : defaultValue;
      });

      await manager.initialize();
      await manager.shutdown();

      expect(mockOtlpReaderShutdown).toHaveBeenCalled();
      expect(mockMeterProvider.shutdown).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('should disable metrics and log warning when ConfigurationManager unavailable', async () => {
      mockEngine.getManager = jest.fn(() => undefined);
      manager = new MetricsManager(mockEngine);

      await manager.initialize();
      expect(manager.isEnabled()).toBe(false);
    });
  });
});
