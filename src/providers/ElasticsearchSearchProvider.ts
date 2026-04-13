/**
 * ElasticsearchSearchProvider — full-text search provider backed by Elasticsearch.
 *
 * An optional replacement for LunrSearchProvider suitable for wikis with tens of
 * thousands of pages or multi-node deployments. Lunr remains the default; opt in
 * by setting:
 *   "ngdpbase.search.provider": "elasticsearchsearchprovider"
 *
 * Configuration keys (all lowercase):
 *   ngdpbase.search.provider.elasticsearch.url            — ES base URL (default: http://localhost:9200)
 *   ngdpbase.search.provider.elasticsearch.indexname      — ES index name (default: ngdpbase-pages)
 *   ngdpbase.search.provider.elasticsearch.connecttimeout — connect timeout ms (default: 5000)
 *   ngdpbase.search.provider.elasticsearch.requesttimeout — request timeout ms (default: 30000)
 *
 * Index: `ngdpbase-pages` (distinct from the sist2 addon's ES index).
 * Created automatically on first buildIndex() call.
 *
 * Field mapping:
 *   systemCategory  ← metadata['system-category']  (storage routing)
 *   systemKeywords  ← metadata['system-keywords']   (system-assigned classification; #507 auto-tags)
 *   userKeywords    ← metadata['user-keywords']      (user-assigned from vocabulary)
 *
 * Related: #189 (Lunr alternatives), #504 (ES search integration), #507 (auto-tagging)
 */

import { Client } from '@elastic/elasticsearch';
import type {
  AggregationsStringTermsBucket,
  QueryDslQueryContainer
} from '@elastic/elasticsearch/lib/api/types';
import BaseSearchProvider, {
  type SearchResult,
  type SearchOptions,
  type SearchCriteria,
  type SearchStatistics,
  type BackupData,
  type WikiEngine
} from './BaseSearchProvider';
import logger from '../utils/logger';

// ---------------------------------------------------------------------------
// Internal document shape stored in ES
// ---------------------------------------------------------------------------

interface EsPageDocument {
  name: string;
  title: string;
  content: string;
  systemCategory: string;
  systemKeywords: string[];
  userKeywords: string[];
  author: string;
  editor: string;
  lastModified: string;
  uuid: string;
  /** True when the page lives in the private storage location */
  isPrivate: boolean;
  /** Audience principals that may view this page when isPrivate is true */
  audience: string[];
}

// ---------------------------------------------------------------------------
// ES index mapping
// ---------------------------------------------------------------------------

const INDEX_MAPPING = {
  mappings: {
    properties: {
      name:           { type: 'keyword' as const },
      title:          { type: 'text' as const, analyzer: 'english', fields: { keyword: { type: 'keyword' as const } } },
      content:        { type: 'text' as const, analyzer: 'english' },
      systemCategory: { type: 'keyword' as const },
      systemKeywords: { type: 'keyword' as const },
      userKeywords:   { type: 'keyword' as const },
      author:         { type: 'keyword' as const },
      editor:         { type: 'keyword' as const },
      lastModified:   { type: 'date' as const },
      uuid:           { type: 'keyword' as const },
      isPrivate:      { type: 'boolean' as const },
      audience:       { type: 'keyword' as const }
    }
  }
};

// ---------------------------------------------------------------------------
// Interfaces for engine managers
// ---------------------------------------------------------------------------

interface ConfigurationManager {
  getProperty<T>(key: string, defaultValue: T): T;
}

interface PageManager {
  getAllPages(): Promise<string[]>;
  getPage(pageName: string): Promise<{ content?: string; metadata: Record<string, unknown> } | null>;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

class ElasticsearchSearchProvider extends BaseSearchProvider {
  private client: Client | null = null;
  private indexName: string = 'ngdpbase-pages';
  private maxResults: number = 50;
  private snippetLength: number = 200;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  // -------------------------------------------------------------------------
  // initialize
  // -------------------------------------------------------------------------

  async initialize(): Promise<void> {
    const cfg = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!cfg) throw new Error('ElasticsearchSearchProvider requires ConfigurationManager');

