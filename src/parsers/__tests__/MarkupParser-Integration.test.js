const MarkupParser = require('../MarkupParser');

// Mock all required managers for full integration test
class MockPluginManager {
  async executePlugin(pluginName, params, context) {
    if (pluginName === 'TotalPages') {
      return `<span class="total-pages">42 pages</span>`;
    }
    if (pluginName === 'RecentChanges') {
      const max = params.max || 5;
      return `<div class="recent-changes">Last ${max} changes</div>`;
    }
    return `<div class="plugin-${pluginName.toLowerCase()}">${JSON.stringify(params)}</div>`;
  }
}

class MockPageManager {
  async getPage(pageName) {
    if (pageName === 'ExistingPage') {
      return { content: '# Existing Page\n\nThis page exists with **bold** content.' };
    }
    if (pageName === 'IncludePage') {
      return { content: '# Include Test\n\n## Section A\n\nContent A\n\n## Section B\n\nContent B' };
    }
    return null;
  }
}

class MockUserManager {
  constructor() {
    this.initialized = true;
  }
}

class MockPolicyManager {
  async checkPermission(userContext, permission, resource) {
    if (permission === 'read') return true;
    if (permission === 'write') return userContext?.roles?.includes('admin');
    return false;
  }
}

class MockVariableManager {
  expandVariables(content, context) {
    return content
      .replace(/\$\{pagename\}/g, context.pageName || 'TestPage')
      .replace(/\$\{username\}/g, context.userName || 'TestUser')
      .replace(/\$\{applicationname\}/g, 'amdWiki');
  }
}

class MockRenderingManager {
  constructor() {
    this.converter = {
      makeHtml: (content) => {
        return content
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
      }
    };
  }
}

class MockCacheManager {
  constructor() {
    this.regions = new Map();
    this.initialized = true;
  }
  
  isInitialized() {
    return this.initialized;
  }
  
  region(regionName) {
    if (!this.regions.has(regionName)) {
      this.regions.set(regionName, {
        cache: new Map(),
        get: async (key) => this.regions.get(regionName).cache.get(key) || null,
        set: async (key, value, options) => this.regions.get(regionName).cache.set(key, value)
      });
    }
    return this.regions.get(regionName);
  }
}

class MockConfigurationManager {
  getProperty(key, defaultValue) {
    const config = {
      'amdwiki.markup.enabled': true,
      'amdwiki.markup.caching': true,
      'amdwiki.markup.cacheTTL': 300,
      'amdwiki.markup.handlers.plugin.enabled': true,
      'amdwiki.markup.handlers.plugin.priority': 90,
      'amdwiki.markup.handlers.wikitag.enabled': true,
      'amdwiki.markup.handlers.wikitag.priority': 95,
      'amdwiki.markup.handlers.form.enabled': true,
      'amdwiki.markup.handlers.form.priority': 85,
      'amdwiki.markup.handlers.interwiki.enabled': true,
      'amdwiki.markup.handlers.interwiki.priority': 80,
      'amdwiki.interwiki.sites.Wikipedia': 'https://en.wikipedia.org/wiki/%s',
      'amdwiki.interwiki.sites.JSPWiki': 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s'
    };
    
    return config[key] !== undefined ? config[key] : defaultValue;
  }
}

class MockWikiEngine {
  constructor() {
    this.managers = new Map([
      ['PluginManager', new MockPluginManager()],
      ['PageManager', new MockPageManager()],
      ['UserManager', new MockUserManager()],
      ['PolicyManager', new MockPolicyManager()],
      ['VariableManager', new MockVariableManager()],
      ['RenderingManager', new MockRenderingManager()],
      ['CacheManager', new MockCacheManager()],
      ['ConfigurationManager', new MockConfigurationManager()]
    ]);
  }
  
  getManager(name) {
    return this.managers.get(name) || null;
  }
}

