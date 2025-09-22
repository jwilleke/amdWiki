const WikiContext = require('../WikiContext');

// Mock managers for testing
const mockVariableManager = {
  expandVariables: jest.fn((content, context) => {
    // Simple mock: replace [{$pagename}] with the page name
    return content.replace(/\[\{\$pagename\}\]/g, context.pageName);
  })
};

const mockPluginManager = {
  execute: jest.fn((pluginName, pageName, params, context) => {
    if (pluginName === 'ReferringPagesPlugin') {
      return `<div class="referring-pages">Mock referring pages for ${pageName}</div>`;
    }
    return `<div class="plugin-output">Mock ${pluginName} output</div>`;
  })
};

const mockRenderingManager = {
  renderWikiLinks: jest.fn((content) => {
    // Simple mock: convert [PageName] to links
    return content.replace(/\[([a-zA-Z0-9\s_-]+)\]/g, (match, pageName) => {
      return `<a href="/wiki/${encodeURIComponent(pageName)}">${pageName}</a>`;
    });
  })
};

const mockPageManager = {
  getPageNames: jest.fn(() => ['Main', 'TestPage', 'AnotherPage'])
};

const mockEngine = {
  getManager: jest.fn((managerName) => {
    switch (managerName) {
      case 'VariableManager':
        return mockVariableManager;
      case 'PluginManager':
        return mockPluginManager;
      case 'RenderingManager':
        return mockRenderingManager;
      case 'PageManager':
        return mockPageManager;
      default:
        return null;
    }
  })
};