    const url = cfg.getProperty<string>('ngdpbase.search.provider.elasticsearch.url', 'http://localhost:9200');
    this.indexName = cfg.getProperty<string>('ngdpbase.search.provider.elasticsearch.indexname', 'ngdpbase-pages');
    const connectTimeout = cfg.getProperty<number>('ngdpbase.search.provider.elasticsearch.connecttimeout', 5000);
    const requestTimeout = cfg.getProperty<number>('ngdpbase.search.provider.elasticsearch.requesttimeout', 30000);
    this.maxResults = cfg.getProperty<number>('ngdpbase.search.provider.lunr.maxresults', 50);
    this.snippetLength = cfg.getProperty<number>('ngdpbase.search.provider.lunr.snippetlength', 200);

    this.client = new Client({
      node: url,
      requestTimeout
    });
    void connectTimeout; // read from config for future use

    // Create index if it does not exist yet
    await this._ensureIndex();

    this.initialized = true;
    logger.info(`[ElasticsearchSearchProvider] Initialized — index: ${this.indexName}, url: ${url}`);
  }

  // -------------------------------------------------------------------------
  // buildIndex — bulk-index all pages in 200-document batches
  // -------------------------------------------------------------------------

  async buildIndex(): Promise<void> {
    if (!this.client) throw new Error('Not initialized');

    const pageManager = this.engine.getManager<PageManager>('PageManager');
    if (!pageManager) {
      logger.warn('[ElasticsearchSearchProvider] PageManager not available for indexing');
      return;
    }

    const pageNames = await pageManager.getAllPages();
    logger.info(`[ElasticsearchSearchProvider] Building index for ${pageNames.length} pages`);

    const BATCH = 200;
    let indexed = 0;

    for (let i = 0; i < pageNames.length; i += BATCH) {
      const batch = pageNames.slice(i, i + BATCH);
      const ops: unknown[] = [];

      for (const name of batch) {
        const page = await pageManager.getPage(name);
        if (!page) continue;
        const doc = this._pageToDoc(name, page.content ?? '', page.metadata);
        ops.push({ index: { _index: this.indexName, _id: name } });
        ops.push(doc);
      }

      if (ops.length === 0) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { errors } = await this.client.bulk({ body: ops as any[] });
      if (errors) {
        logger.warn(`[ElasticsearchSearchProvider] Bulk index batch ${i}–${i + BATCH} had errors`);
      }
      indexed += batch.length;
    }

    logger.info(`[ElasticsearchSearchProvider] Index built — ${indexed} pages indexed`);
  }

