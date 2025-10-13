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
class DOMPluginHandler {
  /**
   * Creates a new DOMPluginHandler
   *
   * @param {Object} engine - WikiEngine instance
   */
  constructor(engine) {
    this.engine = engine;
    this.pluginManager = null;
  }

  /**
   * Initializes the handler
   */
  async initialize() {
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
   * @param {Object} context - Rendering context
   * @returns {Promise<WikiDocument>} Updated WikiDocument
   */
  async processPlugins(wikiDocument, context) {
    // Get PluginManager dynamically (it might not be available during initialization)
    if (!this.pluginManager) {
      this.pluginManager = this.engine.getManager('PluginManager');
    }

    if (!this.pluginManager) {
      console.warn('⚠️  DOMPluginHandler: Cannot process plugins without PluginManager');
      return wikiDocument;
    }

    // Query for all plugin elements
    const pluginElements = wikiDocument.querySelectorAll('.wiki-plugin');

    if (pluginElements.length === 0) {
      return wikiDocument;
    }

    console.log(`🔍 DOMPluginHandler: Processing ${pluginElements.length} plugins`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each plugin element
    for (const pluginElement of pluginElements) {
      try {
        // Get plugin info from data attributes
        const pluginContent = pluginElement.getAttribute('data-plugin-content');

        if (!pluginContent) {
          console.warn('⚠️  Plugin element missing data-plugin-content attribute');
          continue;
        }

        // Parse plugin name and parameters
        const pluginInfo = this.parsePluginContent(pluginContent);

        if (!pluginInfo) {
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
          console.warn(`⚠️  Plugin ${pluginInfo.pluginName} returned no output`);
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing plugin:`, error.message);

        // Replace with error message
        const errorDiv = wikiDocument.createElement('div');
        errorDiv.className = 'wiki-plugin-error';
        errorDiv.textContent = `Plugin Error: ${error.message}`;
        pluginElement.replaceWith(errorDiv);
      }
    }

    console.log(`✅ DOMPluginHandler: Processed ${processedCount} plugins, ${errorCount} errors`);

    return wikiDocument;
  }

  /**
   * Parses plugin content string into name and parameters
   *
   * @param {string} pluginContent - Plugin content (e.g., "TableOfContents max=3")
   * @returns {Object|null} { pluginName, parameters } or null if invalid
   */
  parsePluginContent(pluginContent) {
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
   * @returns {Object} Parsed parameters
   */
  parseParameters(paramString) {
    const params = {};

    if (!paramString || paramString.trim() === '') {
      return params;
    }

    // Match key=value pairs
    // Supports: key=value, key='value with spaces', key="value with spaces"
    // Pattern explanation:
    // - (\w+) = capture key name
    // - = = equals sign
    // - (?:...) = non-capturing group with two alternatives:
    //   - (['"])([^\2]*?)\2 = quoted value (capture quote, content, match same quote)
    //   - ([^\s]+) = unquoted value (no spaces)
    const paramRegex = /(\w+)=(?:(['"])(.+?)\2|([^\s]+))/g;
    let match;

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
   * @param {Object} parameters - Plugin parameters
   * @param {Object} context - Rendering context
   * @param {Element} pluginElement - The plugin DOM element
   * @returns {Promise<string|null>} Plugin output HTML or null
   */
  async executePlugin(pluginName, parameters, context, pluginElement) {
    if (!this.pluginManager) {
      throw new Error('PluginManager not available');
    }

    try {
      // Build plugin context
      const pluginContext = {
        // Standard context
        pageName: context.pageName || context?.pageContext?.name || 'unknown',
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
        pluginElement: pluginElement
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
   * @param {Object} element - Extracted element from extractJSPWikiSyntax()
   * @param {Object} context - Rendering context
   * @param {WikiDocument} wikiDocument - WikiDocument to create node in
   * @returns {Promise<Element>} DOM node for the plugin
   *
   * @example
   * const element = { type: 'plugin', inner: 'TableOfContents', id: 1, ... };
   * const node = await handler.createNodeFromExtract(element, context, wikiDoc);
   * // Returns: <div class="wiki-plugin" data-plugin="TableOfContents">...plugin output...</div>
   */
  async createNodeFromExtract(element, context, wikiDocument) {
    // Get PluginManager dynamically
    if (!this.pluginManager) {
      this.pluginManager = this.engine.getManager('PluginManager');
    }

    // Parse plugin name and parameters from the inner content
    // element.inner = "TableOfContents" or "Search query='wiki' max='10'"
    const pluginInfo = this.parsePluginContent(element.inner);

    if (!pluginInfo) {
      console.warn(`⚠️  Failed to parse plugin: ${element.inner}`);
      // Return error node
      const errorNode = wikiDocument.createElement('span', {
        'class': 'wiki-plugin-error',
        'data-jspwiki-id': element.id.toString()
      });
      errorNode.textContent = `[Error: Invalid plugin syntax]`;
      return errorNode;
    }

    // Execute plugin
    let result;
    try {
      result = await this.executePlugin(
        pluginInfo.pluginName,
        pluginInfo.parameters,
        context,
        null // pluginElement not needed here
      );
    } catch (error) {
      console.error(`❌ Error executing plugin '${pluginInfo.pluginName}':`, error.message);
      // Return error node
      const errorNode = wikiDocument.createElement('span', {
        'class': 'wiki-plugin-error',
        'data-plugin': pluginInfo.pluginName,
        'data-jspwiki-id': element.id.toString()
      });
      errorNode.textContent = `[Error: ${pluginInfo.pluginName}]`;
      return errorNode;
    }

    // Create DOM node for successful plugin execution
    const node = wikiDocument.createElement('div', {
      'class': 'wiki-plugin',
      'data-plugin': pluginInfo.pluginName,
      'data-jspwiki-id': element.id.toString()
    });

    // Set innerHTML with plugin result
    if (result && typeof result === 'string' && result.trim() !== '') {
      node.innerHTML = result;
    } else {
      // Empty result - plugin executed but returned nothing
      node.textContent = '';
    }

    return node;
  }

  /**
   * Gets statistics about plugin processing
   *
   * @param {WikiDocument} wikiDocument - Document to analyze
   * @returns {Object} Statistics
   */
  getStatistics(wikiDocument) {
    const pluginElements = wikiDocument.querySelectorAll('.wiki-plugin');

    const stats = {
      totalPlugins: pluginElements.length,
      uniquePlugins: new Set(),
      plugins: []
    };

    for (const pluginElement of pluginElements) {
      const pluginContent = pluginElement.getAttribute('data-plugin-content');
      if (pluginContent) {
        const pluginInfo = this.parsePluginContent(pluginContent);
        if (pluginInfo) {
          stats.uniquePlugins.add(pluginInfo.pluginName);
          stats.plugins.push({
            name: pluginInfo.pluginName,
            parameters: pluginInfo.parameters
          });
        }
      }
    }

    stats.uniqueCount = stats.uniquePlugins.size;
    stats.uniquePlugins = Array.from(stats.uniquePlugins);

    return stats;
  }
}

module.exports = DOMPluginHandler;
