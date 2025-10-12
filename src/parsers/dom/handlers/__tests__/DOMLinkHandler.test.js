/**
 * Unit tests for DOMLinkHandler
 * Tests DOM-based link processing
 *
 * Part of Phase 5 of WikiDocument DOM Migration (GitHub Issue #108)
 */

const DOMLinkHandler = require('../DOMLinkHandler');
const WikiDocument = require('../../WikiDocument');
const { DOMParser } = require('../../DOMParser');

// Mock engine with PageManager and ConfigurationManager
const createMockEngine = () => {
  const mockPageNames = ['HomePage', 'WikiDocumentation', 'TestPage', 'PageIndex'];

  return {
    getManager: jest.fn((name) => {
      if (name === 'PageManager') {
        return {
          getAllPages: jest.fn(async () => mockPageNames)
        };
      }
      if (name === 'ConfigurationManager') {
        return {
          getProperty: jest.fn((key, defaultValue) => {
            if (key === 'amdwiki.translatorReader.matchEnglishPlurals') return true;
            if (key === 'amdwiki.interwiki.enabled') return true;
            if (key === 'amdwiki.interwiki.sites') {
              return {
                Wikipedia: { url: 'https://en.wikipedia.org/wiki/%s', enabled: true, openInNewWindow: true },
                JSPWiki: { url: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s', enabled: true, openInNewWindow: true }
              };
            }
            return defaultValue;
          })
        };
      }
      return null;
    })
  };
};

describe('DOMLinkHandler', () => {
  let handler;
  let mockEngine;
  let parser;

  beforeEach(async () => {
    mockEngine = createMockEngine();
    handler = new DOMLinkHandler(mockEngine);
    await handler.initialize();

    // Create parser for integration tests
    parser = new DOMParser();
  });

  describe('Constructor and Initialization', () => {
    test('creates handler with engine', () => {
      expect(handler.engine).toBe(mockEngine);
      expect(handler.linkParser).not.toBeNull();
    });

    test('loads page names from PageManager', async () => {
      expect(handler.pageNames.size).toBeGreaterThan(0);
      expect(handler.pageNames.has('HomePage')).toBe(true);
      expect(handler.pageNames.has('TestPage')).toBe(true);
    });

    test('warns if PageManager not available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const badEngine = {
        getManager: jest.fn(() => null)
      };

      const badHandler = new DOMLinkHandler(badEngine);
      await badHandler.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PageManager not available')
      );

      consoleSpy.mockRestore();
    });

    test('loads InterWiki sites configuration', async () => {
      const sites = handler.linkParser.interWikiSites;
      expect(sites.size).toBeGreaterThan(0);
      expect(sites.has('Wikipedia')).toBe(true);
      expect(sites.has('JSPWiki')).toBe(true);
    });
  });

  describe('processLinks()', () => {
    test('processes internal wiki link (existing page)', async () => {
      const wikiDoc = parser.parse('[HomePage]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="/wiki/HomePage"');
      expect(html).toContain('class="wiki-link wikipage"');
      expect(html).not.toContain('redlink');
    });

    test('processes internal wiki link (non-existing page)', async () => {
      const wikiDoc = parser.parse('[NonExistingPage]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="/edit/NonExistingPage"');
      expect(html).toContain('class="wiki-link redlink"');
      expect(html).toContain('color: red');
      expect(html).toContain('Create page: NonExistingPage');
    });

    test('processes internal link with display text', async () => {
      const wikiDoc = parser.parse('[Go Home|HomePage]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Go Home');
      expect(html).toContain('href="/wiki/HomePage"');
      expect(html).toContain('wikipage');
    });

    test('processes external link', async () => {
      const wikiDoc = parser.parse('[Google|https://www.google.com]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="https://www.google.com"');
      expect(html).toContain('class="wiki-link external-link"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    test('processes InterWiki link', async () => {
      const wikiDoc = parser.parse('[Wiki Article|Wikipedia:DOM_Parsing]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="https://en.wikipedia.org/wiki/DOM_Parsing"');
      expect(html).toContain('class="wiki-link interwiki-link interwiki-wikipedia"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    test('processes email link', async () => {
      const wikiDoc = parser.parse('[Contact|mailto:test@example.com]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="mailto:test@example.com"');
      expect(html).toContain('class="wiki-link email-link"');
    });

    test('processes anchor link', async () => {
      const wikiDoc = parser.parse('[Jump to Section|#section]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="#section"');
      expect(html).toContain('class="wiki-link anchor-link"');
    });

    test('processes multiple links of different types', async () => {
      const wikiDoc = parser.parse(
        '[HomePage] and [Google|https://google.com] and [Wiki|Wikipedia:Test]',
        {}
      );

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('wikipage');
      expect(html).toContain('external-link');
      expect(html).toContain('interwiki-link');
    });

    test('returns unchanged document if no links', async () => {
      const wikiDoc = parser.parse('No links here', {});
      const originalHTML = wikiDoc.toHTML();

      await handler.processLinks(wikiDoc, {});

      const newHTML = wikiDoc.toHTML();
      expect(newHTML).toBe(originalHTML);
    });

    test('handles link processing errors gracefully', async () => {
      const wikiDoc = parser.parse('[TestLink]', {});

      // Force an error by making linkParser null
      const originalLinkParser = handler.linkParser;
      handler.linkParser = null;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processLinks(wikiDoc, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot process links')
      );

      consoleSpy.mockRestore();
      handler.linkParser = originalLinkParser;
    });
  });

  describe('Link Type Determination', () => {
    test('correctly identifies internal link', () => {
      const linkInfo = { text: 'HomePage', target: 'HomePage', attributes: {} };
      const linkType = handler.linkParser.determineLinkType(linkInfo);
      expect(linkType).toBe('internal');
    });

    test('correctly identifies external HTTP link', () => {
      const linkInfo = { text: 'Google', target: 'http://www.google.com', attributes: {} };
      const linkType = handler.linkParser.determineLinkType(linkInfo);
      expect(linkType).toBe('external');
    });

    test('correctly identifies external HTTPS link', () => {
      const linkInfo = { text: 'Google', target: 'https://www.google.com', attributes: {} };
      const linkType = handler.linkParser.determineLinkType(linkInfo);
      expect(linkType).toBe('external');
    });

    test('correctly identifies InterWiki link', () => {
      const linkInfo = { text: 'Article', target: 'Wikipedia:Article', attributes: {} };
      const linkType = handler.linkParser.determineLinkType(linkInfo);
      expect(linkType).toBe('interwiki');
    });

    test('correctly identifies email link', () => {
      const linkInfo = { text: 'Email', target: 'mailto:test@example.com', attributes: {} };
      const linkType = handler.linkParser.determineLinkType(linkInfo);
      expect(linkType).toBe('email');
    });

    test('correctly identifies anchor link', () => {
      const linkInfo = { text: 'Section', target: '#section', attributes: {} };
      const linkType = handler.linkParser.determineLinkType(linkInfo);
      expect(linkType).toBe('anchor');
    });
  });

  describe('getStatistics()', () => {
    test('returns statistics for document with links', async () => {
      const wikiDoc = parser.parse(
        '[HomePage] and [NonExisting] and [Google|https://google.com]',
        {}
      );

      await handler.processLinks(wikiDoc, {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalLinks).toBe(3);
      expect(stats.linkTypes.internal).toBe(2); // HomePage + NonExisting
      expect(stats.linkTypes.external).toBe(1); // Google
      expect(stats.redLinks).toBe(1); // NonExisting
    });

    test('returns empty statistics for document without links', () => {
      const wikiDoc = parser.parse('No links', {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalLinks).toBe(0);
    });

    test('counts InterWiki links', async () => {
      const wikiDoc = parser.parse('[Article|Wikipedia:DOM]', {});

      await handler.processLinks(wikiDoc, {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalLinks).toBe(1);
      expect(stats.linkTypes.interwiki).toBe(1);
    });

    test('counts different link types correctly', async () => {
      const wikiDoc = parser.parse(
        '[HomePage] [Email|mailto:test@example.com] [Section|#top] [Wiki|Wikipedia:Test] [Site|https://example.com]',
        {}
      );

      await handler.processLinks(wikiDoc, {});

      const stats = handler.getStatistics(wikiDoc);

      expect(stats.totalLinks).toBe(5);
      expect(stats.linkTypes.internal).toBe(1);
      expect(stats.linkTypes.email).toBe(1);
      expect(stats.linkTypes.anchor).toBe(1);
      expect(stats.linkTypes.interwiki).toBe(1);
      expect(stats.linkTypes.external).toBe(1);
    });
  });

  describe('Integration with DOMParser', () => {
    test('links in paragraphs', async () => {
      const wikiDoc = parser.parse('Check out [HomePage] for more info', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('Check out');
      expect(html).toContain('for more info');
      expect(html).toContain('href="/wiki/HomePage"');
    });

    test('links with other markup', async () => {
      const wikiDoc = parser.parse('__Bold__ and [HomePage]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('<strong');
      expect(html).toContain('href="/wiki/HomePage"');
    });

    test('multiple links in same paragraph', async () => {
      const wikiDoc = parser.parse('[HomePage] and [WikiDocumentation] pages', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="/wiki/HomePage"');
      expect(html).toContain('href="/wiki/WikiDocumentation"');
    });
  });

  describe('Escaped Content', () => {
    test('does NOT process links in escaped content', async () => {
      const wikiDoc = parser.parse('[[Links like [HomePage] should not work]]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      // Should contain the literal link syntax
      expect(html).toContain('[HomePage]');
      // Should NOT contain a processed link
      expect(html).not.toContain('href="/wiki/HomePage"');
    });

    test('processes links outside escaped content but not inside', async () => {
      const wikiDoc = parser.parse(
        '[HomePage] and [[Do not process [TestPage]]]',
        {}
      );

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      // Outside escaped: processed
      expect(html).toContain('href="/wiki/HomePage"');
      // Inside escaped: NOT processed
      expect(html).toContain('[TestPage]');
      // Only one processed link
      const linkCount = (html.match(/href="\/wiki\//g) || []).length;
      expect(linkCount).toBe(1);
    });
  });

  describe('Page Name Matching', () => {
    test('handles fuzzy matching for existing pages', async () => {
      // PageNameMatcher should match "HomePage" even with different case
      const wikiDoc = parser.parse('[homepage]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      // Should match HomePage (case-insensitive)
      expect(html).toContain('href="/wiki/HomePage"');
      expect(html).toContain('wikipage');
    });

    test('creates red link for truly non-existing page', async () => {
      const wikiDoc = parser.parse('[CompletelyNonExistentPage]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('href="/edit/CompletelyNonExistentPage"');
      expect(html).toContain('redlink');
    });
  });

  describe('InterWiki Site Handling', () => {
    test('processes known InterWiki site', async () => {
      const wikiDoc = parser.parse('[JSPWiki Docs|JSPWiki:WikiDocumentation]', {});

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      const html = wikiDoc.toHTML();
      expect(html).toContain('https://jspwiki-wiki.apache.org/Wiki.jsp?page=WikiDocumentation');
      expect(html).toContain('interwiki-jspwiki');
    });

    test('warns on unknown InterWiki site', async () => {
      const wikiDoc = parser.parse('[Unknown|UnknownWiki:Page]', {});

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown InterWiki site')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    test('handles many links efficiently', async () => {
      const links = Array(50).fill('[HomePage]').join(' ');
      const wikiDoc = parser.parse(links, {});

      const start = Date.now();
      await handler.processLinks(wikiDoc, { pageName: 'TestPage' });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Should be fast
    });
  });

  describe('Edge Cases', () => {
    test('handles link with empty target', async () => {
      // Parse a document and then remove the data-wiki-link attribute to simulate missing data
      const wikiDoc = parser.parse('[TestLink]', {});

      // Find the link element and remove its data-wiki-link attribute
      const linkElement = wikiDoc.querySelectorAll('a.wiki-link')[0];
      linkElement.removeAttribute('data-wiki-link');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processLinks(wikiDoc, {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing data-wiki-link attribute')
      );

      consoleSpy.mockRestore();
    });

    test('handles invalid InterWiki format', async () => {
      // Create link with invalid InterWiki format (missing colon)
      const wikiDoc = parser.parse('[InvalidWikiPage]', {});

      // Manually modify to look like InterWiki but with invalid format
      const linkElement = wikiDoc.querySelectorAll('a.wiki-link')[0];
      linkElement.setAttribute('data-wiki-link', 'WikiWithoutColon');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await handler.processLinks(wikiDoc, {});

      // Should process as internal link (fallback behavior)
      const html = wikiDoc.toHTML();
      expect(html).toContain('redlink'); // Non-existing internal page

      consoleSpy.mockRestore();
    });
  });
});
