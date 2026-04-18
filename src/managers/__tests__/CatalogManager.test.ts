
// Mock logger before requiring managers
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() })
}));

import CatalogManager from '../CatalogManager';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockEngine(systemKeywords = {}) {
  const configManager = {
    getProperty: jest.fn((key, defaultVal) => {
      if (key === 'ngdpbase.system-keywords') return systemKeywords;
      if (key === 'ngdpbase.catalog.ai.enabled') return false;
      if (key === 'ngdpbase.catalog.ai.threshold') return 0.7;
      return defaultVal;
    })
  };
  return {
    getManager: jest.fn((name) => name === 'ConfigurationManager' ? configManager : undefined)
  };
}

const DEFAULT_KEYWORDS = {
  general: { label: 'general', category: 'content-type', enabled: true, default: true },
  draft:   { label: 'draft',   category: 'workflow-status', enabled: true },
  geology: { label: 'geology', category: 'subject', enabled: true, uri: 'https://www.wikidata.org/wiki/Q1069' },
  hidden:  { label: 'hidden',  category: 'subject', enabled: false }
};

// ---------------------------------------------------------------------------
// CatalogManager core
// ---------------------------------------------------------------------------

describe('CatalogManager', () => {
  let manager;
  let engine;

  beforeEach(async () => {
    engine = makeMockEngine(DEFAULT_KEYWORDS);
    manager = new CatalogManager(engine);
    await manager.initialize();
  });

  test('initializes successfully', () => {
    expect(manager.isInitialized()).toBe(true);
  });

  test('getTerms() returns enabled terms from DefaultCatalogProvider', async () => {
    const terms = await manager.getTerms();
    const labels = terms.map(t => t.term);
    expect(labels).toContain('general');
    expect(labels).toContain('draft');
    expect(labels).toContain('geology');
    // disabled term must be excluded
    expect(labels).not.toContain('hidden');
  });

  test('getTerms() includes uri when config has it', async () => {
    const terms = await manager.getTerms();
    const geo = terms.find(t => t.term === 'geology');
    expect(geo).toBeDefined();
    expect(geo.uri).toBe('https://www.wikidata.org/wiki/Q1069');
  });

  test('resolveUri() returns uri for known term', async () => {
    const uri = await manager.resolveUri('geology');
    expect(uri).toBe('https://www.wikidata.org/wiki/Q1069');
  });

  test('resolveUri() returns null for term with no uri', async () => {
    const uri = await manager.resolveUri('draft');
    expect(uri).toBeNull();
  });

  test('resolveUri() returns null for unknown term', async () => {
    const uri = await manager.resolveUri('nonexistent-term');
    expect(uri).toBeNull();
  });

  test('suggestTerms() returns [] when AI disabled (default)', async () => {
    const suggestions = await manager.suggestTerms('Some page content', 'My Page');
    expect(suggestions).toEqual([]);
  });

  test('getProviderInfo() lists registered providers', () => {
    const info = manager.getProviderInfo();
    const ids = info.map(p => p.id);
    expect(ids).toContain('default');
    expect(ids).toContain('ai');
  });
});

// ---------------------------------------------------------------------------
// Addon provider registration
// ---------------------------------------------------------------------------

