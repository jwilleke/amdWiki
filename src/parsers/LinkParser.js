/**
 * LinkParser - Centralized link parsing for amdWiki
 *
 * Inspired by JSPWiki's link parsing implementation, this class provides
 * a centralized, flexible, and maintainable approach to parsing various
 * types of links in wiki content.
 *
 * Supports the following link formats:
 * - [PageName] - Simple internal wiki links
 * - [DisplayText|Target] - Links with custom display text
 * - [DisplayText|Target|attributes] - Links with custom attributes
 *
 * Features:
 * - Centralized parsing logic to reduce brittle code
 * - Security-focused attribute validation
 * - Support for internal wiki links, external links, and InterWiki links
 * - Extensible architecture for future link types
 * - Comprehensive error handling and validation
 *
 * @author amdWiki
 * @version 1.0.0
 * @see https://github.com/jwilleke/amdWiki/issues/75
 */

const PageNameMatcher = require('../utils/PageNameMatcher');

class LinkParser {
  /**
   * Create a new LinkParser instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      // Security: allowed HTML attributes for links
      allowedAttributes: [
        'class', 'id', 'title', 'target', 'rel', 'style',
        'accesskey', 'tabindex', 'hreflang', 'type', 'dir', 'lang'
      ],

      // Default classes for different link types
      defaultClasses: {
        internal: 'wikipage',
        external: 'external-link',
        interwiki: 'interwiki-link',
        redlink: 'redlink'
      },

      // URL patterns for validation
      urlPatterns: {
        external: /^https?:\/\//i,
        email: /^mailto:/i,
        anchor: /^#/,
        absolute: /^\//
      },

      // InterWiki site patterns
      interWikiPattern: /^([A-Za-z0-9]+):(.+)$/,

      // Enable security features
      security: {
        validateUrls: true,
        sanitizeAttributes: true,
        preventXSS: true
      },

      // Override with user options
      ...options
    };

    // Cache for page names (set externally)
    this.pageNames = new Set();

    // Page name matcher for fuzzy matching (plurals, case)
    this.pageNameMatcher = null;

    // InterWiki sites configuration
    this.interWikiSites = new Map();

    // Link pattern: [text] or [text|target] or [text|target|attributes]
    this.linkPattern = /\[([^\|\]]+)(?:\|([^\|\]]+))?(?:\|([^\]]+))?\]/g;
  }

  /**
   * Set the list of existing wiki page names for link validation
   * @param {Array<string>} pageNames - Array of page names
   * @param {boolean} matchEnglishPlurals - Enable plural matching (default: true)
   */
  setPageNames(pageNames, matchEnglishPlurals = true) {
    this.pageNames = new Set(pageNames || []);
    this.pageNameMatcher = new PageNameMatcher(matchEnglishPlurals);
  }

  /**
   * Add a page name to the known pages
   * @param {string} pageName - Page name to add
   */
  addPageName(pageName) {
    if (pageName && typeof pageName === 'string') {
      this.pageNames.add(pageName);
    }
  }

  /**
   * Set InterWiki sites configuration
   * @param {Map|Object} sites - InterWiki sites configuration
   */
  setInterWikiSites(sites) {
    if (sites instanceof Map) {
      this.interWikiSites = sites;
    } else if (typeof sites === 'object') {
      this.interWikiSites = new Map(Object.entries(sites));
    }
  }

  /**
   * Parse all links in the given content
   * @param {string} content - Content containing wiki links
   * @param {Object} context - Parsing context (pageName, etc.)
   * @returns {string} Content with links converted to HTML
   */
  parseLinks(content, context = {}) {
    if (!content || typeof content !== 'string') {
      return content;
    }

    const links = this.findLinks(content);

    // Process links in reverse order to maintain string positions
    let processedContent = content;

    for (let i = links.length - 1; i >= 0; i--) {
      const linkInfo = links[i];

      try {
        const htmlLink = this.generateLinkHtml(linkInfo, context);

        processedContent =
          processedContent.slice(0, linkInfo.startIndex) +
          htmlLink +
          processedContent.slice(linkInfo.endIndex);

      } catch (error) {
        console.warn(`LinkParser: Error processing link "${linkInfo.originalText}":`, error.message);
        // Leave original text on error
      }
    }

    return processedContent;
  }

