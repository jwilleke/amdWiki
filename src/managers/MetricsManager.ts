import BaseManager from './BaseManager';
import logger from '../utils/logger';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';
import type { Request, Response, RequestHandler } from 'express';

// OpenTelemetry imports
import { metrics, type Meter, type Counter, type Histogram } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

/**
 * MetricsManager - OpenTelemetry metrics with Prometheus export
 *
 * Provides application-level observability for page load times, index rebuild
 * duration, save throughput, and HTTP request metrics. When disabled, all
 * recording methods are no-ops.
 *
 * @class MetricsManager
 * @extends BaseManager
 */
class MetricsManager extends BaseManager {
  private enabled: boolean = false;
  private meterProvider: MeterProvider | null = null;
  private prometheusExporter: PrometheusExporter | null = null;
  private meter: Meter | null = null;

  // Counters
  private pageViewsTotal: Counter | null = null;
  private pageSavesTotal: Counter | null = null;
  private pageDeletesTotal: Counter | null = null;
  private searchRebuildsTotal: Counter | null = null;
  private pageIndexSavesTotal: Counter | null = null;
  private loginAttemptsTotal: Counter | null = null;
  private httpRequestsTotal: Counter | null = null;

  // Histograms
  private pageViewDuration: Histogram | null = null;
  private pageSaveDuration: Histogram | null = null;
  private pageDeleteDuration: Histogram | null = null;
  private searchRebuildDuration: Histogram | null = null;
  private pageIndexSaveDuration: Histogram | null = null;
  private engineInitDuration: Histogram | null = null;
  private httpRequestDuration: Histogram | null = null;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(_config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(_config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      logger.warn('[MetricsManager] ConfigurationManager not available, metrics disabled');
      return;
    }

    this.enabled = configManager.getProperty('amdwiki.telemetry.enabled', false) as boolean;

    if (!this.enabled) {
      logger.info('[MetricsManager] Telemetry disabled by configuration');
      return;
    }

    try {
      const port = configManager.getProperty('amdwiki.telemetry.metrics.port', 9464) as number;
      const host = configManager.getProperty('amdwiki.telemetry.metrics.host', '0.0.0.0') as string;
      const metricsPath = configManager.getProperty('amdwiki.telemetry.metrics.path', '/metrics') as string;
      const interval = configManager.getProperty('amdwiki.telemetry.metrics.interval', 15000) as number;

      this.prometheusExporter = new PrometheusExporter({
        port,
        host,
        endpoint: metricsPath
      });

      this.meterProvider = new MeterProvider({
        readers: [this.prometheusExporter]
      });

      metrics.setGlobalMeterProvider(this.meterProvider);
      this.meter = this.meterProvider.getMeter('amdwiki', '1.0.0');

      this.createInstruments();

      logger.info(`[MetricsManager] Prometheus metrics available at http://${host}:${port}${metricsPath} (interval: ${interval}ms)`);
    } catch (err) {
      logger.error('[MetricsManager] Failed to initialize metrics:', err);
      this.enabled = false;
    }
  }

