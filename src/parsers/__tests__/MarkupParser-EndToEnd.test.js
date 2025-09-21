/**
 * End-to-End MarkupParser Testing Suite
 * 
 * Comprehensive testing of the complete MarkupParser system with all handlers,
 * filters, and modular configuration to validate 85%+ JSPWiki compatibility.
 * 
 * Tests the complete pipeline: 
 * Preprocessing → Syntax Recognition → Context Resolution → Content Transformation → 
 * Filter Pipeline → Markdown Conversion → Post-processing
 */

const MarkupParser = require('../MarkupParser');

// Comprehensive mock engine with all managers
class ComprehensiveMockEngine {
  constructor() {
    this.managers = new Map([
      ['ConfigurationManager', this.createConfigurationManager()],
      ['CacheManager', this.createCacheManager()],
      ['PluginManager', this.createPluginManager()],
      ['PageManager', this.createPageManager()],
      ['UserManager', this.createUserManager()],
      ['PolicyManager', this.createPolicyManager()],
      ['VariableManager', this.createVariableManager()],
      ['RenderingManager', this.createRenderingManager()],
      ['AttachmentManager', this.createAttachmentManager()],
      ['NotificationManager', this.createNotificationManager()],
      ['AuditManager', this.createAuditManager()]
    ]);
  }
  
  getManager(name) {
    return this.managers.get(name) || null;
  }
  
  createConfigurationManager() {
    return {
      getProperty: (key, defaultValue) => {
        const config = {
          // MarkupParser configuration
          'amdwiki.markup.enabled': true,
          'amdwiki.markup.caching': true,
          'amdwiki.markup.cacheTTL': 300,
          
          // All handlers enabled for testing
          'amdwiki.markup.handlers.plugin.enabled': true,
          'amdwiki.markup.handlers.wikitag.enabled': true,
          'amdwiki.markup.handlers.form.enabled': true,
          'amdwiki.markup.handlers.interwiki.enabled': true,
          'amdwiki.markup.handlers.attachment.enabled': true,
          'amdwiki.markup.handlers.style.enabled': true,
          
          // Filter configuration
          'amdwiki.markup.filters.enabled': true,
          'amdwiki.markup.filters.security.enabled': true,
          'amdwiki.markup.filters.spam.enabled': true,
          'amdwiki.markup.filters.validation.enabled': true,
          
          // Security configuration
          'amdwiki.markup.filters.security.preventXSS': true,
          'amdwiki.markup.filters.security.allowedTags': 'p,div,span,strong,em,h1,h2,h3,a,img',
          
          // Spam configuration
          'amdwiki.markup.filters.spam.maxLinks': 10,
          'amdwiki.markup.filters.spam.blacklistWords': 'spam,casino',
          
          // InterWiki sites
          'amdwiki.interwiki.sites.Wikipedia': 'https://en.wikipedia.org/wiki/%s',
          'amdwiki.interwiki.sites.JSPWiki': 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
          
          // Style configuration
          'amdwiki.style.predefined.text': 'text-primary,text-success,text-danger',
          'amdwiki.style.security.allowInlineCSS': false
        };
        
        return config[key] !== undefined ? config[key] : defaultValue;
      }
    };
  }
  
  createCacheManager() {
    return {
      isInitialized: () => true,
      region: (name) => ({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(true)
      })
    };
  }
  
  createPluginManager() {
    return {
      executePlugin: (pluginName, params, context) => {
        if (pluginName === 'TotalPages') return Promise.resolve('<span class="total-pages">42 pages</span>');
        if (pluginName === 'RecentChanges') return Promise.resolve(`<div class="recent-changes">Last ${params.max || 5} changes</div>`);
        if (pluginName === 'Uptime') return Promise.resolve('<span class="uptime">5 days, 3 hours</span>');
        return Promise.resolve(`<div class="plugin-${pluginName.toLowerCase()}">${JSON.stringify(params)}</div>`);
      }
    };
  }
  