  /**
   * Find all links in the content
   * @param {string} content - Content to search
   * @returns {Array<Link>} Array of Link objects
   */
  findLinks(content) {
    const links = [];
    let match;

    // Reset regex state
    this.linkPattern.lastIndex = 0;

    while ((match = this.linkPattern.exec(content)) !== null) {
      const link = new Link({
        originalText: match[0],
        text: match[1]?.trim(),
        target: match[2]?.trim() || null,
        attributesString: match[3]?.trim() || null,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });

      // Parse attributes if provided
      if (link.attributesString) {
        link.attributes = this.parseAttributes(link.attributesString);
      }

      links.push(link);
    }

    return links;
  }

  /**
   * Parse link attributes from attribute string
   * @param {string} attributeString - String containing attributes
   * @returns {Object} Parsed attributes object
   */
  parseAttributes(attributeString) {
    const attributes = {};

    if (!attributeString) {
      return attributes;
    }

    // Pattern to match name='value' or name="value"
    const attrPattern = /([a-zA-Z][a-zA-Z0-9_-]*)=['"]([^'"]*)['"]/g;
    let match;

    while ((match = attrPattern.exec(attributeString)) !== null) {
      const attrName = match[1].toLowerCase();
      const attrValue = match[2];

      // Security: only allow whitelisted attributes
      if (this.options.allowedAttributes.includes(attrName)) {
        // Additional security checks for specific attributes
        if (attrName === 'target') {
          // Only allow safe target values
          if (['_blank', '_self', '_parent', '_top'].includes(attrValue)) {
            attributes[attrName] = attrValue;
          }
        } else if (attrName === 'style') {
          // Basic style validation (could be enhanced)
          if (this.options.security.sanitizeAttributes) {
            attributes[attrName] = this.sanitizeStyleAttribute(attrValue);
          } else {
            attributes[attrName] = attrValue;
          }
        } else {
          // Sanitize the value to prevent XSS
          attributes[attrName] = this.options.security.preventXSS
            ? this.sanitizeAttributeValue(attrValue)
            : attrValue;
        }
      } else {
        console.warn(`LinkParser: Ignoring disallowed attribute: ${attrName}`);
      }
    }

    return attributes;
  }

  /**
   * Generate HTML for a link
   * @param {Link} link - Link object to process
   * @param {Object} context - Parsing context
   * @returns {string} HTML link
   */
  generateLinkHtml(link, context) {
    // Determine link type and generate appropriate HTML
    const linkType = this.determineLinkType(link);

    switch (linkType) {
      case 'internal':
        return this.generateInternalLink(link, context);
      case 'external':
        return this.generateExternalLink(link, context);
      case 'interwiki':
        return this.generateInterWikiLink(link, context);
      case 'email':
        return this.generateEmailLink(link, context);
      case 'anchor':
        return this.generateAnchorLink(link, context);
      default:
        return this.generateInternalLink(link, context); // Default to internal
    }
  }

  /**
   * Determine the type of link
   * @param {Link} link - Link object
   * @returns {string} Link type ('internal', 'external', 'interwiki', 'email', 'anchor')
   */
  determineLinkType(link) {
    const target = link.target || link.text;

    if (!target) {
      return 'internal';
    }

    // Check for external URLs
    if (this.options.urlPatterns.external.test(target)) {
      return 'external';
    }

    // Check for email links
    if (this.options.urlPatterns.email.test(target)) {
      return 'email';
    }

    // Check for anchor links
    if (this.options.urlPatterns.anchor.test(target)) {
      return 'anchor';
    }

    // Check for absolute paths
    if (this.options.urlPatterns.absolute.test(target)) {
      return 'external';
    }

    // Check for InterWiki links
    if (this.options.interWikiPattern.test(target)) {
      return 'interwiki';
    }

    // Default to internal wiki link
    return 'internal';
  }