  private createInstruments(): void {
    if (!this.meter) return;

    // Counters
    this.pageViewsTotal = this.meter.createCounter('amdwiki_page_views_total', {
      description: 'Total number of page views'
    });
    this.pageSavesTotal = this.meter.createCounter('amdwiki_page_saves_total', {
      description: 'Total number of page saves'
    });
    this.pageDeletesTotal = this.meter.createCounter('amdwiki_page_deletes_total', {
      description: 'Total number of page deletes'
    });
    this.searchRebuildsTotal = this.meter.createCounter('amdwiki_search_rebuilds_total', {
      description: 'Total number of search index rebuilds'
    });
    this.pageIndexSavesTotal = this.meter.createCounter('amdwiki_page_index_saves_total', {
      description: 'Total number of page index saves'
    });
    this.loginAttemptsTotal = this.meter.createCounter('amdwiki_login_attempts_total', {
      description: 'Total number of login attempts'
    });
    this.httpRequestsTotal = this.meter.createCounter('amdwiki_http_requests_total', {
      description: 'Total number of HTTP requests'
    });

    // Histograms
    this.pageViewDuration = this.meter.createHistogram('amdwiki_page_view_duration_ms', {
      description: 'Page view duration in milliseconds',
      unit: 'ms'
    });
    this.pageSaveDuration = this.meter.createHistogram('amdwiki_page_save_duration_ms', {
      description: 'Page save duration in milliseconds',
      unit: 'ms'
    });
    this.pageDeleteDuration = this.meter.createHistogram('amdwiki_page_delete_duration_ms', {
      description: 'Page delete duration in milliseconds',
      unit: 'ms'
    });
    this.searchRebuildDuration = this.meter.createHistogram('amdwiki_search_rebuild_duration_ms', {
      description: 'Search index rebuild duration in milliseconds',
      unit: 'ms'
    });
    this.pageIndexSaveDuration = this.meter.createHistogram('amdwiki_page_index_save_duration_ms', {
      description: 'Page index save duration in milliseconds',
      unit: 'ms'
    });
    this.engineInitDuration = this.meter.createHistogram('amdwiki_engine_init_duration_ms', {
      description: 'Engine initialization duration in milliseconds',
      unit: 'ms'
    });
    this.httpRequestDuration = this.meter.createHistogram('amdwiki_http_request_duration_ms', {
      description: 'HTTP request duration in milliseconds',
      unit: 'ms'
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  recordPageView(durationMs: number): void {
    this.pageViewsTotal?.add(1);
    this.pageViewDuration?.record(durationMs);
  }

  recordPageSave(durationMs: number): void {
    this.pageSavesTotal?.add(1);
    this.pageSaveDuration?.record(durationMs);
  }

  recordPageDelete(durationMs: number): void {
    this.pageDeletesTotal?.add(1);
    this.pageDeleteDuration?.record(durationMs);
  }

  recordSearchRebuild(durationMs: number): void {
    this.searchRebuildsTotal?.add(1);
    this.searchRebuildDuration?.record(durationMs);
  }

  recordPageIndexSave(durationMs: number): void {
    this.pageIndexSavesTotal?.add(1);
    this.pageIndexSaveDuration?.record(durationMs);
  }

  recordLoginAttempt(): void {
    this.loginAttemptsTotal?.add(1);
  }

  recordEngineInit(durationMs: number): void {
    this.engineInitDuration?.record(durationMs);
  }

  recordHttpRequest(durationMs: number, attributes: { method: string; route: string; status: string }): void {
    this.httpRequestsTotal?.add(1, attributes);
    this.httpRequestDuration?.record(durationMs, attributes);
  }

  /**
   * Returns a handler that serves Prometheus metrics on the main Express app.
   * The PrometheusExporter runs its own HTTP server on a separate port,
   * but this handler allows serving metrics through the main app as well.
   */
  getMetricsHandler(): RequestHandler | null {
    if (!this.prometheusExporter) return null;

    // Delegate to PrometheusExporter's built-in request handler
    const exporter = this.prometheusExporter;
    return (req: Request, res: Response) => {
      exporter.getMetricsRequestHandler(req, res);
    };
  }

  async shutdown(): Promise<void> {
    if (this.meterProvider) {
      try {
        await this.meterProvider.shutdown();
        logger.info('[MetricsManager] Meter provider shut down');
      } catch (err) {
        logger.error('[MetricsManager] Error shutting down meter provider:', err);
      }
      this.meterProvider = null;
      this.prometheusExporter = null;
      this.meter = null;
    }
    // Reset global meter provider
    metrics.disable();
    await super.shutdown();
  }
}

export default MetricsManager;

// CommonJS compatibility
module.exports = MetricsManager;