  // -------------------------------------------------------------------------
  // search
  // -------------------------------------------------------------------------

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.client) return [];

    const maxResults = options.maxResults ?? this.maxResults;
    const { isPrivate: privateFilter, audience: audienceFilter } = this._buildPrivacyFilter(options.wikiContext);

    const mustClause: QueryDslQueryContainer = query.trim()
      ? {
        multi_match: {
          query: query.trim(),
          fields: ['title^10', 'content', 'userKeywords^6', 'systemKeywords^5'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      }
      : { match_all: {} };

    const esQuery = this._wrapWithPrivacy(mustClause, privateFilter, audienceFilter);

    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      query: esQuery,
      size: maxResults,
      highlight: {
        fields: { content: { fragment_size: this.snippetLength, number_of_fragments: 1 } }
      }
    });

    return resp.hits.hits
      .filter(h => h._source !== undefined)
      .map(h => this._hitToResult(h._id ?? '', h._source as EsPageDocument, query, h.highlight));
  }

  // -------------------------------------------------------------------------
  // advancedSearch
  // -------------------------------------------------------------------------

  async advancedSearch(criteria: SearchCriteria = {}): Promise<SearchResult[]> {
    if (!this.client) return [];

    const {
      query = '',
      categories = [],
      userKeywords = [],
      author = '',
      editor = '',
      dateRange,
      maxResults: maxR
    } = criteria;

    const maxResults = (maxR) ?? this.maxResults;
    const { isPrivate: privateFilter, audience: audienceFilter } = this._buildPrivacyFilter(
      (criteria.wikiContext as SearchOptions['wikiContext']) ?? undefined
    );

    // must — text query
    const must: QueryDslQueryContainer = query.trim()
      ? {
        multi_match: {
          query: query.trim(),
          fields: ['title^10', 'content', 'userKeywords^6', 'systemKeywords^5'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      }
      : { match_all: {} };

    // filter clauses
    const filter: QueryDslQueryContainer[] = [];

    if (categories.length > 0) {
      filter.push({ terms: { systemCategory: categories } });
    }

    if (userKeywords.length > 0) {
      filter.push({ terms: { userKeywords } });
    }

    if (author) {
      filter.push({ term: { author } });
    }

    if (editor) {
      filter.push({ term: { editor } });
    }

    if (dateRange?.from || dateRange?.to) {
      const range: Record<string, string> = {};
      if (dateRange.from) range['gte'] = dateRange.from;
      if (dateRange.to)   range['lte'] = dateRange.to;
      filter.push({ range: { lastModified: range } });
    }

    const esQuery = this._wrapWithPrivacy(must, privateFilter, audienceFilter, filter);

    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      query: esQuery,
      size: maxResults,
      highlight: {
        fields: { content: { fragment_size: this.snippetLength, number_of_fragments: 1 } }
      }
    });

    return resp.hits.hits
      .filter(h => h._source !== undefined)
      .map(h => this._hitToResult(h._id ?? '', h._source as EsPageDocument, query, h.highlight));
  }

  // -------------------------------------------------------------------------
  // updatePageInIndex
  // -------------------------------------------------------------------------

  async updatePageInIndex(pageName: string, pageData: Record<string, unknown>): Promise<void> {
    if (!this.client) return;

    const metadata = (pageData.metadata as Record<string, unknown>) ?? {};
    const content = typeof pageData.content === 'string' ? pageData.content : '';
    const doc = this._pageToDoc(pageName, content, metadata);

    await this.client.index({
      index: this.indexName,
      id: pageName,
      document: doc
    });

    logger.debug(`[ElasticsearchSearchProvider] Indexed page: ${pageName}`);
  }

  // -------------------------------------------------------------------------
  // removePageFromIndex
  // -------------------------------------------------------------------------

  async removePageFromIndex(pageName: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.delete({ index: this.indexName, id: pageName });
    } catch (err: unknown) {
      // 404 means page was never indexed — not an error
      if ((err as { statusCode?: number }).statusCode !== 404) throw err;
    }
  }

  // -------------------------------------------------------------------------
  // getAllCategories / getAllUserKeywords / getAllSystemKeywords
  // -------------------------------------------------------------------------

  async getAllCategories(): Promise<string[]> {
    return this._termsAgg('systemCategory', 100);
  }

  async getAllUserKeywords(): Promise<string[]> {
    return this._termsAgg('userKeywords', 500);
  }

  async getAllSystemKeywords(): Promise<string[]> {
    return this._termsAgg('systemKeywords', 500);
  }

  // -------------------------------------------------------------------------
  // searchByCategory / searchByUserKeywords
  // -------------------------------------------------------------------------

  async searchByCategory(category: string): Promise<SearchResult[]> {
    if (!this.client || !category) return [];

    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      query: { term: { systemCategory: category } },
      size: this.maxResults
    });

    return resp.hits.hits
      .filter(h => h._source !== undefined)
      .map(h => this._hitToResult(h._id ?? '', h._source as EsPageDocument, category));
  }

  async searchByUserKeywords(keyword: string): Promise<SearchResult[]> {
    if (!this.client || !keyword) return [];

    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      query: { term: { userKeywords: keyword } },
      size: this.maxResults
    });

    return resp.hits.hits
      .filter(h => h._source !== undefined)
      .map(h => this._hitToResult(h._id ?? '', h._source as EsPageDocument, keyword));
  }

  // -------------------------------------------------------------------------
  // getSuggestions
  // -------------------------------------------------------------------------

  async getSuggestions(partial: string): Promise<string[]> {
    if (!this.client || !partial || partial.length < 2) return [];

    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      query: { match_phrase_prefix: { 'title.keyword': { query: partial } } },
      size: 10,
      _source: ['title']
    });

    return resp.hits.hits
      .filter(h => h._source?.title)
      .map(h => h._source!.title);
  }

  // -------------------------------------------------------------------------
  // suggestSimilarPages
  // -------------------------------------------------------------------------

  async suggestSimilarPages(pageName: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.client) return [];

    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      query: {
        more_like_this: {
          fields: ['title', 'content'],
          like: [{ _index: this.indexName, _id: pageName }],
          min_term_freq: 1,
          min_doc_freq: 1
        }
      },
      size: limit + 1
    });

    return resp.hits.hits
      .filter(h => h._id !== pageName && h._source !== undefined)
      .slice(0, limit)
      .map(h => this._hitToResult(h._id ?? '', h._source as EsPageDocument, ''));
  }

  // -------------------------------------------------------------------------
  // getStatistics
  // -------------------------------------------------------------------------

  async getStatistics(): Promise<SearchStatistics> {
    if (!this.client) return { documentCount: 0 };

    const [countResp, statsResp] = await Promise.all([
      this.client.count({ index: this.indexName }),
      this.client.indices.stats({ index: this.indexName }).catch(() => null)
    ]);

    const indexSize = statsResp?._all?.total?.store?.size_in_bytes ?? undefined;
    const categories = await this.getAllCategories();
    const userKeywords = await this.getAllUserKeywords();

    return {
      documentCount: countResp.count,
      indexSize,
      totalCategories: categories.length,
      totalUserKeywords: userKeywords.length,
      providerName: 'ElasticsearchSearchProvider',
      providerVersion: '1.0.0'
    };
  }

  // -------------------------------------------------------------------------
  // getDocumentCount
  // -------------------------------------------------------------------------

  async getDocumentCount(): Promise<number> {
    if (!this.client) return 0;
    const resp = await this.client.count({ index: this.indexName });
    return resp.count;
  }

  // -------------------------------------------------------------------------
  // isHealthy
  // -------------------------------------------------------------------------

  async isHealthy(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // close
  // -------------------------------------------------------------------------

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    this.initialized = false;
    logger.info('[ElasticsearchSearchProvider] Closed');
  }

  // -------------------------------------------------------------------------
  // backup / restore
  // -------------------------------------------------------------------------

  async backup(): Promise<BackupData> {
    const base = await super.backup();
    if (!this.client) return base;

    // Scroll all documents
    const docs: unknown[] = [];
    const resp = await this.client.search<EsPageDocument>({
      index: this.indexName,
      size: 10000,
      query: { match_all: {} }
    });
    resp.hits.hits.forEach(h => {
      if (h._source) docs.push({ id: h._id, doc: h._source });
    });

    return { ...base, indexName: this.indexName, documents: docs };
  }

  async restore(backupData: BackupData): Promise<void> {
    if (!this.client) return;
    const docs = backupData.documents as Array<{ id: string; doc: EsPageDocument }> | undefined;
    if (!docs || docs.length === 0) return;

    const ops: unknown[] = [];
    for (const { id, doc } of docs) {
      ops.push({ index: { _index: this.indexName, _id: id } });
      ops.push(doc);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.bulk({ body: ops as any[] });
    logger.info(`[ElasticsearchSearchProvider] Restored ${docs.length} documents from backup`);
  }

  // -------------------------------------------------------------------------
  // getProviderInfo
  // -------------------------------------------------------------------------

  getProviderInfo(): { name: string; version: string; description: string; features: string[] } {
    return {
      name: 'ElasticsearchSearchProvider',
      version: '1.0.0',
      description: 'Full-text search using Elasticsearch — suitable for large wikis',
      features: ['full-text', 'stemming', 'field-boosting', 'snippets', 'suggestions', 'aggregations', 'private-page-access-control']
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /** Convert page content + metadata to an ES document */
  private _pageToDoc(
    name: string,
    content: string,
    metadata: Record<string, unknown>
  ): EsPageDocument {
    const toStr = (v: unknown): string =>
      typeof v === 'string' ? v : '';

    const toStrArr = (v: unknown): string[] => {
      if (Array.isArray(v)) return v.map(String).filter(s => s);
      if (typeof v === 'string' && v) return [v];
      return [];
    };

    const isPrivate = metadata['system-location'] === 'private';
    const audienceRaw = metadata['audience'];
    const audience = toStrArr(audienceRaw);

    return {
      name,
      title: toStr(metadata.title) || name,
      content,
      systemCategory: toStr(metadata['system-category']),
      systemKeywords: toStrArr(metadata['system-keywords']),
      userKeywords: toStrArr(metadata['user-keywords']),
      author: toStr(metadata.author),
      editor: toStr(metadata.editor),
      lastModified: toStr(metadata.lastModified),
      uuid: toStr(metadata.uuid),
      isPrivate,
      audience
    };
  }

  /** Convert an ES hit to a SearchResult */
  private _hitToResult(
    id: string,
    src: EsPageDocument,
    _query: string,
    highlight?: Record<string, string[]>
  ): SearchResult {
    const snippet = highlight?.content?.[0]
      ?? src.content.substring(0, this.snippetLength);

    return {
      name: id,
      title: src.title || id,
      score: 1.0,
      snippet,
      metadata: {
        systemCategory: src.systemCategory,
        systemKeywords: src.systemKeywords,
        userKeywords: src.userKeywords,
        lastModified: src.lastModified,
        author: src.author,
        editor: src.editor,
        uuid: src.uuid
      }
    };
  }

  /**
   * Build the private-page visibility predicate from the current WikiContext.
   * Returns the two clauses needed by _wrapWithPrivacy.
   */
  private _buildPrivacyFilter(wikiContext?: SearchOptions['wikiContext']): {
    isPrivate: boolean;
    audience: string[];
  } {
    const userRoles = wikiContext?.userContext?.roles;
    const username = wikiContext?.userContext?.username;
    const principals: string[] = [];
    if (Array.isArray(userRoles)) principals.push(...userRoles);
    if (typeof username === 'string' && username) principals.push(username);
    return { isPrivate: principals.length > 0, audience: principals };
  }

  /**
   * Wrap a must clause with a boolean that enforces private-page visibility.
   *
   * Visibility rule (mirrors LunrSearchProvider):
   *   - Show if isPrivate === false, OR
   *   - Show if audience contains any of the current user's principals
   */
  private _wrapWithPrivacy(
    must: QueryDslQueryContainer,
    hasUser: boolean,
    principals: string[],
    extraFilter: QueryDslQueryContainer[] = []
  ): QueryDslQueryContainer {
    const privacyFilter: QueryDslQueryContainer = hasUser && principals.length > 0
      ? {
        bool: {
          should: [
            { term: { isPrivate: false } },
            { terms: { audience: principals } }
          ],
          minimum_should_match: 1
        }
      }
      : { term: { isPrivate: false } };

    const filter: QueryDslQueryContainer[] = [privacyFilter, ...extraFilter];

    return {
      bool: {
        must,
        filter
      }
    };
  }

  /** Run a terms aggregation and return the bucket keys */
  private async _termsAgg(field: string, size: number): Promise<string[]> {
    if (!this.client) return [];

    const resp = await this.client.search({
      index: this.indexName,
      size: 0,
      aggs: { result: { terms: { field, size } } }
    });

    const buckets = (resp.aggregations?.result as { buckets?: AggregationsStringTermsBucket[] } | undefined)?.buckets ?? [];
    return buckets.map(b => b.key as string).filter(Boolean);
  }

  /** Create the ES index if it does not exist */
  private async _ensureIndex(): Promise<void> {
    if (!this.client) return;

    const exists = await this.client.indices.exists({ index: this.indexName });
    if (exists) {
      logger.debug(`[ElasticsearchSearchProvider] Index '${this.indexName}' already exists`);
      return;
    }

    await this.client.indices.create({
      index: this.indexName,
      ...INDEX_MAPPING
    });

    logger.info(`[ElasticsearchSearchProvider] Created index '${this.indexName}'`);
  }
}

export default ElasticsearchSearchProvider;

// CommonJS compatibility
module.exports = ElasticsearchSearchProvider;