  /**
   * Generate HTML for internal wiki links
   * @param {Link} link - Link object
   * @param {Object} context - Parsing context
   * @returns {string} HTML link
   */
  generateInternalLink(link, context) {
    const pageName = link.target || link.text;
    const displayText = link.text;

    // Try fuzzy matching if PageNameMatcher is available
    let matchedPage = null;
    if (this.pageNameMatcher) {
      const allPages = Array.from(this.pageNames);
      matchedPage = this.pageNameMatcher.findMatch(pageName, allPages);
    } else {
      // Fallback to exact match
      matchedPage = this.pageNames.has(pageName) ? pageName : null;
    }

    const exists = matchedPage !== null;
    const targetPage = matchedPage || pageName;

    const href = exists
      ? `/wiki/${encodeURIComponent(targetPage)}`
      : `/edit/${encodeURIComponent(pageName)}`;

    const baseClass = exists
      ? this.options.defaultClasses.internal
      : this.options.defaultClasses.redlink;

    const attributes = this.buildAttributeString(link.attributes, {
      class: baseClass,
      ...(exists ? {} : { style: 'color: red;', title: `Create page: ${pageName}` })
    });

    return `<a href="${href}"${attributes}>${this.escapeHtml(displayText)}</a>`;
  }

  /**
   * Generate HTML for external links
   * @param {Link} link - Link object
   * @param {Object} context - Parsing context
   * @returns {string} HTML link
   */
  generateExternalLink(link, context) {
    const url = link.target || link.text;
    const displayText = link.text;

    // Validate URL if security is enabled
    if (this.options.security.validateUrls && !this.isUrlSafe(url)) {
      throw new Error(`Unsafe URL: ${url}`);
    }

    const attributes = this.buildAttributeString(link.attributes, {
      class: this.options.defaultClasses.external,
      target: '_blank',
      rel: 'noopener noreferrer'
    });

    return `<a href="${this.escapeHtml(url)}"${attributes}>${this.escapeHtml(displayText)}</a>`;
  }

  /**
   * Generate HTML for InterWiki links
   * @param {Link} link - Link object
   * @param {Object} context - Parsing context
   * @returns {string} HTML link
   */
  generateInterWikiLink(link, context) {
    const target = link.target || link.text;
    const displayText = link.text;

    const match = target.match(this.options.interWikiPattern);
    if (!match) {
      throw new Error(`Invalid InterWiki format: ${target}`);
    }

    const [, wikiName, pageName] = match;
    const siteConfig = this.interWikiSites.get(wikiName) ||
                       this.interWikiSites.get(wikiName.toLowerCase());

    if (!siteConfig) {
      throw new Error(`Unknown InterWiki site: ${wikiName}`);
    }

    const url = siteConfig.url.replace('%s', encodeURIComponent(pageName));

    const attributes = this.buildAttributeString(link.attributes, {
      class: `${this.options.defaultClasses.interwiki} interwiki-${wikiName.toLowerCase()}`,
      target: siteConfig.openInNewWindow !== false ? '_blank' : undefined,
      rel: siteConfig.openInNewWindow !== false ? 'noopener noreferrer' : undefined,
      title: siteConfig.description ? `${siteConfig.description}: ${displayText}` : undefined
    });

    return `<a href="${this.escapeHtml(url)}"${attributes}>${this.escapeHtml(displayText)}</a>`;
  }

  /**
   * Generate HTML for email links
   * @param {Link} link - Link object
   * @param {Object} context - Parsing context
   * @returns {string} HTML link
   */
  generateEmailLink(link, context) {
    const email = link.target || link.text;
    const displayText = link.text;

    const attributes = this.buildAttributeString(link.attributes, {
      class: 'email-link'
    });

    return `<a href="${this.escapeHtml(email)}"${attributes}>${this.escapeHtml(displayText)}</a>`;
  }

