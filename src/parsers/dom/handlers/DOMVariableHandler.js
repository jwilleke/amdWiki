/**
 * DOMVariableHandler - DOM-based variable expansion handler
 *
 * Replaces string-based regex variable expansion with DOM queries.
 * Processes wiki variables by querying WikiDocument for .wiki-variable elements
 * and resolving their values through VariableManager.
 *
 * Part of Phase 3 of WikiDocument DOM Migration (GitHub Issue #93)
 *
 * Usage:
 *   In wiki markup: {$username}, {$pagename}, {$date}, etc.
 *   These are tokenized as VARIABLE tokens and become .wiki-variable elements
 *   This handler resolves them to actual values
 */
class DOMVariableHandler {
  /**
   * Creates a new DOMVariableHandler
   *
   * @param {Object} engine - WikiEngine instance
   */
  constructor(engine) {
    this.engine = engine;
    this.variableManager = null;
  }

  /**
   * Initializes the handler
   */
  async initialize() {
    // VariableManager may not be available yet during initialization
    // We'll get it dynamically during processing
  }

  /**
   * Processes variables in a WikiDocument
   *
   * Queries for .wiki-variable elements and resolves their values.
   * This is the DOM-based equivalent of VariableManager.expandVariables()
   *
   * @param {WikiDocument} wikiDocument - The WikiDocument to process
   * @param {Object} context - Rendering context
   * @returns {WikiDocument} Updated WikiDocument
   */
  async processVariables(wikiDocument, context) {
    // Get VariableManager dynamically (it might not be available during initialization)
    if (!this.variableManager) {
      this.variableManager = this.engine.getManager('VariableManager');
    }

    if (!this.variableManager) {
      console.warn('⚠️  DOMVariableHandler: Cannot process variables without VariableManager');
      return wikiDocument;
    }

    // Query for all variable elements
    const variableElements = wikiDocument.querySelectorAll('.wiki-variable');

    if (variableElements.length === 0) {
      return wikiDocument;
    }

    console.log(`🔍 DOMVariableHandler: Processing ${variableElements.length} variables`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each variable element
    for (const varElement of variableElements) {
      try {
        // Get variable name from data attribute
        const varName = varElement.getAttribute('data-variable');

        if (!varName) {
          console.warn('⚠️  Variable element missing data-variable attribute');
          continue;
        }

        // Resolve variable value
        const value = this.resolveVariable(varName, context);

        if (value !== null && value !== undefined) {
          // Update element text content with resolved value
          varElement.textContent = value;
          processedCount++;
        } else {
          // Variable not found - keep original syntax
          varElement.textContent = `{$${varName}}`;
          console.warn(`⚠️  Variable not found: ${varName}`);
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing variable:`, error.message);
        // On error, show error message
        varElement.textContent = `[Error: ${error.message}]`;
      }
    }

    console.log(`✅ DOMVariableHandler: Processed ${processedCount} variables, ${errorCount} errors`);

    return wikiDocument;
  }

  /**
   * Resolves a variable name to its value
   *
   * @param {string} varName - Variable name (without {$ })
   * @param {Object} context - Rendering context
   * @returns {string|null} Variable value or null if not found
   */
  resolveVariable(varName, context) {
    if (!this.variableManager || !this.variableManager.variableHandlers) {
      return null;
    }

    // Get handler for this variable (case-insensitive)
    const handler = this.variableManager.variableHandlers.get(varName.toLowerCase().trim());

    if (!handler) {
      return null;
    }

    try {
      const result = handler(context);

      // Handle async handlers
      if (result instanceof Promise) {
        console.warn(`⚠️  Variable '${varName}' returned Promise - cannot resolve synchronously`);
        return null;
      }

      return result;

    } catch (error) {
      console.error(`❌ Error resolving variable '${varName}':`, error);
      throw error;
    }
  }

  /**
   * Creates a DOM node from an extracted variable element
   *
   * This method is part of the Phase 2 extraction-based parsing (Issue #114).
   * It creates a variable node from a pre-extracted element instead of
   * parsing it from tokens.
   *
   * @param {Object} element - Extracted element from extractJSPWikiSyntax()
   * @param {Object} context - Rendering context
   * @param {WikiDocument} wikiDocument - WikiDocument to create node in
   * @returns {Element} DOM node for the variable
   *
   * @example
   * const element = { type: 'variable', varName: '$username', id: 0, ... };
   * const node = handler.createNodeFromExtract(element, context, wikiDoc);
   * // Returns: <span class="wiki-variable" data-variable="username">JohnDoe</span>
   */
  async createNodeFromExtract(element, context, wikiDocument) {
    // Get VariableManager dynamically
    if (!this.variableManager) {
      this.variableManager = this.engine.getManager('VariableManager');
    }

    // Extract variable name (remove $ prefix if present)
    const varName = element.varName.startsWith('$')
      ? element.varName.substring(1)
      : element.varName;

    // Resolve variable value
    let value;
    try {
      value = this.resolveVariable(varName, context);

      // If value is null/undefined, use default text
      if (value === null || value === undefined) {
        value = `{$${varName}}`; // Show unresolved variable
      }
    } catch (error) {
      console.error(`❌ Error resolving variable '${varName}':`, error.message);
      value = `[Error: ${varName}]`;
    }

    // Create DOM node
    const node = wikiDocument.createElement('span', {
      'class': 'wiki-variable',
      'data-variable': varName,
      'data-jspwiki-id': element.id.toString()
    });

    node.textContent = String(value);

    return node;
  }

  /**
   * Gets statistics about variable processing
   *
   * @param {WikiDocument} wikiDocument - Document to analyze
   * @returns {Object} Statistics
   */
  getStatistics(wikiDocument) {
    const variableElements = wikiDocument.querySelectorAll('.wiki-variable');

    const stats = {
      totalVariables: variableElements.length,
      uniqueVariables: new Set(),
      variables: []
    };

    for (const varElement of variableElements) {
      const varName = varElement.getAttribute('data-variable');
      if (varName) {
        stats.uniqueVariables.add(varName);
        stats.variables.push({
          name: varName,
          resolved: !varElement.textContent.startsWith('{$')
        });
      }
    }

    stats.uniqueCount = stats.uniqueVariables.size;
    stats.uniqueVariables = Array.from(stats.uniqueVariables);

    return stats;
  }
}

module.exports = DOMVariableHandler;
