/**
 * DOMPluginHandler - DOM-based plugin execution handler
 *
 * Replaces string-based regex plugin processing with DOM queries.
 * Processes wiki plugins by querying WikiDocument for .wiki-plugin elements
 * and executing them through PluginManager.
 *
 * Part of Phase 4 of WikiDocument DOM Migration (GitHub Issue #107)
 *
 * Usage:
 *   In wiki markup: [{PluginName param=value}]
 *   These are tokenized as PLUGIN tokens and become .wiki-plugin elements
 *   This handler executes them and replaces with rendered output
 */

import type WikiDocument from '../WikiDocument';
import type { LinkedomElement, LinkedomNode } from '../WikiDocument';

/**
 * Plugin execution context
 */
export interface PluginContext {
  /** Page name */
  pageName: string;
  /** User name */
  userName: string;
  /** User context information */
  userContext?: {
    username?: string;
    email?: string;
    fullName?: string;
    roles?: string[];
    [key: string]: unknown;
  };
  /** Request information */
  requestInfo?: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
    [key: string]: unknown;
  };
  /** WikiEngine reference */
  engine: unknown;
  /** WikiContext reference */
  wikiContext?: unknown;
  /** Plugin parameters */
  parameters: Record<string, string>;
  /** Plugin body content (for body plugins) */
  bodyContent: string | null;
  /** Plugin name */
  pluginName: string;
  /** WikiDocument reference */
  wikiDocument?: WikiDocument;
  /** Plugin DOM element */
  pluginElement?: Element | null;
  /** Link graph for plugins like ReferringPagesPlugin */
  linkGraph?: Record<string, unknown>;
  /** Page context (nested structure) */
  pageContext?: {
    pageName?: string;
    [key: string]: unknown;
  };
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Parsed plugin information
 */
export interface PluginInfo {
  /** Plugin name */
  pluginName: string;
  /** Plugin parameters */
  parameters: Record<string, string>;
}

/**
 * Plugin manager interface
 */
interface PluginManager {
  /** Execute a plugin */
  execute(pluginName: string, pageName: string, parameters: Record<string, string>, context: PluginContext): Promise<string | null>;
  /** Additional manager methods */
  [key: string]: unknown;
}

/**
 * Rendering manager interface
 */
interface RenderingManager {
  /** Link graph */
  linkGraph?: Record<string, unknown>;
  /** Additional manager methods */
  [key: string]: unknown;
}

/**
 * WikiEngine interface (minimal)
 */
interface WikiEngine {
  /** Get a manager by name */
  getManager(name: string): unknown;
  /** Additional engine properties */
  [key: string]: unknown;
}

/**
 * Extracted element from JSPWiki syntax extraction
 */
export interface ExtractedPluginElement {
  /** Element type */
  type: string;
  /** Plugin inner content (e.g., "TableOfContents" or "Search query='wiki'") */
  inner: string;
  /** Unique ID for tracking */
  id: number;
  /** Original text */
  originalText?: string;
  /** Start index in content */
  startIndex?: number;
  /** End index in content */
  endIndex?: number;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Information about a single plugin
 */
export interface PluginInstanceInfo {
  /** Plugin name */
  name: string;
  /** Plugin parameters */
  parameters: Record<string, string>;
}

/**
 * Statistics about plugin processing
 */
export interface PluginStatistics {
  /** Total number of plugins in document */
  totalPlugins: number;
  /** Number of unique plugins */
  uniqueCount: number;
  /** Array of unique plugin names */
  uniquePlugins: string[];
  /** Array of plugin instances */
  plugins: PluginInstanceInfo[];
}

/**
 * DOMPluginHandler class
 */
class DOMPluginHandler {
  /** WikiEngine instance */
  private engine: WikiEngine;

  /** PluginManager instance (loaded dynamically) */
  private pluginManager: PluginManager | null;

  /**
   * Creates a new DOMPluginHandler
   *
   * @param {WikiEngine} engine - WikiEngine instance
   */
  constructor(engine: WikiEngine) {
    this.engine = engine;
    this.pluginManager = null;
  }

  /**
   * Initializes the handler
   */
   
  async initialize(): Promise<void> {
    // PluginManager may not be available yet during initialization
    // We'll get it dynamically during processing
  }