  /**
   * Generate HTML for anchor links
   * @param {Link} link - Link object
   * @param {Object} context - Parsing context
   * @returns {string} HTML link
   */
  generateAnchorLink(link, context) {
    const anchor = link.target || link.text;
    const displayText = link.text;

    const attributes = this.buildAttributeString(link.attributes, {
      class: 'anchor-link'
    });

    return `<a href="${this.escapeHtml(anchor)}"${attributes}>${this.escapeHtml(displayText)}</a>`;
  }

  /**
   * Build HTML attribute string
   * @param {Object} customAttributes - Custom attributes from link
   * @param {Object} defaultAttributes - Default attributes
   * @returns {string} HTML attribute string
   */
  buildAttributeString(customAttributes = {}, defaultAttributes = {}) {
    const merged = { ...defaultAttributes, ...customAttributes };

    // Filter out undefined values
    const filtered = Object.entries(merged).filter(([key, value]) => value !== undefined);

    if (filtered.length === 0) {
      return '';
    }

    const attrString = filtered
      .map(([key, value]) => `${key}="${this.escapeHtml(value)}"`)
      .join(' ');

    return ` ${attrString}`;
  }

  /**
   * Validate URL safety
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is safe
   */
  isUrlSafe(url) {
    try {
      const urlObj = new URL(url);

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Prevent suspicious patterns
      if (urlObj.hostname.includes('..') || urlObj.hostname === 'localhost') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize style attribute value
   * @param {string} style - Style value
   * @returns {string} Sanitized style
   */
  sanitizeStyleAttribute(style) {
    // Remove potentially dangerous CSS
    return style
      .replace(/javascript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/url\s*\(/gi, '');
  }

  /**
   * Sanitize attribute value to prevent XSS
   * @param {string} value - Attribute value
   * @returns {string} Sanitized value
   */
  sanitizeAttributeValue(value) {
    return value
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Get parser statistics
   * @returns {Object} Parser statistics
   */
  getStats() {
    return {
      pageNamesCount: this.pageNames.size,
      interWikiSitesCount: this.interWikiSites.size,
      allowedAttributes: this.options.allowedAttributes.length,
      securityEnabled: this.options.security.validateUrls
    };
  }
}

/**
 * Link class representing a parsed link
 */
class Link {
  constructor(data = {}) {
    this.originalText = data.originalText || '';
    this.text = data.text || '';
    this.target = data.target || null;
    this.attributesString = data.attributesString || null;
    this.attributes = data.attributes || {};
    this.startIndex = data.startIndex || 0;
    this.endIndex = data.endIndex || 0;
  }

  /**
   * Check if this is a simple link (no target specified)
   * @returns {boolean} True if simple link
   */
  isSimple() {
    return !this.target;
  }

  /**
   * Get the effective target (target or text if no target)
   * @returns {string} Effective target
   */
  getEffectiveTarget() {
    return this.target || this.text;
  }

  /**
   * Check if link has attributes
   * @returns {boolean} True if has attributes
   */
  hasAttributes() {
    return Object.keys(this.attributes).length > 0;
  }

  /**
   * Get attribute value by name
   * @param {string} name - Attribute name
   * @returns {string|undefined} Attribute value
   */
  getAttribute(name) {
    return this.attributes[name.toLowerCase()];
  }

  /**
   * Set attribute value
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   */
  setAttribute(name, value) {
    if (typeof name === 'string' && value !== undefined) {
      this.attributes[name.toLowerCase()] = value;
    }
  }

  /**
   * Get link information as object
   * @returns {Object} Link information
   */
  toObject() {
    return {
      originalText: this.originalText,
      text: this.text,
      target: this.target,
      attributes: { ...this.attributes },
      isSimple: this.isSimple(),
      hasAttributes: this.hasAttributes()
    };
  }
}

module.exports = { LinkParser, Link };