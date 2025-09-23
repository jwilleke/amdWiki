/**
 * Comprehensive test suite for LinkParser
 * Tests all link parsing functionality including security features
 */

const { LinkParser, Link } = require('../LinkParser');

describe('LinkParser', () => {
  let linkParser;

  beforeEach(() => {
    linkParser = new LinkParser();
    // Set up some test page names
    linkParser.setPageNames(['ExistingPage', 'Another Page', 'Test-Page']);

    // Set up InterWiki sites
    linkParser.setInterWikiSites({
      'Wikipedia': {
        url: 'https://en.wikipedia.org/wiki/%s',
        description: 'Wikipedia English',
        openInNewWindow: true
      },
      'JSPWiki': {
        url: 'https://jspwiki-wiki.apache.org/Wiki.jsp?page=%s',
        description: 'JSPWiki Documentation',
        openInNewWindow: false
      }
    });
  });

  describe('Constructor and Configuration', () => {
    test('should create LinkParser with default options', () => {
      const parser = new LinkParser();
      expect(parser).toBeInstanceOf(LinkParser);
      expect(parser.options.allowedAttributes).toContain('class');
      expect(parser.options.allowedAttributes).toContain('id');
      expect(parser.pageNames).toBeInstanceOf(Set);
    });

    test('should create LinkParser with custom options', () => {
      const customOptions = {
        allowedAttributes: ['class', 'id'],
        security: { validateUrls: false }
      };
      const parser = new LinkParser(customOptions);
      expect(parser.options.allowedAttributes).toEqual(['class', 'id']);
      expect(parser.options.security.validateUrls).toBe(false);
    });

    test('should add page names correctly', () => {
      const parser = new LinkParser();
      parser.addPageName('TestPage');
      expect(parser.pageNames.has('TestPage')).toBe(true);
    });

    test('should handle invalid page names gracefully', () => {
      const parser = new LinkParser();
      parser.addPageName(null);
      parser.addPageName(123);
      parser.addPageName('');
      expect(parser.pageNames.size).toBe(0);
    });
  });

  describe('Link Finding and Pattern Matching', () => {
    test('should find simple wiki links', () => {
      const content = 'Check out [ExistingPage] for more info.';
      const links = linkParser.findLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].text).toBe('ExistingPage');
      expect(links[0].target).toBeNull();
      expect(links[0].originalText).toBe('[ExistingPage]');
    });

    test('should find pipe syntax links', () => {
      const content = 'Visit [My Link|ExistingPage] today.';
      const links = linkParser.findLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].text).toBe('My Link');
      expect(links[0].target).toBe('ExistingPage');
    });

    test('should find links with attributes', () => {
      const content = 'Check [Link Text|http://example.com|target="_blank" class="external"]';
      const links = linkParser.findLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].text).toBe('Link Text');
      expect(links[0].target).toBe('http://example.com');
      expect(links[0].attributesString).toBe('target="_blank" class="external"');
    });

    test('should find multiple links in content', () => {
      const content = 'See [Page1] and [Page2|Target] and [Page3|http://example.com].';
      const links = linkParser.findLinks(content);

      expect(links).toHaveLength(3);
      expect(links[0].text).toBe('Page1');
      expect(links[1].text).toBe('Page2');
      expect(links[2].text).toBe('Page3');
    });

    test('should handle empty or invalid content', () => {
      expect(linkParser.findLinks('')).toEqual([]);
      expect(linkParser.findLinks(null)).toEqual([]);
      expect(linkParser.findLinks(undefined)).toEqual([]);
    });
  });

  describe('Attribute Parsing', () => {
    test('should parse valid attributes', () => {
      const attrString = 'class="test-class" id="test-id" title="Test Title"';
      const attributes = linkParser.parseAttributes(attrString);

      expect(attributes.class).toBe('test-class');
      expect(attributes.id).toBe('test-id');
      expect(attributes.title).toBe('Test Title');
    });

    test('should ignore disallowed attributes', () => {
      const attrString = 'onclick="alert(1)" class="safe" onerror="bad()"';
      const attributes = linkParser.parseAttributes(attrString);

      expect(attributes.class).toBe('safe');
      expect(attributes.onclick).toBeUndefined();
      expect(attributes.onerror).toBeUndefined();
    });

    test('should validate target attribute values', () => {
      const validTargets = 'target="_blank"';
      const invalidTargets = 'target="javascript:alert(1)"';

      const validAttrs = linkParser.parseAttributes(validTargets);
      const invalidAttrs = linkParser.parseAttributes(invalidTargets);

      expect(validAttrs.target).toBe('_blank');
      expect(invalidAttrs.target).toBeUndefined();
    });

    test('should sanitize style attributes when security is enabled', () => {
      const styleString = 'style="color: red; javascript:alert(1); background: blue;"';
      const attributes = linkParser.parseAttributes(styleString);

      expect(attributes.style).toBeDefined();
      expect(attributes.style).not.toContain('javascript:');
    });
  });

  describe('Link Type Determination', () => {
    test('should identify external HTTP links', () => {
      const link = new Link({ text: 'Example', target: 'http://example.com' });
      expect(linkParser.determineLinkType(link)).toBe('external');
    });

    test('should identify external HTTPS links', () => {
      const link = new Link({ text: 'Example', target: 'https://example.com' });
      expect(linkParser.determineLinkType(link)).toBe('external');
    });

    test('should identify email links', () => {
      const link = new Link({ text: 'Contact', target: 'mailto:user@example.com' });
      expect(linkParser.determineLinkType(link)).toBe('email');
    });

    test('should identify anchor links', () => {
      const link = new Link({ text: 'Section', target: '#section1' });
      expect(linkParser.determineLinkType(link)).toBe('anchor');
    });

    test('should identify InterWiki links', () => {
      const link = new Link({ text: 'Wiki Page', target: 'Wikipedia:Test_Page' });
      expect(linkParser.determineLinkType(link)).toBe('interwiki');
    });

    test('should default to internal links', () => {
      const link = new Link({ text: 'Internal Page' });
      expect(linkParser.determineLinkType(link)).toBe('internal');
    });

    test('should identify absolute paths as external', () => {
      const link = new Link({ text: 'File', target: '/path/to/file' });
      expect(linkParser.determineLinkType(link)).toBe('external');
    });
  });

  describe('Internal Link Generation', () => {
    test('should generate link to existing page', () => {
      const link = new Link({ text: 'ExistingPage' });
      const html = linkParser.generateInternalLink(link, {});

      expect(html).toContain('href="/wiki/ExistingPage"');
      expect(html).toContain('class="wikipage"');
      expect(html).toContain('>ExistingPage</a>');
      expect(html).not.toContain('color: red');
    });

    test('should generate red link for non-existing page', () => {
      const link = new Link({ text: 'NonExistentPage' });
      const html = linkParser.generateInternalLink(link, {});

      expect(html).toContain('href="/edit/NonExistentPage"');
      expect(html).toContain('class="redlink"');
      expect(html).toContain('style="color: red;"');
      expect(html).toContain('title="Create page: NonExistentPage"');
    });

    test('should handle pipe syntax for internal links', () => {
      const link = new Link({ text: 'Display Text', target: 'ExistingPage' });
      const html = linkParser.generateInternalLink(link, {});

      expect(html).toContain('href="/wiki/ExistingPage"');
      expect(html).toContain('>Display Text</a>');
    });

    test('should include custom attributes', () => {
      const link = new Link({
        text: 'ExistingPage',
        attributes: { id: 'custom-id', title: 'Custom Title' }
      });
      const html = linkParser.generateInternalLink(link, {});

      expect(html).toContain('id="custom-id"');
      expect(html).toContain('title="Custom Title"');
    });
  });

  describe('External Link Generation', () => {
    test('should generate external link with security attributes', () => {
      const link = new Link({ text: 'External', target: 'https://example.com' });
      const html = linkParser.generateExternalLink(link, {});

      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('class="external-link"');
    });

    test('should reject unsafe URLs when validation is enabled', () => {
      const link = new Link({ text: 'Bad', target: 'javascript:alert(1)' });

      expect(() => {
        linkParser.generateExternalLink(link, {});
      }).toThrow('Unsafe URL');
    });

    test('should allow unsafe URLs when validation is disabled', () => {
      const unsafeParser = new LinkParser({
        security: { validateUrls: false }
      });
      const link = new Link({ text: 'JS', target: 'javascript:alert(1)' });

      const html = unsafeParser.generateExternalLink(link, {});
      expect(html).toContain('javascript:alert(1)');
    });
  });

  describe('InterWiki Link Generation', () => {
    test('should generate InterWiki link for known site', () => {
      const link = new Link({ text: 'Wiki Page', target: 'Wikipedia:Test_Page' });
      const html = linkParser.generateInterWikiLink(link, {});

      expect(html).toContain('href="https://en.wikipedia.org/wiki/Test_Page"');
      expect(html).toContain('class="interwiki-link interwiki-wikipedia"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('title="Wikipedia English: Wiki Page"');
    });

    test('should handle InterWiki site that opens in same window', () => {
      const link = new Link({ text: 'JSP Page', target: 'JSPWiki:TestPage' });
      const html = linkParser.generateInterWikiLink(link, {});

      expect(html).toContain('href="https://jspwiki-wiki.apache.org/Wiki.jsp?page=TestPage"');
      expect(html).not.toContain('target="_blank"');
      expect(html).not.toContain('rel="noopener noreferrer"');
    });

    test('should throw error for unknown InterWiki site', () => {
      const link = new Link({ text: 'Unknown', target: 'UnknownWiki:Page' });

      expect(() => {
        linkParser.generateInterWikiLink(link, {});
      }).toThrow('Unknown InterWiki site: UnknownWiki');
    });

    test('should throw error for invalid InterWiki format', () => {
      const link = new Link({ text: 'Invalid', target: 'InvalidFormat' });

      expect(() => {
        linkParser.generateInterWikiLink(link, {});
      }).toThrow('Invalid InterWiki format');
    });
  });

  describe('Email and Anchor Links', () => {
    test('should generate email link', () => {
      const link = new Link({ text: 'Contact Us', target: 'mailto:test@example.com' });
      const html = linkParser.generateEmailLink(link, {});

      expect(html).toContain('href="mailto:test@example.com"');
      expect(html).toContain('class="email-link"');
      expect(html).toContain('>Contact Us</a>');
    });

    test('should generate anchor link', () => {
      const link = new Link({ text: 'Go to Top', target: '#top' });
      const html = linkParser.generateAnchorLink(link, {});

      expect(html).toContain('href="#top"');
      expect(html).toContain('class="anchor-link"');
      expect(html).toContain('>Go to Top</a>');
    });
  });

  describe('Full Link Processing', () => {
    test('should process mixed link types in content', () => {
      const content = `
        Visit [ExistingPage] and [Non-Existent Page].
        Check out [Google|https://google.com] or email [Support|mailto:help@test.com].
        See [Wikipedia Article|Wikipedia:Main_Page] and [Top|#top].
      `;

      const result = linkParser.parseLinks(content, {});

      // Should contain various link types
      expect(result).toContain('href="/wiki/ExistingPage"');
      expect(result).toContain('href="/edit/Non-Existent%20Page"');
      expect(result).toContain('href="https://google.com"');
      expect(result).toContain('href="mailto:help@test.com"');
      expect(result).toContain('href="https://en.wikipedia.org/wiki/Main_Page"');
      expect(result).toContain('href="#top"');
    });

    test('should maintain original content when no links found', () => {
      const content = 'This content has no links at all.';
      const result = linkParser.parseLinks(content, {});

      expect(result).toBe(content);
    });

    test('should handle malformed links gracefully', () => {
      const content = 'This has [unclosed link and [|empty target] and [||double pipes].';
      const result = linkParser.parseLinks(content, {});

      // Should not crash and should leave malformed links as-is or process what it can
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should escape HTML in link text and URLs', () => {
      const content = '[<script>alert(1)</script>|http://example.com/<test>]';
      const result = linkParser.parseLinks(content, {});

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;test&gt;');
    });
  });

  describe('Security Features', () => {
    test('should sanitize attribute values', () => {
      const maliciousValue = 'test" onclick="alert(1)" data="';
      const sanitized = linkParser.sanitizeAttributeValue(maliciousValue);

      expect(sanitized).not.toContain('onclick=');
      expect(sanitized).not.toContain('javascript:');
    });

    test('should sanitize style attributes', () => {
      const maliciousStyle = 'color: red; javascript:alert(1); expression(alert(1)); url(javascript:void);';
      const sanitized = linkParser.sanitizeStyleAttribute(maliciousStyle);

      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('expression(');
      expect(sanitized).not.toContain('url(');
      expect(sanitized).toContain('color: red');
    });

    test('should validate URL safety', () => {
      expect(linkParser.isUrlSafe('http://example.com')).toBe(true);
      expect(linkParser.isUrlSafe('https://example.com')).toBe(true);
      expect(linkParser.isUrlSafe('ftp://example.com')).toBe(false);
      expect(linkParser.isUrlSafe('javascript:alert(1)')).toBe(false);
      expect(linkParser.isUrlSafe('http://localhost')).toBe(false);
      expect(linkParser.isUrlSafe('http://evil..com')).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    test('should escape HTML correctly', () => {
      const html = '<script>alert("XSS & stuff")</script>';
      const escaped = linkParser.escapeHtml(html);

      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS &amp; stuff&quot;)&lt;/script&gt;');
    });

    test('should build attribute strings correctly', () => {
      const attrs = linkParser.buildAttributeString(
        { class: 'custom', id: 'test' },
        { target: '_blank', class: 'default' }
      );

      expect(attrs).toContain('class="custom"'); // Custom overrides default
      expect(attrs).toContain('id="test"');
      expect(attrs).toContain('target="_blank"');
    });

    test('should return empty string for empty attributes', () => {
      const attrs = linkParser.buildAttributeString({}, {});
      expect(attrs).toBe('');
    });

    test('should filter undefined values from attributes', () => {
      const attrs = linkParser.buildAttributeString(
        { class: 'test', title: undefined, id: null },
        { target: '_blank' }
      );

      expect(attrs).toContain('class="test"');
      expect(attrs).toContain('target="_blank"');
      expect(attrs).not.toContain('title=');
      expect(attrs).toContain('id="null"'); // null becomes string "null"
    });

    test('should provide parser statistics', () => {
      const stats = linkParser.getStats();

      expect(stats.pageNamesCount).toBe(3); // Set in beforeEach
      expect(stats.interWikiSitesCount).toBe(2); // Set in beforeEach
      expect(stats.allowedAttributes).toBeGreaterThan(0);
      expect(typeof stats.securityEnabled).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('should handle plugin execution errors gracefully', () => {
      const content = 'Test [InvalidInterWiki:Page] link.';

      // Should not throw, but log warning and leave original text
      const result = linkParser.parseLinks(content, {});
      expect(result).toBeDefined();
    });

    test('should handle non-string content', () => {
      expect(linkParser.parseLinks(123)).toBe(123);
      expect(linkParser.parseLinks(null)).toBe(null);
      expect(linkParser.parseLinks(undefined)).toBe(undefined);
    });
  });
});

describe('Link Class', () => {
  test('should create Link with default values', () => {
    const link = new Link();
    expect(link.originalText).toBe('');
    expect(link.text).toBe('');
    expect(link.target).toBeNull();
    expect(link.attributes).toEqual({});
  });

  test('should create Link with provided data', () => {
    const data = {
      originalText: '[Test|Target]',
      text: 'Test',
      target: 'Target',
      attributes: { class: 'test' }
    };
    const link = new Link(data);

    expect(link.originalText).toBe('[Test|Target]');
    expect(link.text).toBe('Test');
    expect(link.target).toBe('Target');
    expect(link.attributes.class).toBe('test');
  });

  test('should identify simple links correctly', () => {
    const simpleLink = new Link({ text: 'Test' });
    const pipeLink = new Link({ text: 'Test', target: 'Target' });

    expect(simpleLink.isSimple()).toBe(true);
    expect(pipeLink.isSimple()).toBe(false);
  });

  test('should get effective target correctly', () => {
    const simpleLink = new Link({ text: 'Test' });
    const pipeLink = new Link({ text: 'Display', target: 'Target' });

    expect(simpleLink.getEffectiveTarget()).toBe('Test');
    expect(pipeLink.getEffectiveTarget()).toBe('Target');
  });

  test('should handle attributes correctly', () => {
    const link = new Link();
    expect(link.hasAttributes()).toBe(false);

    link.setAttribute('class', 'test');
    expect(link.hasAttributes()).toBe(true);
    expect(link.getAttribute('class')).toBe('test');
    expect(link.getAttribute('CLASS')).toBe('test'); // Case insensitive
  });

  test('should convert to object correctly', () => {
    const link = new Link({
      text: 'Test',
      target: 'Target',
      attributes: { class: 'test' }
    });

    const obj = link.toObject();
    expect(obj.text).toBe('Test');
    expect(obj.target).toBe('Target');
    expect(obj.attributes.class).toBe('test');
    expect(obj.isSimple).toBe(false);
    expect(obj.hasAttributes).toBe(true);
  });
});