describe('CatalogManager — registerProvider', () => {
  let manager;

  beforeEach(async () => {
    const engine = makeMockEngine({ general: { label: 'general', enabled: true } });
    manager = new CatalogManager(engine);
    await manager.initialize();
  });

  test('registerProvider() adds a third-party provider', async () => {
    const addonProvider = {
      id: 'geology-addon',
      displayName: 'Geology Addon Provider',
      domain: 'geoscience',
      getTerms: async () => [{ term: 'igneous', label: 'Igneous', category: 'subject', enabled: true }],
      resolveUri: async (term) => term === 'igneous' ? 'https://example.com/igneous' : null
    };

    manager.registerProvider(addonProvider);
    const terms = await manager.getTerms();
    const termNames = terms.map(t => t.term);
    expect(termNames).toContain('igneous');
  });

  test('getTerms(domain) filters by domain', async () => {
    const addonProvider = {
      id: 'geo-provider',
      displayName: 'Geo',
      domain: 'geoscience',
      getTerms: async () => [{ term: 'volcano', label: 'Volcano', enabled: true }]
    };
    const otherProvider = {
      id: 'med-provider',
      displayName: 'Med',
      domain: 'medicine',
      getTerms: async () => [{ term: 'pathogen', label: 'Pathogen', enabled: true }]
    };

    manager.registerProvider(addonProvider);
    manager.registerProvider(otherProvider);

    const geoTerms = await manager.getTerms('geoscience');
    const termNames = geoTerms.map(t => t.term);
    expect(termNames).toContain('volcano');
    expect(termNames).not.toContain('pathogen');
  });

  test('registerProvider() with same id replaces prior provider', async () => {
    const v1 = {
      id: 'custom',
      displayName: 'v1',
      getTerms: async () => [{ term: 'foo', label: 'Foo', enabled: true }]
    };
    const v2 = {
      id: 'custom',
      displayName: 'v2',
      getTerms: async () => [{ term: 'bar', label: 'Bar', enabled: true }]
    };

    manager.registerProvider(v1);
    manager.registerProvider(v2);

    const terms = await manager.getTerms();
    const names = terms.map(t => t.term);
    expect(names).toContain('bar');
    expect(names).not.toContain('foo');
  });

  test('resolveUri() walks providers in order, returns first hit', async () => {
    const p1 = {
      id: 'p1',
      displayName: 'P1',
      getTerms: async () => [],
      resolveUri: async (term) => term === 'shared' ? 'https://p1.example/shared' : null
    };
    const p2 = {
      id: 'p2',
      displayName: 'P2',
      getTerms: async () => [],
      resolveUri: async (term) => term === 'shared' ? 'https://p2.example/shared' : null
    };

    manager.registerProvider(p1);
    manager.registerProvider(p2);

    const uri = await manager.resolveUri('shared');
    // p1 was registered first after default — should win
    expect(uri).toBe('https://p1.example/shared');
  });
});

// ---------------------------------------------------------------------------
// ValidationManager — loadSystemKeywords
// ---------------------------------------------------------------------------

describe('ValidationManager — loadSystemKeywords', () => {
  let ValidationManager;
  let validationManager;

  beforeEach(() => {
    // Require inline so logger mock applies
    ValidationManager = require('../ValidationManager');
    validationManager = new ValidationManager({ getManager: jest.fn() });
  });

  test('loadSystemKeywords() populates validSystemKeywords from config', () => {
    const mockCfg = {
      getProperty: jest.fn((key, def) => {
        if (key === 'ngdpbase.system-keywords') {
          return {
            draft: { label: 'draft', enabled: true },
            archived: { label: 'archived', enabled: false }
          };
        }
        if (key === 'ngdpbase.maximum.user-keywords') return 5;
        if (key === 'ngdpbase.system-category') return null;
        return def;
      })
    };

    validationManager.loadSystemKeywords(mockCfg);
    const keywords = validationManager.getValidSystemKeywords();
    expect(keywords).toContain('draft');
    expect(keywords).not.toContain('archived');
  });

  test('loadSystemKeywords() handles missing config gracefully', () => {
    validationManager.loadSystemKeywords(undefined);
    expect(validationManager.getValidSystemKeywords()).toEqual([]);
  });

  test('loadSystemKeywords() handles empty system-keywords object', () => {
    const mockCfg = {
      getProperty: jest.fn((key, def) => key === 'ngdpbase.system-keywords' ? {} : def)
    };
    validationManager.loadSystemKeywords(mockCfg);
    expect(validationManager.getValidSystemKeywords()).toEqual([]);
  });
});
