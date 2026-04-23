/**
 * CatalogManager — controlled-vocabulary registry for system keywords (#424).
 *
 * Provides a pluggable provider registry so that:
 *   - Core config-driven terms come from DefaultCatalogProvider
 *   - Addons contribute domain vocabularies via registerProvider()
 *   - Future AI-based term suggestion is scaffolded via AICatalogProvider
 *
 * Registration pattern (in addon's register() hook):
 *   const catalog = engine.getManager<CatalogManager>('CatalogManager');
 *   if (catalog) catalog.registerProvider(new GeoscienceCatalogProvider());
 *
 * Related: #424 (CatalogManager), #507 (auto-tagging), #149 (microdata itemid)
 */

import BaseManager from './BaseManager.js';
import type { WikiEngine } from '../types/WikiEngine.js';
import type ConfigurationManager from './ConfigurationManager.js';
import type { CatalogProvider, CatalogTerm } from '../types/Catalog.js';
import logger from '../utils/logger.js';

// ---------------------------------------------------------------------------
// DefaultCatalogProvider — reads ngdpbase.system-keywords from config
// ---------------------------------------------------------------------------

interface SystemKeywordConfig {
  label?: string;
  description?: string;
  category?: CatalogTerm['category'];
  default?: boolean;
  enabled?: boolean;
  uri?: string;
  source?: string;
}

class DefaultCatalogProvider implements CatalogProvider {
  readonly id = 'default';
  readonly displayName = 'Default Catalog Provider';

  private engine: WikiEngine;

  constructor(engine: WikiEngine) {
    this.engine = engine;
  }

  getTerms(): Promise<CatalogTerm[]> {
    const cfg = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!cfg) return Promise.resolve([]);

    const raw = cfg.getProperty('ngdpbase.system-keywords', {}) as Record<string, SystemKeywordConfig>;
    if (!raw || typeof raw !== 'object') return Promise.resolve([]);

    return Promise.resolve(
      Object.entries(raw)
        .filter(([, v]) => v.enabled !== false)
        .map(([key, v]) => ({
          term: key,
          label: v.label ?? key,
          uri: v.uri,
          source: v.source ?? 'config',
          category: v.category,
          default: v.default ?? false,
          enabled: v.enabled !== false
        }))
    );
  }

  async resolveUri(term: string): Promise<string | null> {
    const terms = await this.getTerms();
    return terms.find(t => t.term === term)?.uri ?? null;
  }
}

// ---------------------------------------------------------------------------
// AICatalogProvider — Phase 4 scaffold
// ---------------------------------------------------------------------------

class AICatalogProvider implements CatalogProvider {
  readonly id = 'ai';
  readonly displayName = 'AI Catalog Provider';

  private enabled: boolean;
  private threshold: number;

  constructor(engine: WikiEngine) {
    const cfg = engine.getManager<ConfigurationManager>('ConfigurationManager');
    this.enabled = (cfg?.getProperty('ngdpbase.catalog.ai.enabled', false) as boolean) ?? false;
    this.threshold = (cfg?.getProperty('ngdpbase.catalog.ai.threshold', 0.7) as number) ?? 0.7;
  }

  getTerms(): Promise<CatalogTerm[]> {
    // AI provider does not own terms — it only suggests them
    return Promise.resolve([]);
  }

  suggestTerms(content: string, title: string): Promise<CatalogTerm[]> {
    void content; void title; void this.threshold;
    if (!this.enabled) return Promise.resolve([]);
    // Scaffold: no LLM wired yet. An LLM addon replaces this by calling
    // catalogManager.registerProvider(realAiProvider) in its register() hook.
    logger.debug('[AICatalogProvider] no LLM configured — returning empty suggestions');
    return Promise.resolve([]);
  }
}

// ---------------------------------------------------------------------------
// CatalogManager
// ---------------------------------------------------------------------------

class CatalogManager extends BaseManager {
  readonly description = 'Controlled-vocabulary registry for system keywords';

  private providers: Map<string, CatalogProvider> = new Map();
  private aiProvider: AICatalogProvider | null = null;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // Always register the default (config-driven) provider
    const defaultProvider = new DefaultCatalogProvider(this.engine);
    this.registerProvider(defaultProvider);

    // Register AI provider scaffold (Phase 4)
    this.aiProvider = new AICatalogProvider(this.engine);
    this.registerProvider(this.aiProvider);

    const cfg = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    const aiEnabled = cfg?.getProperty('ngdpbase.catalog.ai.enabled', false) as boolean;

    logger.info(`[CatalogManager] Initialized — ${this.providers.size} provider(s): ${[...this.providers.keys()].join(', ')}`);
    if (!aiEnabled) {
      logger.debug('[CatalogManager] AICatalogProvider registered (stub — no LLM wired)');
    }

    this.initialized = true;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Register a catalog provider.
   * Addons call this in their register() hook to contribute domain vocabularies.
   * Calling registerProvider() with an id that already exists replaces the prior provider.
   */
  registerProvider(provider: CatalogProvider): void {
    this.providers.set(provider.id, provider);
    logger.debug(`[CatalogManager] Registered provider: ${provider.id} (${provider.displayName})`);
  }

  /**
   * Return all terms from all registered providers, merged in registration order.
   * @param domain Optional domain filter — only includes providers with a matching domain
   *               (providers with no domain set are always included).
   */
  async getTerms(domain?: string): Promise<CatalogTerm[]> {
    const all: CatalogTerm[] = [];
    for (const provider of this.providers.values()) {
      if (domain && provider.domain && provider.domain !== domain) continue;
      try {
        const terms = await provider.getTerms();
        all.push(...terms);
      } catch (err) {
        logger.warn(`[CatalogManager] getTerms failed for provider '${provider.id}':`, err);
      }
    }
    return all;
  }

  /**
   * Resolve a term string to a Linked-Data URI.
   * Walks providers in registration order; returns the first non-null hit.
   */
  async resolveUri(term: string): Promise<string | null> {
    for (const provider of this.providers.values()) {
      if (!provider.resolveUri) continue;
      try {
        const uri = await provider.resolveUri(term);
        if (uri) return uri;
      } catch (err) {
        logger.warn(`[CatalogManager] resolveUri failed for provider '${provider.id}':`, err);
      }
    }
    return null;
  }

  /**
   * Suggest controlled-vocabulary terms for the given page content.
   * Delegates to any provider that implements suggestTerms().
   * Returns [] when no AI provider is wired or ai is disabled.
   */
  async suggestTerms(content: string, title: string): Promise<CatalogTerm[]> {
    const suggestions: CatalogTerm[] = [];
    for (const provider of this.providers.values()) {
      if (!provider.suggestTerms) continue;
      try {
        const terms = await provider.suggestTerms(content, title);
        suggestions.push(...terms);
      } catch (err) {
        logger.warn(`[CatalogManager] suggestTerms failed for provider '${provider.id}':`, err);
      }
    }
    return suggestions;
  }

  /**
   * Return info about all registered providers (for admin UIs / diagnostics).
   */
  getProviderInfo(): Array<{ id: string; displayName: string; domain?: string }> {
    return [...this.providers.values()].map(p => ({
      id: p.id,
      displayName: p.displayName,
      domain: p.domain
    }));
  }
}

export default CatalogManager;