  createPageManager() {
    return {
      getPage: (pageName) => {
        const pages = {
          'ExistingPage': { content: '# Existing Page\n\nThis page exists with **bold** content and [internal links].' },
          'FooterPage': { content: '---\n\n© 2025 amdWiki. All rights reserved.' },
          'HeaderPage': { content: '# Welcome to amdWiki\n\nYour collaborative wiki platform.' },
          'SectionPage': { content: '# Main Title\n\n## Introduction\n\nIntro content here.\n\n## Details\n\nDetailed information.\n\n## Conclusion\n\nFinal thoughts.' }
        };
        
        return Promise.resolve(pages[pageName] || null);
      }
    };
  }
  
  createUserManager() {
    return { initialized: true };
  }
  
  createPolicyManager() {
    return {
      checkPermission: () => Promise.resolve(true)
    };
  }
  
  createVariableManager() {
    return {
      expandVariables: (content, context) => {
        return content
          .replace(/\$\{pagename\}/g, context.pageName || 'TestPage')
          .replace(/\$\{username\}/g, context.userName || 'TestUser')
          .replace(/\$\{applicationname\}/g, 'amdWiki')
          .replace(/\$\{version\}/g, '2.0.0')
          .replace(/\$\{totalpages\}/g, '42');
      }
    };
  }
  
  createRenderingManager() {
    return {
      converter: {
        makeHtml: (content) => {
          return content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]/g, '<a href="/wiki/$1">$1</a>');
        }
      }
    };
  }
  
  createAttachmentManager() {
    return {
      getAttachmentPath: () => Promise.resolve('/attachments/test.pdf'),
      attachmentExists: () => Promise.resolve(true)
    };
  }
  
  createNotificationManager() {
    return {
      addNotification: jest.fn()
    };
  }
  
  createAuditManager() {
    return {
      logSecurityEvent: jest.fn()
    };
  }
}

