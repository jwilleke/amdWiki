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

// linkedom has no @types package, so we use require and define minimal types
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const { parseHTML } = require('linkedom');

/**
 * Minimal linkedom types (no @types available)
 */
interface LinkedomDocument {
  body: LinkedomElement;
  createElement(tag: string): LinkedomElement;
  createTextNode(text: string): LinkedomText;
  createComment(text: string): LinkedomComment;
  getElementById(id: string): LinkedomElement | null;
}

interface LinkedomElement {
  innerHTML: string;
  childNodes: LinkedomNodeList;
  setAttribute(name: string, value: string): void;
  appendChild(node: LinkedomNode): LinkedomNode;
  insertBefore(newNode: LinkedomNode, referenceNode: LinkedomNode | null): LinkedomNode;
  removeChild(node: LinkedomNode): LinkedomNode;
  replaceChild(newNode: LinkedomNode, oldNode: LinkedomNode): LinkedomNode;
  querySelector(selector: string): LinkedomElement | null;
  querySelectorAll(selector: string): LinkedomNodeList;
  getElementsByClassName(className: string): LinkedomHTMLCollection;
  getElementsByTagName(tagName: string): LinkedomHTMLCollection;
}

interface LinkedomText {
  textContent: string;
}

interface LinkedomComment {
  textContent: string;
}

type LinkedomNode = LinkedomElement | LinkedomText | LinkedomComment;

interface LinkedomNodeList extends ArrayLike<LinkedomNode> {
  length: number;
}

interface LinkedomHTMLCollection extends ArrayLike<LinkedomElement> {
  length: number;
}

interface ParseHTMLResult {
  document: LinkedomDocument;
}

/**
 * WikiDocument metadata
 */
export interface WikiDocumentMetadata {
  createdAt: string;
  version: string;
  [key: string]: unknown;
}

/**
 * JSON serialization format
 */
export interface WikiDocumentJSON {
  pageData: string;
  html: string;
  metadata: WikiDocumentMetadata;
  version: string;
  timestamp: string;
}

/**
 * Document statistics
 */
export interface WikiDocumentStatistics {
  nodeCount: number;
  pageDataLength: number;
  htmlLength: number;
  hasContext: boolean;
  metadata: number;
}

/**
 * Rendering context (minimal interface)
 * TODO: Replace with proper WikiContext import once converted
 */
export interface WikiContext {
  pageName?: string;
  userName?: string;
  [key: string]: unknown;
}

/**
 * WikiDocument - DOM-based representation of a wiki page
 */
class WikiDocument {
  private document: LinkedomDocument;
  private root: LinkedomElement;
  private pageData: string;
  private contextRef: WeakRef<WikiContext> | null;
  private metadata: WikiDocumentMetadata;

