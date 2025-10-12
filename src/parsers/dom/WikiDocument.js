const { parseHTML } = require('linkedom');

/**
 * WikiDocument - Internal DOM representation of a wiki page
 *
 * Similar to JSPWiki's WikiDocument (org.apache.wiki.parser.WikiDocument)
 * which extends JDOM2 Document. This provides a DOM-based alternative to
 * string-based parsing, eliminating order-dependency issues.
 *
 * Key Features:
 * - DOM-based structure (using linkedom for performance)
 * - Cacheable representation
 * - Metadata storage
 * - WeakRef context for garbage collection
 * - Standard W3C DOM API
 *
 * JSPWiki Reference:
 * https://jspwiki.apache.org/apidocs/2.12.1/org/apache/wiki/parser/WikiDocument.html
 *
 * Related: GitHub Issue #93 - Migrate to WikiDocument DOM-Based Parsing
 */
class WikiDocument {
  /**
   * Creates a new WikiDocument
   *
   * @param {string} pageData - Original wiki markup content
   * @param {Object} context - Rendering context (stored as WeakRef)
   */
  constructor(pageData, context) {
    // Create a minimal HTML document using linkedom
    const { document } = parseHTML('<!DOCTYPE html><html><body></body></html>');

    /**
     * @private
     * Underlying linkedom document
     */
    this.document = document;

    /**
     * @private
     * Root element for wiki content (body)
     */
    this.root = document.body;

    /**
     * @private
     * Original wiki markup
     */
    this.pageData = pageData;

    /**
     * @private
     * Weak reference to rendering context (for garbage collection)
     * Similar to JSPWiki's WeakReference<Context>
     */
    this.contextRef = context ? new WeakRef(context) : null;

    /**
     * @private
     * Metadata storage (custom attributes, processing flags, etc.)
     */
    this.metadata = {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Gets the root element of the document
   *
   * @returns {Element} Root element (body)
   */
  getRootElement() {
    return this.root;
  }

  /**
   * Gets the original wiki markup
   *
   * JSPWiki equivalent: getPageData()
   *
   * @returns {string} Original page data
   */
  getPageData() {
    return this.pageData;
  }

  /**
   * Sets the original wiki markup
   *
   * JSPWiki equivalent: setPageData(String data)
   *
   * @param {string} data - Wiki markup
   */
  setPageData(data) {
    this.pageData = data;
  }

  /**
   * Gets the rendering context (if still alive)
   *
   * JSPWiki equivalent: getContext()
   *
   * @returns {Object|null} Context object or null if garbage collected
   */
  getContext() {
    return this.contextRef ? this.contextRef.deref() : null;
  }

  /**
   * Sets the rendering context
   *
   * JSPWiki equivalent: setContext(Context ctx)
   *
   * @param {Object} context - Rendering context
   */
  setContext(context) {
    this.contextRef = context ? new WeakRef(context) : null;
  }

  /**
   * Gets all metadata
   *
   * @returns {Object} Metadata object
   */
  getMetadata() {
    return { ...this.metadata };
  }

  /**
   * Sets a metadata value
   *
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   */
  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Gets a metadata value
   *
   * @param {string} key - Metadata key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Metadata value or default
   */
  getMetadataValue(key, defaultValue = null) {
    return this.metadata[key] !== undefined ? this.metadata[key] : defaultValue;
  }

  // ========================================
  // DOM Creation Methods
  // ========================================

  /**
   * Creates a new element
   *
   * @param {string} tag - Element tag name
   * @param {Object} attributes - Element attributes
   * @returns {Element} New element
   */
  createElement(tag, attributes = {}) {
    const element = this.document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  /**
   * Creates a text node
   *
   * @param {string} text - Text content
   * @returns {Text} New text node
   */
  createTextNode(text) {
    return this.document.createTextNode(text);
  }

  /**
   * Creates a comment node
   *
   * @param {string} text - Comment text
   * @returns {Comment} New comment node
   */
  createCommentNode(text) {
    return this.document.createComment(text);
  }

  // ========================================
  // DOM Manipulation Methods
  // ========================================

  /**
   * Appends a child to the root element
   *
   * @param {Node} node - Node to append
   * @returns {Node} Appended node
   */
  appendChild(node) {
    return this.root.appendChild(node);
  }

  /**
   * Inserts a node before a reference node in root
   *
   * @param {Node} newNode - Node to insert
   * @param {Node} referenceNode - Reference node
   * @returns {Node} Inserted node
   */
  insertBefore(newNode, referenceNode) {
    return this.root.insertBefore(newNode, referenceNode);
  }

  /**
   * Removes a child from the root element
   *
   * @param {Node} node - Node to remove
   * @returns {Node} Removed node
   */
  removeChild(node) {
    return this.root.removeChild(node);
  }

  /**
   * Replaces a child in the root element
   *
   * @param {Node} newNode - New node
   * @param {Node} oldNode - Old node to replace
   * @returns {Node} Replaced node
   */
  replaceChild(newNode, oldNode) {
    return this.root.replaceChild(newNode, oldNode);
  }

  // ========================================
  // DOM Query Methods
  // ========================================

  /**
   * Queries for a single element
   *
   * @param {string} selector - CSS selector
   * @returns {Element|null} First matching element or null
   */
  querySelector(selector) {
    return this.root.querySelector(selector);
  }

  /**
   * Queries for all matching elements
   *
   * @param {string} selector - CSS selector
   * @returns {NodeList} Matching elements
   */
  querySelectorAll(selector) {
    return this.root.querySelectorAll(selector);
  }

  /**
   * Gets element by ID
   *
   * @param {string} id - Element ID
   * @returns {Element|null} Element or null
   */
  getElementById(id) {
    return this.document.getElementById(id);
  }

  /**
   * Gets elements by class name
   *
   * @param {string} className - Class name
   * @returns {HTMLCollection} Elements with class
   */
  getElementsByClassName(className) {
    return this.root.getElementsByClassName(className);
  }

  /**
   * Gets elements by tag name
   *
   * @param {string} tagName - Tag name
   * @returns {HTMLCollection} Elements with tag
   */
  getElementsByTagName(tagName) {
    return this.root.getElementsByTagName(tagName);
  }

  // ========================================
  // Serialization Methods
  // ========================================

  /**
   * Serializes the document to HTML string
   *
   * JSPWiki equivalent: XHTMLRenderer.render()
   *
   * @returns {string} HTML string
   */
  toHTML() {
    return this.root.innerHTML;
  }

  /**
   * Serializes to string (for debugging)
   *
   * @returns {string} String representation
   */
  toString() {
    return `WikiDocument[${this.root.childNodes.length} nodes, ${this.pageData ? this.pageData.length : 0} chars]`;
  }

  /**
   * Serializes to JSON (for caching)
   *
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      pageData: this.pageData,
      html: this.toHTML(),
      metadata: { ...this.metadata },
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Deserializes from JSON (for cache restore)
   *
   * @param {Object} json - JSON data
   * @param {Object} context - Rendering context
   * @returns {WikiDocument} Restored WikiDocument
   */
  static fromJSON(json, context = null) {
    const doc = new WikiDocument(json.pageData, context);

    // Restore HTML content
    if (json.html) {
      doc.root.innerHTML = json.html;
    }

    // Restore metadata
    if (json.metadata) {
      doc.metadata = { ...json.metadata };
    }

    return doc;
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Clears all content from the document
   */
  clear() {
    this.root.innerHTML = '';
  }

  /**
   * Gets the number of child nodes in root
   *
   * @returns {number} Number of children
   */
  getChildCount() {
    return this.root.childNodes.length;
  }

  /**
   * Checks if the document is empty
   *
   * @returns {boolean} True if empty
   */
  isEmpty() {
    return this.root.childNodes.length === 0;
  }

  /**
   * Gets document statistics
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      nodeCount: this.root.childNodes.length,
      pageDataLength: this.pageData ? this.pageData.length : 0,
      htmlLength: this.toHTML().length,
      hasContext: this.getContext() !== null,
      metadata: Object.keys(this.metadata).length
    };
  }
}

module.exports = WikiDocument;
