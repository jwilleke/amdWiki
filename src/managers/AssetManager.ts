/**
 * AssetManager — provider registry for the unified DAM framework.
 *
 * Holds a registry of AssetProviders (keyed by provider.id) and exposes a
 * single search/getById/getThumbnail API that fans out across all registered
 * providers.  The two built-in providers (BasicAttachmentProvider via
 * AttachmentManager, FileSystemMediaProvider via MediaManager) are registered
 * automatically in initialize().  Addons register additional providers via
 * registerProvider().
 *
 * AssetService delegates to this manager so its existing public API is
 * unchanged — callers that already use AssetService continue to work without
 * modification.
 */

import BaseManager from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';
import type { AssetProvider, AssetRecord, AssetPage, AssetQuery } from '../types/Asset';
import logger from '../utils/logger';

class AssetManager extends BaseManager {
  readonly description = 'Provider registry for the unified Digital Asset Management framework';

  private registry: Map<string, AssetProvider> = new Map();

  constructor(engine: WikiEngine) {
    super(engine);
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    // Register BasicAttachmentProvider (always present)
    const attachmentManager = this.engine.getManager<{ provider?: AssetProvider }>('AttachmentManager');
    if (attachmentManager?.provider) {
      this.registerProvider(attachmentManager.provider);
    } else {
      logger.warn('[AssetManager] AttachmentManager has no provider — skipping registration');
    }

    // Register FileSystemMediaProvider (optional — only when media is enabled)
    const mediaManager = this.engine.getManager<{ provider?: AssetProvider }>('MediaManager');
    if (mediaManager?.provider) {
      this.registerProvider(mediaManager.provider);
    }

    logger.info(`[AssetManager] Initialized with ${this.registry.size} provider(s): ${[...this.registry.keys()].join(', ')}`);
  }

  // ---------------------------------------------------------------------------
  // Registry
  // ---------------------------------------------------------------------------

  /**
   * Register an asset provider.  If a provider with the same id is already
   * registered it is replaced and a warning is logged.
   */
  registerProvider(provider: AssetProvider): void {
    if (this.registry.has(provider.id)) {
      logger.warn(`[AssetManager] Replacing existing provider "${provider.id}"`);
    }
    this.registry.set(provider.id, provider);
    logger.info(`[AssetManager] Registered provider "${provider.id}" (${provider.displayName})`);
  }

  /** Return a single provider by id, or null. */
  getProvider(id: string): AssetProvider | null {
    return this.registry.get(id) ?? null;
  }

  /** Return all registered providers in registration order. */
  getProviders(): AssetProvider[] {
    return [...this.registry.values()];
  }

  // ---------------------------------------------------------------------------
  // Unified API
  // ---------------------------------------------------------------------------

  /**
   * Search across all registered providers (or a specific one when
   * query.providerId is set), merge results, sort, and paginate.
   */
  async search(query: AssetQuery & { providerId?: string; wikiContext?: unknown } = {}): Promise<AssetPage> {
    const { pageSize = 48, offset = 0, sort = 'date', order = 'asc', providerId, ...providerQuery } = query;

    const providers = providerId
      ? (this.registry.has(providerId) ? [this.registry.get(providerId)!] : [])
      : [...this.registry.values()];

    const all: AssetRecord[] = [];

    for (const provider of providers) {
      try {
        const page = await provider.search({ ...providerQuery, pageSize: 9999, offset: 0 });
        all.push(...page.results);
      } catch (err) {
        logger.warn(`[AssetManager] Provider "${provider.id}" search failed:`, err);
      }
    }

    this._sort(all, sort, order);

    const total = all.length;
    const results = all.slice(offset, offset + pageSize);
    return { results, total, hasMore: offset + results.length < total };
  }

  /**
   * Retrieve a single asset by id.  If providerId is given only that provider
   * is checked; otherwise all providers are tried in registration order.
   */
  async getById(id: string, providerId?: string): Promise<AssetRecord | null> {
    const providers = providerId
      ? (this.registry.has(providerId) ? [this.registry.get(providerId)!] : [])
      : [...this.registry.values()];

    for (const provider of providers) {
      try {
        const record = await provider.getById(id);
        if (record) return record;
      } catch (err) {
        logger.warn(`[AssetManager] Provider "${provider.id}" getById failed:`, err);
      }
    }
    return null;
  }

  /**
   * Generate or retrieve a cached thumbnail.
   * Requires the provider to declare the 'thumbnail' capability.
   */
  async getThumbnail(id: string, providerId: string, size = '150x150'): Promise<Buffer | null> {
    const provider = this.registry.get(providerId);
    if (!provider) {
      logger.warn(`[AssetManager] getThumbnail: unknown provider "${providerId}"`);
      return null;
    }
    if (!provider.capabilities.includes('thumbnail') || !provider.getThumbnail) {
      return null;
    }
    try {
      return await provider.getThumbnail(id, size);
    } catch (err) {
      logger.warn(`[AssetManager] Provider "${providerId}" getThumbnail failed:`, err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private _sort(items: AssetRecord[], sort: 'date' | 'caption', order: 'asc' | 'desc'): void {
    const asc = order === 'asc';
    items.sort((a, b) => {
      let cmp = 0;
      if (sort === 'caption') {
        const cap = (r: AssetRecord) => (r.description ?? r.filename ?? '').toLowerCase();
        cmp = cap(a).localeCompare(cap(b));
      } else {
        const ts = (r: AssetRecord) => (r.dateCreated ? new Date(r.dateCreated).getTime() : 0);
        cmp = ts(a) - ts(b);
      }
      return asc ? cmp : -cmp;
    });
  }
}

export default AssetManager;

// CommonJS compatibility
module.exports = AssetManager;