describe('WikiContext', () => {
  let context;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    context = new WikiContext(mockEngine, {
      pageName: 'TestPage',
      content: 'Test content with [{$pagename}] and [Main] link',
      userContext: { isAuthenticated: true, roles: ['user'] },
      requestInfo: { userAgent: 'test-agent' }
    });
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(context.engine).toBe(mockEngine);
      expect(context.pageName).toBe('TestPage');
      expect(context.content).toBe('Test content with [{$pagename}] and [Main] link');
      expect(context.userContext.isAuthenticated).toBe(true);
      expect(context.variables).toBeInstanceOf(Map);
      expect(context.metadata).toEqual({});
    });
  });

  describe('getManager', () => {
    test('should delegate to engine.getManager', () => {
      const result = context.getManager('VariableManager');
      expect(mockEngine.getManager).toHaveBeenCalledWith('VariableManager');
      expect(result).toBe(mockVariableManager);
    });
  });

  describe('expandVariables', () => {
    test('should use VariableManager to expand variables', async () => {
      const content = 'Page: [{$pagename}]';
      const result = await context.expandVariables(content);
      
      expect(mockVariableManager.expandVariables).toHaveBeenCalledWith(content, {
        userContext: context.userContext,
        pageName: context.pageName,
        requestInfo: context.requestInfo
      });
      expect(result).toBe('Page: TestPage');
    });

    test('should handle missing VariableManager gracefully', async () => {
      const contextWithoutVM = new WikiContext({
        getManager: () => null
      });
      
      const content = 'Page: [{$pagename}]';
      const result = await contextWithoutVM.expandVariables(content);
      expect(result).toBe(content); // Should return unchanged
    });
  });

  describe('expandPlugins', () => {
    test('should use PluginManager to execute plugins', async () => {
      const content = 'Test [{ReferringPagesPlugin}] plugin';
      const result = await context.expandPlugins(content);
      
      expect(mockPluginManager.execute).toHaveBeenCalledWith(
        'ReferringPagesPlugin',
        'TestPage',
        {},
        expect.objectContaining({
          engine: mockEngine,
          pageName: 'TestPage',
          userContext: context.userContext
        })
      );
      expect(result).toContain('Mock referring pages for TestPage');
    });

    test('should handle plugin parameters', async () => {
      const content = 'Test [{TestPlugin param1="value1"}] plugin';
      const result = await context.expandPlugins(content);
      
      expect(mockPluginManager.execute).toHaveBeenCalledWith(
        'TestPlugin',
        'TestPage',
        { param1: 'value1' },
        expect.any(Object)
      );
    });

    test('should handle missing PluginManager gracefully', async () => {
      const contextWithoutPM = new WikiContext({
        getManager: () => null
      });
      
      const content = 'Test [{TestPlugin}] plugin';
      const result = await contextWithoutPM.expandPlugins(content);
      expect(result).toBe(content); // Should return unchanged
    });
  });

  describe('expandWikiLinks', () => {
    test('should use RenderingManager to render wiki links', async () => {
      const content = 'Link to [Main] page';
      const result = await context.expandWikiLinks(content);
      
      expect(mockRenderingManager.renderWikiLinks).toHaveBeenCalledWith(content);
      expect(result).toContain('<a href="/wiki/Main">Main</a>');
    });

    test('should use fallback if RenderingManager not available', async () => {
      const contextWithoutRM = new WikiContext({
        getManager: (name) => name === 'PageManager' ? mockPageManager : null
      });
      
      const content = 'Link to [Main] page';
      const result = await contextWithoutRM.expandWikiLinks(content);
      
      expect(result).toContain('<a href="/wiki/Main">Main</a>');
    });
  });

  describe('renderMarkdown', () => {
    test('should orchestrate full rendering pipeline', async () => {
      const content = 'Page [{$pagename}] has [{ReferringPagesPlugin}] and link to [Main]';
      
      const result = await context.renderMarkdown(content, 'TestPage');
      
      // Verify all managers were called
      expect(mockVariableManager.expandVariables).toHaveBeenCalled();
      expect(mockPluginManager.execute).toHaveBeenCalled();
      expect(mockRenderingManager.renderWikiLinks).toHaveBeenCalled();
      
      // Result should be HTML
      expect(result).toContain('<p>');
      expect(result).toContain('</p>');
    });

    test('should track performance metrics', async () => {
      const content = 'Simple content';
      
      await context.renderMarkdown(content, 'TestPage');
      
      const performance = context.getPerformanceSummary();
      expect(performance.totalTime).toBeGreaterThan(0);
      expect(performance.variableTime).toBeGreaterThanOrEqual(0);
      expect(performance.pluginTime).toBeGreaterThanOrEqual(0);
      expect(performance.linkTime).toBeGreaterThanOrEqual(0);
      expect(performance.markdownTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Variable management', () => {
    test('should set and get variables', () => {
      context.setVariable('testVar', 'testValue');
      expect(context.getVariable('testVar')).toBe('testValue');
      expect(context.getVariable('nonexistent', 'default')).toBe('default');
    });
  });

  describe('Metadata management', () => {
    test('should set and get metadata', () => {
      context.setMetadata('testKey', 'testValue');
      expect(context.getMetadata('testKey')).toBe('testValue');
      expect(context.getMetadata('nonexistent', 'default')).toBe('default');
    });
  });

  describe('clone', () => {
    test('should create a copy with overrides', () => {
      context.setVariable('testVar', 'originalValue');
      context.setMetadata('testKey', 'originalValue');
      
      const cloned = context.clone({ pageName: 'ClonedPage' });
      
      expect(cloned.pageName).toBe('ClonedPage');
      expect(cloned.content).toBe(context.content);
      expect(cloned.getVariable('testVar')).toBe('originalValue');
      expect(cloned.getMetadata('testKey')).toBe('originalValue');
      
      // Changes to clone shouldn't affect original
      cloned.setVariable('testVar', 'clonedValue');
      expect(context.getVariable('testVar')).toBe('originalValue');
    });
  });

  describe('getSummary', () => {
    test('should return context summary', () => {
      const summary = context.getSummary();
      
      expect(summary.pageName).toBe('TestPage');
      expect(summary.contentLength).toBeGreaterThan(0);
      expect(summary.variableCount).toBe(0);
      expect(summary.userContext.isAuthenticated).toBe(true);
      expect(summary.performance).toBeDefined();
    });
  });
});