describe('MarkupParser Full Integration', () => {
  let markupParser;
  let mockEngine;

  beforeEach(async () => {
    mockEngine = new MockWikiEngine();
    markupParser = new MarkupParser(mockEngine);
    await markupParser.initialize();
  });

  afterEach(async () => {
    await markupParser.shutdown();
  });

  describe('Handler Registration', () => {
    test('should register all Phase 2 handlers', () => {
      const handlers = markupParser.getHandlers();
      const handlerIds = handlers.map(h => h.handlerId);
      
      expect(handlerIds).toContain('PluginSyntaxHandler');
      expect(handlerIds).toContain('WikiTagHandler');
      expect(handlerIds).toContain('WikiFormHandler');
      expect(handlerIds).toContain('InterWikiLinkHandler');
    });

    test('should register handlers in correct priority order', () => {
      const handlers = markupParser.getHandlers();
      const priorities = handlers.map(h => h.priority);
      
      // Should be sorted in descending order (higher priority first)
      for (let i = 1; i < priorities.length; i++) {
        expect(priorities[i]).toBeLessThanOrEqual(priorities[i-1]);
      }
    });
  });

  describe('Plugin Syntax Processing', () => {
    test('should process simple plugins', async () => {
      const content = 'Page count: [{TotalPages}]';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('<span class="total-pages">42 pages</span>');
    });

    test('should process plugins with parameters', async () => {
      const content = 'Recent changes: [{RecentChanges max=10}]';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('<div class="recent-changes">Last 10 changes</div>');
    });

    test('should process multiple plugins', async () => {
      const content = '[{TotalPages}] and [{RecentChanges max=3}]';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('42 pages');
      expect(result).toContain('Last 3 changes');
    });
  });

  describe('WikiTag Processing', () => {
    test('should process conditional content for authenticated users', async () => {
      const content = '<wiki:If test="authenticated">Welcome, user!</wiki:If>';
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };
      
      const result = await markupParser.parse(content, context);
      
      expect(result).toContain('Welcome, user!');
    });

    test('should hide content for anonymous users', async () => {
      const content = '<wiki:If test="authenticated">Admin only content</wiki:If>';
      const context = {
        pageName: 'TestPage',
        userName: 'anonymous',
        userContext: { isAuthenticated: false }
      };
      
      const result = await markupParser.parse(content, context);
      
      expect(result).not.toContain('Admin only content');
    });

    test('should include other pages', async () => {
      const content = 'Here is included content: <wiki:Include page="ExistingPage" />';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('This page exists');
      expect(result).toContain('<strong>bold</strong>');
    });

    test('should check user status', async () => {
      const content = '<wiki:UserCheck status="authenticated">You are logged in</wiki:UserCheck>';
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };
      
      const result = await markupParser.parse(content, context);
      
      expect(result).toContain('You are logged in');
    });
  });

  describe('WikiForm Processing', () => {
    test('should generate complete forms', async () => {
      const content = `
[{FormOpen action="/submit" method="POST"}]
[{FormInput name="title" type="text" required="true"}]
[{FormTextarea name="content" rows="5"}]
[{FormButton type="submit" value="Save"}]
[{FormClose}]`;
      
      const result = await markupParser.parse(content);
      
      expect(result).toContain('<form');
      expect(result).toContain('action="/submit"');
      expect(result).toContain('method="POST"');
      expect(result).toContain('<input type="text" id="input_title" name="title"');
      expect(result).toContain('<textarea id="textarea_content" name="content"');
      expect(result).toContain('<button type="submit"');
      expect(result).toContain('_csrfToken');
      expect(result).toContain('</form>');
    });

    test('should include CSRF protection', async () => {
      const content = '[{FormOpen}][{FormClose}]';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('_csrfToken');
      expect(result).toContain('type="hidden"');
    });
  });

  describe('InterWiki Link Processing', () => {
    test('should process simple InterWiki links', async () => {
      const content = 'See [Wikipedia:JavaScript] for more info.';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('<a href="https://en.wikipedia.org/wiki/JavaScript"');
      expect(result).toContain('class="interwiki-link');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('Wikipedia:JavaScript');
    });

    test('should process InterWiki links with custom text', async () => {
      const content = 'Read about [Wikipedia:JavaScript|JS on Wikipedia].';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('<a href="https://en.wikipedia.org/wiki/JavaScript"');
      expect(result).toContain('JS on Wikipedia');
    });

    test('should handle unknown InterWiki sites', async () => {
      const content = '[UnknownWiki:SomePage]';
      const result = await markupParser.parse(content);
      
      expect(result).toContain('<!-- InterWiki Error: UnknownWiki');
      expect(result).toContain('Unknown InterWiki site');
    });
  });

  describe('Combined Processing', () => {
    test('should process multiple syntax types together', async () => {
      const content = `
# Test Page

Plugin: [{TotalPages}]

<wiki:If test="authenticated">
  Welcome! Check out [Wikipedia:Wiki] for more info.
  
  [{FormOpen action="/feedback"}]
  [{FormInput name="rating" type="number" min="1" max="5"}]
  [{FormClose}]
</wiki:If>

<wiki:Include page="ExistingPage" />
`;
      
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };
      
      const result = await markupParser.parse(content, context);
      
      // Should contain plugin output
      expect(result).toContain('42 pages');
      
      // Should contain conditional content
      expect(result).toContain('Welcome!');
      
      // Should contain InterWiki link
      expect(result).toContain('href="https://en.wikipedia.org/wiki/Wiki"');
      
      // Should contain form elements
      expect(result).toContain('<form');
      expect(result).toContain('type="number"');
      
      // Should contain included page
      expect(result).toContain('This page exists');
      
      // Should have processed markdown
      expect(result).toContain('<h1>Test Page</h1>');
    });

    test('should respect handler priority order', async () => {
      const content = '<wiki:If test="authenticated">[{TotalPages}]</wiki:If>';
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };
      
      const result = await markupParser.parse(content, context);
      
      // WikiTag (priority 95) should process first, then Plugin (priority 90)
      expect(result).toContain('42 pages');
    });

    test('should handle errors gracefully without breaking other handlers', async () => {
      const content = `
[{NonExistentPlugin}]
<wiki:If test="authenticated">Good content</wiki:If>
[Wikipedia:ValidLink]
[{TotalPages}]
`;
      
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };
      
      const result = await markupParser.parse(content, context);
      
      // Should contain error for non-existent plugin
      expect(result).toContain('<!-- Plugin Error: NonExistentPlugin');
      
      // Should still process other valid syntax
      expect(result).toContain('Good content');
      expect(result).toContain('https://en.wikipedia.org/wiki/ValidLink');
      expect(result).toContain('42 pages');
    });
  });

  describe('Configuration Integration', () => {
    test('should respect handler enable/disable configuration', async () => {
      // Create parser with plugin handler disabled
      const configManager = {
        getProperty: (key, defaultValue) => {
          if (key === 'amdwiki.markup.handlers.plugin.enabled') return false;
          if (key === 'amdwiki.markup.handlers.wikitag.enabled') return true;
          return defaultValue;
        }
      };
      
      const customEngine = new MockWikiEngine();
      customEngine.managers.set('ConfigurationManager', configManager);
      
      const customParser = new MarkupParser(customEngine);
      await customParser.initialize();
      
      const handlers = customParser.getHandlers();
      const handlerIds = handlers.map(h => h.handlerId);
      
      expect(handlerIds).not.toContain('PluginSyntaxHandler'); // Disabled
      expect(handlerIds).toContain('WikiTagHandler'); // Enabled
      
      await customParser.shutdown();
    });
  });

  describe('Performance and Caching', () => {
    test('should cache parse results', async () => {
      const content = '[{TotalPages}] and [Wikipedia:Test]';
      
      // First parse
      const result1 = await markupParser.parse(content);
      
      // Second parse (should hit cache)
      const result2 = await markupParser.parse(content);
      
      expect(result1).toBe(result2);
      
      const metrics = markupParser.getMetrics();
      expect(metrics.cacheHits).toBeGreaterThan(0);
    });

    test('should collect comprehensive metrics', async () => {
      const content = `
[{TotalPages}]
<wiki:If test="authenticated">Content</wiki:If>
[Wikipedia:Test]
`;
      
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true }
      };
      
      await markupParser.parse(content, context);
      
      const metrics = markupParser.getMetrics();
      
      expect(metrics).toHaveProperty('parseCount');
      expect(metrics).toHaveProperty('averageParseTime');
      expect(metrics).toHaveProperty('cacheStrategies');
      expect(metrics).toHaveProperty('handlerRegistry');
      expect(metrics).toHaveProperty('performance');
      
      expect(metrics.parseCount).toBe(1);
      expect(metrics.handlerRegistry.registry.totalHandlers).toBe(4);
    });
  });

  describe('Error Resilience', () => {
    test('should continue processing when individual handlers fail', async () => {
      const content = `
[{ValidPlugin}]
<wiki:InvalidTag>content</wiki:InvalidTag>
[{AnotherValidPlugin}]
`;
      
      const result = await markupParser.parse(content, context);
      
      // Should process valid plugins despite invalid WikiTag
      expect(result).toContain('plugin-validplugin');
      expect(result).toContain('plugin-anothervalidplugin');
      expect(result).toContain('<!-- WikiTag Error: InvalidTag');
    });

    test('should handle phase errors gracefully', async () => {
      // This test validates our error handling from Phase 1
      const content = 'Simple content without any special syntax';
      const result = await markupParser.parse(content);
      
      expect(result).toBe('Simple content without any special syntax');
    });
  });

  describe('JSPWiki Compatibility', () => {
    test('should support all major JSPWiki enhancement types', () => {
      const handlers = markupParser.getHandlers();
      const handlerIds = handlers.map(h => h.handlerId);
      
      // Verify we have handlers for major JSPWiki enhancement categories
      expect(handlerIds).toContain('PluginSyntaxHandler'); // Plugins
      expect(handlerIds).toContain('WikiTagHandler'); // WikiTags
      expect(handlerIds).toContain('WikiFormHandler'); // Forms
      expect(handlerIds).toContain('InterWikiLinkHandler'); // InterWiki
      
      // Total should be 4 for Phase 2
      expect(handlers.length).toBe(4);
    });

    test('should process JSPWiki syntax in correct order', async () => {
      const content = `
<wiki:If test="authenticated">
  Plugin result: [{TotalPages}]
  External link: [Wikipedia:Wiki]
</wiki:If>`;
      
      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };
      
      const result = await markupParser.parse(content, context);
      
      // All syntax types should be processed correctly
      expect(result).toContain('42 pages'); // Plugin processed
      expect(result).toContain('https://en.wikipedia.org/wiki/Wiki'); // InterWiki processed
      // WikiTag processed (content is shown because user is authenticated)
    });
  });
});