  /**
   * Processes plugins in a WikiDocument
   *
   * Queries for .wiki-plugin elements and executes them.
   * This is the DOM-based equivalent of PluginSyntaxHandler.process()
   *
   * @param {WikiDocument} wikiDocument - The WikiDocument to process
   * @param {PluginContext} context - Rendering context
   * @returns {Promise<WikiDocument>} Updated WikiDocument
   */
  async processPlugins(wikiDocument: WikiDocument, context: PluginContext): Promise<WikiDocument> {
    // Get PluginManager dynamically (it might not be available during initialization)
    if (!this.pluginManager) {
      this.pluginManager = this.engine.getManager('PluginManager') as PluginManager | null;
    }

    if (!this.pluginManager) {
      // eslint-disable-next-line no-console
      console.warn('⚠️  DOMPluginHandler: Cannot process plugins without PluginManager');
      return wikiDocument;
    }

    // Query for all plugin elements
     
    const pluginElements = wikiDocument.querySelectorAll('.wiki-plugin');

    if (pluginElements.length === 0) {
      return wikiDocument;
    }

    // eslint-disable-next-line no-console
    console.log(`🔍 DOMPluginHandler: Processing ${pluginElements.length} plugins`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each plugin element

    for (let i = 0; i < pluginElements.length; i++) {
      const pluginElement = pluginElements[i] as LinkedomElement;
      try {
        // Get plugin info from data attributes
         
        const pluginContent = pluginElement.getAttribute('data-plugin-content');

        if (!pluginContent) {
          // eslint-disable-next-line no-console
          console.warn('⚠️  Plugin element missing data-plugin-content attribute');
          continue;
        }

        // Parse plugin name and parameters
         
        const pluginInfo = this.parsePluginContent(pluginContent);

        if (!pluginInfo) {
          // eslint-disable-next-line no-console
          console.warn(`⚠️  Failed to parse plugin content: ${pluginContent}`);
          continue;
        }

        // Execute plugin
        const result = await this.executePlugin(
          pluginInfo.pluginName,
          pluginInfo.parameters,
          context,
           
          pluginElement
        );

        // Check if plugin returned meaningful output
        const hasOutput = result && typeof result === 'string' && result.trim() !== '';

        if (hasOutput) {
          // Create a temporary container to parse the HTML result
          const resultContainer = wikiDocument.createElement('div');
           
          resultContainer.innerHTML = result;

          // Replace plugin element with result
          // If result has single root, use that; otherwise keep container
           
          if (resultContainer.childNodes.length === 1) {
             
            pluginElement.replaceWith(resultContainer.firstChild);
          } else {
             
            pluginElement.replaceWith(resultContainer);
          }

          processedCount++;
        } else {
          // Plugin returned nothing - remove element
           
          pluginElement.remove();
          // eslint-disable-next-line no-console
          console.warn(`⚠️  Plugin ${pluginInfo.pluginName} returned no output`);
        }

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        // eslint-disable-next-line no-console
        console.error('❌ Error processing plugin:', errorMessage);

        // Replace with error message
        const errorDiv = wikiDocument.createElement('div');
        errorDiv.className = 'wiki-plugin-error';
        errorDiv.textContent = `Plugin Error: ${errorMessage}`;
         
        pluginElement.replaceWith(errorDiv);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`✅ DOMPluginHandler: Processed ${processedCount} plugins, ${errorCount} errors`);

    return wikiDocument;
  }

  /**
   * Parses plugin content string into name and parameters
   *
   * @param {string} pluginContent - Plugin content (e.g., "TableOfContents max=3")
   * @returns {PluginInfo | null} { pluginName, parameters } or null if invalid
   */
  parsePluginContent(pluginContent: string): PluginInfo | null {
    if (!pluginContent || typeof pluginContent !== 'string') {
      return null;
    }

    // Split on whitespace to separate plugin name from parameters
    const parts = pluginContent.trim().split(/\s+/);

    if (parts.length === 0) {
      return null;
    }

    const pluginName = parts[0];
    const paramString = parts.slice(1).join(' ');

    // Parse parameters (key=value pairs)
    const parameters = this.parseParameters(paramString);

    return {
      pluginName,
      parameters
    };
  }

  /**
   * Parses parameter string into object
   *
   * @param {string} paramString - Parameter string (e.g., "max=3 show=true")
   * @returns {Record<string, string>} Parsed parameters
   */
  parseParameters(paramString: string): Record<string, string> {
    const params: Record<string, string> = {};

    if (!paramString || paramString.trim() === '') {
      return params;
    }

    // Match key=value pairs
    // Supports: key=value, key='value with spaces', key="value with spaces"
    // Also supports optional spaces around the equals sign: key = value, key ='value'
    // Pattern explanation:
    // - ([\w-]+) = capture key name (word chars + dashes for 'system-category')
    // - \s* = optional whitespace before equals
    // - = = equals sign
    // - \s* = optional whitespace after equals
    // - (?:...) = non-capturing group with two alternatives:
    //   - (['"])([^\2]*?)\2 = quoted value (capture quote, content, match same quote)
    //   - ([^\s]+) = unquoted value (no spaces)
    const paramRegex = /([\w-]+)\s*=\s*(?:(['"])(.+?)\2|([^\s]+))/g;
    let match: RegExpExecArray | null;

    while ((match = paramRegex.exec(paramString)) !== null) {
      const key = match[1];
      // Value is either in match[3] (quoted) or match[4] (unquoted)
      const value = match[3] !== undefined ? match[3] : match[4];
      params[key] = value;
    }

    return params;
  }

  /**
   * Executes a plugin through PluginManager
   *
   * @param {string} pluginName - Name of the plugin
   * @param {Record<string, string>} parameters - Plugin parameters
   * @param {PluginContext} context - Rendering context
   * @param {unknown} pluginElement - The plugin DOM element
   * @returns {Promise<string | null>} Plugin output HTML or null
   */
  async executePlugin(pluginName: string, parameters: Record<string, string>, context: PluginContext, pluginElement: unknown): Promise<string | null> {
    if (!this.pluginManager) {
      throw new Error('PluginManager not available');
    }

    try {
      // Get linkGraph from RenderingManager for ReferringPagesPlugin
      const renderingManager = this.engine.getManager('RenderingManager') as RenderingManager | null;
      const linkGraph = renderingManager ? renderingManager.linkGraph : {};

      // Build plugin context
      const pluginContext: PluginContext = {
        // Standard context
        pageName: context.pageName || context?.pageContext?.pageName || 'unknown',
        userName: context.userName || 'anonymous',
        userContext: context.userContext,
        requestInfo: context.requestInfo,
        engine: this.engine,

        // Enhanced context
        wikiContext: context,
        parameters: parameters,
        bodyContent: null, // TODO: Support body plugins in Phase 4.1
        pluginName: pluginName,

        // DOM context
        wikiDocument: context.wikiDocument,
        pluginElement: pluginElement as Element | null,

        // Link graph for ReferringPagesPlugin
        linkGraph: linkGraph
      };

      // Execute plugin
      const result = await this.pluginManager.execute(
        pluginName,
        pluginContext.pageName,
        parameters,
        pluginContext
      );

      return result;

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`❌ Error executing plugin '${pluginName}':`, error);
      throw error;
    }
  }

  /**
   * Creates a DOM node from an extracted plugin element
   *
   * This method is part of the Phase 2 extraction-based parsing (Issue #114).
   * It creates a plugin node from a pre-extracted element and executes the plugin.
   *
   * @param {ExtractedPluginElement} element - Extracted element from extractJSPWikiSyntax()
   * @param {PluginContext} context - Rendering context
   * @param {WikiDocument} wikiDocument - WikiDocument to create node in
   * @returns {Promise<Element>} DOM node for the plugin
   *
   * @example
   * const element = { type: 'plugin', inner: 'TableOfContents', id: 1, ... };
   * const node = await handler.createNodeFromExtract(element, context, wikiDoc);
   * // Returns: <span class="wiki-plugin" data-plugin="TableOfContents">...plugin output...</span>
   */
  async createNodeFromExtract(element: ExtractedPluginElement, context: PluginContext, wikiDocument: WikiDocument): Promise<LinkedomElement> {
    // Get PluginManager dynamically
    if (!this.pluginManager) {
      this.pluginManager = this.engine.getManager('PluginManager') as PluginManager | null;
    }

    // Parse plugin name and parameters from the inner content
    // element.inner = "TableOfContents" or "Search query='wiki' max='10'"
    const pluginInfo = this.parsePluginContent(element.inner);

    if (!pluginInfo) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Failed to parse plugin: ${element.inner}`);
      // Return error node
      const errorNode = wikiDocument.createElement('span', {
        'class': 'wiki-plugin-error',
        'data-jspwiki-id': element.id.toString()
      });
      errorNode.textContent = '[Error: Invalid plugin syntax]';
      return errorNode;
    }

    // Execute plugin
    let result: string | null;
    try {
      result = await this.executePlugin(
        pluginInfo.pluginName,
        pluginInfo.parameters,
        context,
        null // pluginElement not needed here
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.error(`❌ Error executing plugin '${pluginInfo.pluginName}':`, errorMessage);
      // Return error node
      const errorNode = wikiDocument.createElement('span', {
        'class': 'wiki-plugin-error',
        'data-plugin': pluginInfo.pluginName,
        'data-jspwiki-id': element.id.toString()
      });
      errorNode.textContent = `[Error: ${pluginInfo.pluginName}]`;
      return errorNode;
    }

    // Parse the result to check if we can unwrap it
    if (result && typeof result === 'string' && result.trim() !== '') {
      // Create temporary container to parse HTML result
      const tempContainer = wikiDocument.createElement('div');
       
      tempContainer.innerHTML = result.trim(); // Trim to avoid whitespace text nodes

      // Count significant (non-whitespace) child nodes

      const significantChildren = Array.from(tempContainer.childNodes).filter((node: LinkedomNode) => {
        // Keep element nodes, skip empty text nodes
        return node.nodeType === 1 || (node.nodeType === 3 && node.textContent && node.textContent.trim() !== '');
      });

      // If result has single significant child, return it directly (unwrapped)
      // This avoids double-wrapping for both inline and block content
      if (significantChildren.length === 1 && significantChildren[0].nodeType === 1) {
        const unwrappedNode = significantChildren[0] as LinkedomElement;
        // Preserve tracking attributes for serialization
        unwrappedNode.setAttribute('data-jspwiki-id', element.id.toString());
        unwrappedNode.setAttribute('data-plugin', pluginInfo.pluginName);
        return unwrappedNode;
      }

      // Multiple root elements - determine wrapper type based on content
      // Use div for block content, span for inline/mixed content
      const hasBlockElements = significantChildren.some((node: LinkedomNode) => {
        if (node.nodeType !== 1) return false;
        const element = node as LinkedomElement;
        const tagName = element.tagName.toLowerCase();
        return ['div', 'p', 'table', 'ul', 'ol', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
      });

      const wrapperTag = hasBlockElements ? 'div' : 'span';
      const node = wikiDocument.createElement(wrapperTag, {
        'class': 'wiki-plugin',
        'data-plugin': pluginInfo.pluginName,
        'data-jspwiki-id': element.id.toString()
      });
       
      node.innerHTML = result.trim();
      return node;
    } else {
      // Empty result - return empty span
      const node = wikiDocument.createElement('span', {
        'class': 'wiki-plugin',
        'data-plugin': pluginInfo.pluginName,
        'data-jspwiki-id': element.id.toString()
      });
      node.textContent = '';
      return node;
    }
  }

  /**
   * Gets statistics about plugin processing
   *
   * @param {WikiDocument} wikiDocument - Document to analyze
   * @returns {PluginStatistics} Statistics
   */
  getStatistics(wikiDocument: WikiDocument): PluginStatistics {
     
    const pluginElements = wikiDocument.querySelectorAll('.wiki-plugin');

    const uniquePluginsSet = new Set<string>();
    const plugins: PluginInstanceInfo[] = [];


    for (let i = 0; i < pluginElements.length; i++) {
      const pluginElement = pluginElements[i] as LinkedomElement;
      const pluginContent = pluginElement.getAttribute('data-plugin-content');
      if (pluginContent) {
        const pluginInfo = this.parsePluginContent(pluginContent);
        if (pluginInfo) {
          uniquePluginsSet.add(pluginInfo.pluginName);
          plugins.push({
            name: pluginInfo.pluginName,
            parameters: pluginInfo.parameters
          });
        }
      }
    }

    const stats: PluginStatistics = {
      totalPlugins: pluginElements.length,
      uniqueCount: uniquePluginsSet.size,
      uniquePlugins: Array.from(uniquePluginsSet),
      plugins: plugins
    };

    return stats;
  }
}

export default DOMPluginHandler;