  /**
   * Creates a new WikiDocument
   *
   * @param pageData - Original wiki markup content
   * @param context - Rendering context (stored as WeakRef)
   */
  constructor(pageData: string, context?: WikiContext) {
    // Create a minimal HTML document using linkedom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { document }: ParseHTMLResult = parseHTML('<!DOCTYPE html><html><body></body></html>');

    this.document = document;
    this.root = document.body;
    this.pageData = pageData;
    this.contextRef = context ? new WeakRef(context) : null;
    this.metadata = {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Gets the root element of the document
   *
   * @returns Root element (body)
   */
  getRootElement(): LinkedomElement {
    return this.root;
  }

  /**
   * Gets the original wiki markup
   *
   * JSPWiki equivalent: getPageData()
   *
   * @returns Original page data
   */
  getPageData(): string {
    return this.pageData;
  }

  /**
   * Sets the original wiki markup
   *
   * JSPWiki equivalent: setPageData(String data)
   *
   * @param data - Wiki markup
   */
  setPageData(data: string): void {
    this.pageData = data;
  }

  /**
   * Gets the rendering context (if still alive)
   *
   * JSPWiki equivalent: getContext()
   *
   * @returns Context object or null if garbage collected
   */
  getContext(): WikiContext | null {
    return this.contextRef ? (this.contextRef.deref() ?? null) : null;
  }

  /**
   * Sets the rendering context
   *
   * JSPWiki equivalent: setContext(Context ctx)
   *
   * @param context - Rendering context
   */
  setContext(context: WikiContext | null): void {
    this.contextRef = context ? new WeakRef(context) : null;
  }

  /**
   * Gets all metadata
   *
   * @returns Metadata object
   */
  getMetadata(): WikiDocumentMetadata {
    return { ...this.metadata };
  }

  /**
   * Sets a metadata value
   *
   * @param key - Metadata key
   * @param value - Metadata value
   */
  setMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Gets a metadata value
   *
   * @param key - Metadata key
   * @param defaultValue - Default value if not found
   * @returns Metadata value or default
   */
  getMetadataValue(key: string, defaultValue: unknown = null): unknown {
    return this.metadata[key] !== undefined ? this.metadata[key] : defaultValue;
  }

  // ========================================
  // DOM Creation Methods
  // ========================================

  /**
   * Creates a new element
   *
   * @param tag - Element tag name
   * @param attributes - Element attributes
   * @returns New element
   */
  createElement(tag: string, attributes: Record<string, string> = {}): LinkedomElement {
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
   * @param text - Text content
   * @returns New text node
   */
  createTextNode(text: string): LinkedomText {
    return this.document.createTextNode(text);
  }

  /**
   * Creates a comment node
   *
   * @param text - Comment text
   * @returns New comment node
   */
  createCommentNode(text: string): LinkedomComment {
    return this.document.createComment(text);
  }

  // ========================================
  // DOM Manipulation Methods
  // ========================================

  /**
   * Appends a child to the root element
   *
   * @param node - Node to append
   * @returns Appended node
   */
  appendChild(node: LinkedomNode): LinkedomNode {
    return this.root.appendChild(node);
  }

  /**
   * Inserts a node before a reference node in root
   *
   * @param newNode - Node to insert
   * @param referenceNode - Reference node
   * @returns Inserted node
   */
  insertBefore(newNode: LinkedomNode, referenceNode: LinkedomNode | null): LinkedomNode {
    return this.root.insertBefore(newNode, referenceNode);
  }

  /**
   * Removes a child from the root element
   *
   * @param node - Node to remove
   * @returns Removed node
   */
  removeChild(node: LinkedomNode): LinkedomNode {
    return this.root.removeChild(node);
  }

  /**
   * Replaces a child in the root element
   *
   * @param newNode - New node
   * @param oldNode - Old node to replace
   * @returns Replaced node
   */
  replaceChild(newNode: LinkedomNode, oldNode: LinkedomNode): LinkedomNode {
    return this.root.replaceChild(newNode, oldNode);
  }

  // ========================================
  // DOM Query Methods
  // ========================================

  /**
   * Queries for a single element
   *
   * @param selector - CSS selector
   * @returns First matching element or null
   */
  querySelector(selector: string): LinkedomElement | null {
    return this.root.querySelector(selector);
  }

  /**
   * Queries for all matching elements
   *
   * @param selector - CSS selector
   * @returns Matching elements
   */
  querySelectorAll(selector: string): LinkedomNodeList {
    return this.root.querySelectorAll(selector);
  }

  /**
   * Gets element by ID
   *
   * @param id - Element ID
   * @returns Element or null
   */
  getElementById(id: string): LinkedomElement | null {
    return this.document.getElementById(id);
  }

  /**
   * Gets elements by class name
   *
   * @param className - Class name
   * @returns Elements with class
   */
  getElementsByClassName(className: string): LinkedomHTMLCollection {
    return this.root.getElementsByClassName(className);
  }

  /**
   * Gets elements by tag name
   *
   * @param tagName - Tag name
   * @returns Elements with tag
   */
  getElementsByTagName(tagName: string): LinkedomHTMLCollection {
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
   * @returns HTML string
   */
  toHTML(): string {
    return this.root.innerHTML;
  }

  /**
   * Serializes to string (for debugging)
   *
   * @returns String representation
   */
  toString(): string {
    return `WikiDocument[${this.root.childNodes.length} nodes, ${this.pageData ? this.pageData.length : 0} chars]`;
  }

  /**
   * Serializes to JSON (for caching)
   *
   * @returns JSON representation
   */
  toJSON(): WikiDocumentJSON {
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
   * @param json - JSON data
   * @param context - Rendering context
   * @returns Restored WikiDocument
   */
  static fromJSON(json: WikiDocumentJSON, context: WikiContext | null = null): WikiDocument {
    const doc = new WikiDocument(json.pageData, context ?? undefined);

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
  clear(): void {
    this.root.innerHTML = '';
  }

  /**
   * Gets the number of child nodes in root
   *
   * @returns Number of children
   */
  getChildCount(): number {
    return this.root.childNodes.length;
  }

  /**
   * Checks if the document is empty
   *
   * @returns True if empty
   */
  isEmpty(): boolean {
    return this.root.childNodes.length === 0;
  }

  /**
   * Gets document statistics
   *
   * @returns Statistics
   */
  getStatistics(): WikiDocumentStatistics {
    return {
      nodeCount: this.root.childNodes.length,
      pageDataLength: this.pageData ? this.pageData.length : 0,
      htmlLength: this.toHTML().length,
      hasContext: this.getContext() !== null,
      metadata: Object.keys(this.metadata).length
    };
  }
}

// Export for ES modules
export default WikiDocument;

// Export for CommonJS (Jest compatibility)
module.exports = WikiDocument;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports.default = WikiDocument;