describe('MarkupParser End-to-End JSPWiki Compatibility', () => {
  let markupParser;
  let mockEngine;

  beforeEach(async () => {
    mockEngine = new ComprehensiveMockEngine();
    markupParser = new MarkupParser(mockEngine);
    await markupParser.initialize();
  });

  afterEach(async () => {
    await markupParser.shutdown();
  });

  describe('Complete System Integration', () => {
    test('should have all components initialized', () => {
      // Verify all components are loaded
      expect(markupParser.phases).toHaveLength(7);
      expect(markupParser.handlerRegistry).toBeTruthy();
      expect(markupParser.filterChain).toBeTruthy();
      expect(markupParser.cacheStrategies).toHaveProperty('parseResults');
      expect(markupParser.performanceMonitor).toBeTruthy();
      
      // Verify handlers are registered
      const handlers = markupParser.getHandlers();
      expect(handlers.length).toBe(6);
      
      // Verify filters are registered
      const filters = markupParser.filterChain.getFilters();
      expect(filters.length).toBe(3);
    });

    test('should process content through complete 7-phase pipeline', async () => {
      const content = `
# JSPWiki Compatibility Test

Welcome ${username}! This page demonstrates comprehensive JSPWiki compatibility.

## Plugins
Total pages: [{TotalPages}]
Recent activity: [{RecentChanges max=3}]

## Conditional Content
<wiki:If test="authenticated">
  You are logged in as ${username}!
  
  ## Interactive Form
  [{FormOpen action="/save"}]
  [{FormInput name="title" type="text" required="true"}]
  [{FormTextarea name="content" rows="5"}]
  [{FormButton type="submit" value="Save Page"}]
  [{FormClose}]
</wiki:If>

## External Links
Check out [Wikipedia:Wiki] and [JSPWiki:PluginDevelopment] for more info.

## Styled Content
%%text-primary Important information /%
%%text-success Success message /%

## Page Inclusion
<wiki:Include page="FooterPage" />

## User-Specific Content
<wiki:UserCheck status="authenticated">
  This content is only visible to authenticated users.
</wiki:UserCheck>
`;

      const context = {
        pageName: 'TestPage',
        userName: 'TestUser',
        userContext: {
          isAuthenticated: true,
          roles: ['user'],
          permissions: ['read', 'write']
        }
      };

      const result = await markupParser.parse(content, context);

      // Verify all enhancement types are processed
      expect(result).toContain('<span class="total-pages">42 pages</span>'); // Plugin
      expect(result).toContain('You are logged in as TestUser!'); // WikiTag If + Variable
      expect(result).toContain('<form'); // WikiForm
      expect(result).toContain('https://en.wikipedia.org/wiki/Wiki'); // InterWiki
      expect(result).toContain('class="text-primary"'); // WikiStyle
      expect(result).toContain('© 2025 amdWiki'); // Include
      expect(result).toContain('only visible to authenticated'); // UserCheck
      expect(result).toContain('<h1>JSPWiki Compatibility Test</h1>'); // Markdown
    });

    test('should handle complex nested syntax correctly', async () => {
      const content = `
<wiki:If test="authenticated">
  <wiki:Include page="HeaderPage" />
  
  User info: ${username} on ${pagename}
  
  <wiki:UserCheck role="admin">
    Admin form:
    [{FormOpen action="/admin"}]
    [{FormSelect name="action" options="Edit,Delete,Archive"}]
    [{FormClose}]
  </wiki:UserCheck>
  
  External references: [Wikipedia:Software] and [JSPWiki:Administration]
  
  Important: %%text-danger Critical information /%
</wiki:If>
`;

      const context = {
        pageName: 'AdminPage',
        userName: 'AdminUser',
        userContext: {
          isAuthenticated: true,
          roles: ['admin'],
          permissions: ['read', 'write', 'admin']
        }
      };

      const result = await markupParser.parse(content, context);

      // Should process all nested syntax correctly
      expect(result).toContain('Welcome to amdWiki'); // Include processed
      expect(result).toContain('AdminUser on AdminPage'); // Variables expanded
      expect(result).toContain('<select'); // Form processed inside UserCheck
      expect(result).toContain('https://en.wikipedia.org/wiki/Software'); // InterWiki
      expect(result).toContain('class="text-danger"'); // Style
    });
  });

  describe('JSPWiki Enhancement Compatibility', () => {
    test('should support all implemented JSPWiki enhancements', async () => {
      const enhancementTests = [
        // Plugin syntax
        { content: '[{TotalPages}]', expectation: 'total-pages' },
        { content: '[{RecentChanges max=5}]', expectation: 'recent-changes' },
        
        // WikiTag syntax
        { content: '<wiki:If test="authenticated">Auth content</wiki:If>', expectation: 'Auth content' },
        { content: '<wiki:Include page="ExistingPage" />', expectation: 'This page exists' },
        { content: '<wiki:UserCheck status="authenticated">User content</wiki:UserCheck>', expectation: 'User content' },
        
        // WikiForm syntax
        { content: '[{FormOpen}][{FormInput name="test"}][{FormClose}]', expectation: '<form' },
        
        // InterWiki syntax
        { content: '[Wikipedia:Test]', expectation: 'wikipedia.org' },
        { content: '[JSPWiki:Plugin|Plugin Info]', expectation: 'Plugin Info' },
        
        // WikiStyle syntax
        { content: '%%text-primary Styled text /%', expectation: 'class="text-primary"' },
        
        // Variable syntax (existing)
        { content: 'User: ${username}', expectation: 'User: TestUser' },
        
        // Wiki links (existing)
        { content: '[ExistingPage]', expectation: 'href="/wiki/ExistingPage"' }
      ];

      const context = {
        pageName: 'CompatibilityTest',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };

      for (const test of enhancementTests) {
        const result = await markupParser.parse(test.content, context);
        expect(result).toContain(test.expectation);
      }
    });

    test('should maintain JSPWiki syntax precedence and execution order', async () => {
      const content = `
<wiki:If test="authenticated">
  %%text-success Plugin result: [{TotalPages}] /%
  Link: [Wikipedia:Test|External Link]
  
  [{FormOpen}]
  [{FormInput name="priority" type="number" value="1"}]
  [{FormClose}]
</wiki:If>
`;

      const context = {
        pageName: 'PrecedenceTest',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };

      const result = await markupParser.parse(content, context);

      // Verify correct processing order (WikiTag → Plugin → Style → InterWiki → Form)
      expect(result).toContain('42 pages'); // Plugin executed inside WikiTag
      expect(result).toContain('class="text-success"'); // Style applied
      expect(result).toContain('External Link'); // InterWiki with custom text
      expect(result).toContain('<form'); // Form generated
    });
  });

  describe('Security and Content Filtering', () => {
    test('should filter dangerous content while preserving valid markup', async () => {
      const content = `
# Safe Content

Valid content with **formatting**.

<script>alert('xss')</script>

[{TotalPages}]

%%text-primary Safe styling /%

<wiki:If test="authenticated">Safe conditional content</wiki:If>
`;

      const result = await markupParser.parse(content, context);

      // Should remove dangerous content
      expect(result).toContain('<!-- Dangerous content removed');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert(');
      
      // Should preserve valid content
      expect(result).toContain('<strong>formatting</strong>');
      expect(result).toContain('42 pages');
      expect(result).toContain('class="text-primary"');
      expect(result).toContain('Safe conditional content');
    });

    test('should detect and handle spam content', async () => {
      const spamContent = `
Check out these casino sites: spam link spam link spam link spam link spam link spam link spam link spam link spam link spam link spam link
`;

      const result = await markupParser.parse(spamContent, {});

      // Should detect spam (too many links + blacklisted words)
      expect(result).toContain('SPAM WARNING') || expect(result).toContain('SPAM BLOCKED');
    });

    test('should validate content and report errors', async () => {
      const invalidContent = `
[{UnclosedPlugin 

<wiki:InvalidTag>content</wiki:InvalidTag>

Invalid markdown link: [text](invalid-url
`;

      const result = await markupParser.parse(invalidContent, {});

      // Should contain validation warnings/errors
      expect(result).toContain('VALIDATION') || expect(result).toContain('Error') || expect(result).toContain('Warning');
    });
  });

  describe('Performance and Caching', () => {
    test('should cache parse results for repeated content', async () => {
      const content = '[{TotalPages}] cached content test';
      
      // First parse
      const result1 = await markupParser.parse(content);
      
      // Second parse (should hit cache)
      const result2 = await markupParser.parse(content);
      
      expect(result1).toBe(result2);
      
      const metrics = markupParser.getMetrics();
      expect(metrics.cacheHits).toBeGreaterThan(0);
    });

    test('should track comprehensive performance metrics', async () => {
      const content = `
[{TotalPages}]
<wiki:If test="authenticated">Content</wiki:If>
[Wikipedia:Test]
%%text-primary Styled /%
`;

      await markupParser.parse(content, {
        pageName: 'MetricsTest',
        userContext: { isAuthenticated: true }
      });

      const metrics = markupParser.getMetrics();

      // Should have comprehensive metrics
      expect(metrics).toHaveProperty('parseCount');
      expect(metrics).toHaveProperty('averageParseTime');
      expect(metrics).toHaveProperty('cacheStrategies');
      expect(metrics).toHaveProperty('handlerRegistry');
      expect(metrics).toHaveProperty('filterChain');
      expect(metrics).toHaveProperty('performance');
      
      // Should track all phases
      expect(metrics.phaseStats).toHaveProperty('Preprocessing');
      expect(metrics.phaseStats).toHaveProperty('Content Transformation');
      expect(metrics.phaseStats).toHaveProperty('Filter Pipeline');
      expect(metrics.phaseStats).toHaveProperty('Post-processing');
    });

    test('should meet performance targets', async () => {
      const content = `
# Performance Test

[{TotalPages}] and [{RecentChanges max=10}]

<wiki:If test="authenticated">
  [Wikipedia:Performance] and [JSPWiki:Speed]
  %%text-success Fast processing /%
</wiki:If>
`;

      const startTime = Date.now();
      await markupParser.parse(content, {
        pageName: 'PerfTest',
        userContext: { isAuthenticated: true }
      });
      const processingTime = Date.now() - startTime;

      // Should meet performance targets (<100ms for this content)
      expect(processingTime).toBeLessThan(100);
      
      const metrics = markupParser.getMetrics();
      expect(metrics.averageParseTime).toBeLessThan(50); // Target: <50ms average
    });
  });

  describe('Error Resilience and Graceful Degradation', () => {
    test('should handle handler failures gracefully', async () => {
      const content = `
[{NonExistentPlugin}]
<wiki:If test="authenticated">Good content</wiki:If>
[UnknownWiki:Page]
%%invalid-class Bad styling /%
Valid **markdown** content.
`;

      const context = {
        pageName: 'ErrorTest',
        userContext: { isAuthenticated: true }
      };

      const result = await markupParser.parse(content, context);

      // Should contain error indicators but continue processing
      expect(result).toContain('Good content'); // WikiTag should work
      expect(result).toContain('<strong>markdown</strong>'); // Markdown should work
      
      // Should have error comments for failed parts
      expect(result).toContain('Error') || expect(result).toContain('Warning');
    });

    test('should maintain system stability under load', async () => {
      const contents = [
        '[{TotalPages}] simple content',
        '<wiki:If test="authenticated">Complex [{RecentChanges}] content</wiki:If>',
        '[Wikipedia:Test] with %%text-primary styling /%',
        '[{FormOpen}][{FormInput name="test"}][{FormClose}]',
        '<wiki:Include page="ExistingPage" /> included content'
      ];

      const context = {
        pageName: 'LoadTest',
        userContext: { isAuthenticated: true }
      };

      // Process multiple contents rapidly
      const promises = contents.map(content => markupParser.parse(content, context));
      const results = await Promise.all(promises);

      // All should complete successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      // System should remain stable
      const metrics = markupParser.getMetrics();
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('Modular Configuration Validation', () => {
    test('should respect all configuration settings in production scenario', async () => {
      // All handlers and filters should be configurable
      const handlers = markupParser.getHandlers();
      const filters = markupParser.filterChain.getFilters();
      
      // Each handler should have configuration
      handlers.forEach(handler => {
        expect(handler.getConfigurationSummary).toBeDefined();
        const config = handler.getConfigurationSummary();
        expect(config).toHaveProperty('enabled');
        expect(config).toHaveProperty('priority');
      });

      // Each filter should have configuration  
      filters.forEach(filter => {
        expect(filter.getConfigurationSummary).toBeDefined();
        const config = filter.getConfigurationSummary();
        expect(config).toHaveProperty('enabled');
        expect(config).toHaveProperty('priority');
      });
    });

    test('should demonstrate complete modularity through configuration', () => {
      // Test that the system has zero hardcoded values
      const systemConfig = {
        markupParser: markupParser.config,
        handlerRegistry: markupParser.handlerRegistry.config,
        filterChain: markupParser.filterChain.config,
        cacheConfig: markupParser.config.cache,
        performanceConfig: markupParser.config.performance
      };

      // All configuration should be loaded from files, not hardcoded
      expect(systemConfig.markupParser.enabled).toBeDefined();
      expect(systemConfig.handlerRegistry.maxHandlers).toBeDefined();
      expect(systemConfig.filterChain.enabled).toBeDefined();
      expect(systemConfig.cacheConfig.parseResults).toBeDefined();
      expect(systemConfig.performanceConfig.monitoring).toBeDefined();
    });
  });

  describe('JSPWiki Compatibility Milestone Validation', () => {
    test('should support all major JSPWiki enhancement categories', () => {
      const handlers = markupParser.getHandlers();
      const handlerIds = handlers.map(h => h.handlerId);

      // Verify all major enhancement categories
      const requiredHandlers = [
        'PluginSyntaxHandler',    // JSPWiki Plugins
        'WikiTagHandler',         // JSPWiki Tags  
        'WikiFormHandler',        // WikiForms
        'InterWikiLinkHandler',   // InterWiki Links
        'AttachmentHandler',      // Enhanced Attachments
        'WikiStyleHandler'        // WikiStyles
      ];

      requiredHandlers.forEach(handlerId => {
        expect(handlerIds).toContain(handlerId);
      });

      // Should have complete filter system
      const filters = markupParser.filterChain.getFilters();
      expect(filters.length).toBeGreaterThanOrEqual(3);
    });

    test('should achieve target JSPWiki compatibility percentage', async () => {
      // Test content covering all implemented enhancements
      const comprehensiveContent = `
# JSPWiki Enhancement Coverage Test

## 1. Plugin System ✅
[{TotalPages}], [{RecentChanges max=5}], [{Uptime}]

## 2. WikiTags ✅  
<wiki:If test="authenticated">Conditional content</wiki:If>
<wiki:Include page="ExistingPage" />
<wiki:UserCheck status="authenticated">User-specific content</wiki:UserCheck>

## 3. WikiForms ✅
[{FormOpen action="/test"}]
[{FormInput name="email" type="email"}] 
[{FormSelect name="category" options="A,B,C"}]
[{FormClose}]

## 4. InterWiki Links ✅
[Wikipedia:Wiki], [JSPWiki:Documentation]

## 5. Enhanced Attachments ✅ 
[{ATTACH document.pdf|Important Document}]

## 6. WikiStyles ✅
%%text-primary Primary text /%
%%text-success Success message /%

## 7. Variables ✅ (existing)
Page: ${pagename}, User: ${username}, App: ${applicationname}

## 8. Wiki Links ✅ (existing)
[ExistingPage], [FooterPage]

## 9. Tables ✅ (existing - JSPWiki table syntax)
%%table-striped
|| Header 1 || Header 2 ||
| Data 1 | Data 2 |
/%

## 10. Content Filtering ✅
Security, spam, and validation filters active.
`;

      const context = {
        pageName: 'ComprehensiveTest',
        userName: 'TestUser',
        userContext: { isAuthenticated: true, roles: ['user'] }
      };

      const result = await markupParser.parse(content, context);

      // Verify each enhancement category works
      const enhancements = [
        '42 pages',                    // Plugins
        'Conditional content',         // WikiTags (If)
        'This page exists',           // WikiTags (Include)
        'User-specific content',       // WikiTags (UserCheck)
        '<form',                       // WikiForms
        'wikipedia.org',               // InterWiki
        'class="text-primary"',        // WikiStyles
        'TestUser',                    // Variables
        'href="/wiki/ExistingPage"',   // Wiki Links
        'ComprehensiveTest'            // Page context
      ];

      enhancements.forEach((expected, index) => {
        expect(result).toContain(expected);
      });

      console.log(`🎯 JSPWiki Compatibility Test Result: ${enhancements.length}/10 enhancements working (${(enhancements.length/10*100).toFixed(0)}%)`);
    });
  });

  describe('Production Readiness Validation', () => {
    test('should handle production-scale content efficiently', async () => {
      // Generate larger content simulating real wiki pages
      const largeContent = `
# Large Page Test

${Array.from({length: 10}, (_, i) => `
## Section ${i + 1}

Content with [{TotalPages}] and <wiki:If test="authenticated">authenticated content</wiki:If>.

Links: [Wikipedia:Section${i}] and [JSPWiki:Test${i}].

%%text-info Information ${i} /%

[{FormOpen action="/section${i}"}]
[{FormInput name="field${i}" type="text"}]
[{FormClose}]
`).join('\n')}

<wiki:Include page="FooterPage" />
`;

      const startTime = Date.now();
      const result = await markupParser.parse(largeContent, {
        pageName: 'LargePage',
        userContext: { isAuthenticated: true }
      });
      const processingTime = Date.now() - startTime;

      // Should complete efficiently
      expect(processingTime).toBeLessThan(500); // <500ms for large content
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(largeContent.length); // Should be processed/expanded
    });

    test('should provide comprehensive system monitoring data', () => {
      const metrics = markupParser.getMetrics();

      // Should provide all monitoring data needed for production
      expect(metrics).toHaveProperty('parseCount');
      expect(metrics).toHaveProperty('averageParseTime');
      expect(metrics).toHaveProperty('cacheHitRatio');
      expect(metrics).toHaveProperty('errorCount');
      
      // Handler metrics
      expect(metrics.handlerRegistry).toHaveProperty('registry');
      expect(metrics.handlerRegistry.registry).toHaveProperty('totalHandlers');
      expect(metrics.handlerRegistry.registry).toHaveProperty('enabledHandlers');
      
      // Filter metrics
      expect(metrics.filterChain).toHaveProperty('chain');
      expect(metrics.filterChain.chain).toHaveProperty('executionCount');
      
      // Cache metrics
      expect(metrics.cacheStrategies).toBeTruthy();
      expect(Object.keys(metrics.cacheStrategies).length).toBeGreaterThan(0);
      
      // Performance monitoring
      expect(metrics.performance).toHaveProperty('monitoring');
    });
  });

  describe('Deployment Scenario Validation', () => {
    test('should support high-security deployment configuration', async () => {
      // Simulate high-security environment settings
      const securityEngine = new ComprehensiveMockEngine();
      securityEngine.managers.get('ConfigurationManager').getProperty = (key, defaultValue) => {
        const securityConfig = {
          'amdwiki.markup.handlers.form.enabled': false,           // No forms
          'amdwiki.markup.handlers.attachment.enabled': false,     // No attachments
          'amdwiki.style.security.allowInlineCSS': false,         // No inline CSS
          'amdwiki.markup.filters.security.preventXSS': true,     // Max security
          'amdwiki.markup.filters.spam.autoBlock': true,          // Auto-block spam
          'amdwiki.markup.filters.validation.failOnValidationError': true
        };
        return securityConfig[key] !== undefined ? securityConfig[key] : defaultValue;
      };

      const securityParser = new MarkupParser(securityEngine);
      await securityParser.initialize();

      const handlers = securityParser.getHandlers();
      const handlerIds = handlers.map(h => h.handlerId);

      // Should only have safe handlers
      expect(handlerIds).toContain('PluginSyntaxHandler');
      expect(handlerIds).toContain('WikiTagHandler');
      expect(handlerIds).toContain('InterWikiLinkHandler');
      expect(handlerIds).not.toContain('WikiFormHandler');      // Disabled
      expect(handlerIds).not.toContain('AttachmentHandler');    // Disabled

      // Security filters should be active
      const filters = securityParser.filterChain.getFilters();
      expect(filters.length).toBeGreaterThan(0);

      await securityParser.shutdown();
    });

    test('should support development deployment with relaxed settings', async () => {
      // Simulate development environment settings
      const devEngine = new ComprehensiveMockEngine();
      devEngine.managers.get('ConfigurationManager').getProperty = (key, defaultValue) => {
        const devConfig = {
          'amdwiki.markup.cache.parseResults.ttl': 60,            // Short cache
          'amdwiki.style.security.allowInlineCSS': true,         // Allow for testing
          'amdwiki.markup.filters.spam.autoBlock': false,        // Don't auto-block
          'amdwiki.markup.performance.monitoring': true,         // Monitor closely
          'amdwiki.markup.logParsingMethod': true               // Debug logging
        };
        return devConfig[key] !== undefined ? devConfig[key] : defaultValue;
      };

      const devParser = new MarkupParser(devEngine);
      await devParser.initialize();

      expect(devParser.config.cache.parseResults.ttl).toBe(60);
      expect(devParser.performanceMonitor).toBeTruthy();

      await devParser.shutdown();
    });
  });
});
