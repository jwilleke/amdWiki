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

import type WikiDocument from '../WikiDocument';
import logger from '../../../utils/logger';
import type { LinkedomElement } from '../WikiDocument';

/**
 * Context for variable resolution
 */
export interface VariableContext {
  /** Page name */
  pageName?: string;
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
  /** Page context (nested structure from WikiContext) */
  pageContext?: VariableContext;
  /** WikiEngine reference */
  engine?: unknown;
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Variable handler function type
 */
export type VariableHandler = (context: VariableContext) => string | number | Promise<string | number>;

/**
 * Variable manager interface
 */
interface VariableManager {
  /** Map of variable handlers */
  variableHandlers: Map<string, VariableHandler>;
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
export interface ExtractedElement {
  /** Element type */
  type: string;
  /** Variable name (may include $ prefix) */
  varName: string;
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
 * Information about a single variable
 */
export interface VariableInfo {
  /** Variable name */
  name: string;
  /** Whether the variable was successfully resolved */
  resolved: boolean;
}

/**
 * Statistics about variable processing
 */
export interface VariableStatistics {
  /** Total number of variables in document */
  totalVariables: number;
  /** Number of unique variables */
  uniqueCount: number;
  /** Array of unique variable names */
  uniqueVariables: string[];
  /** Array of variable information */
  variables: VariableInfo[];
}

/**
 * DOMVariableHandler class
 */
class DOMVariableHandler {
  /** WikiEngine instance */
  private engine: WikiEngine;

  /** VariableManager instance (loaded dynamically) */
  private variableManager: VariableManager | null;

  /**
   * Creates a new DOMVariableHandler
   *
   * @param {WikiEngine} engine - WikiEngine instance
   */
  constructor(engine: WikiEngine) {
    this.engine = engine;
    this.variableManager = null;
  }

  /**
   * Initializes the handler
   */
   
  async initialize(): Promise<void> {
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
   * @param {VariableContext} context - Rendering context
   * @returns {Promise<WikiDocument>} Updated WikiDocument
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- Implements DOM handler async interface
  async processVariables(wikiDocument: WikiDocument, context: VariableContext): Promise<WikiDocument> {
    // Get VariableManager dynamically (it might not be available during initialization)
    if (!this.variableManager) {
      this.variableManager = this.engine.getManager('VariableManager') as VariableManager | null;
    }

    if (!this.variableManager) {
      logger.warn('⚠️  DOMVariableHandler: Cannot process variables without VariableManager');
      return wikiDocument;
    }

    // Query for all variable elements
     
    const variableElements = wikiDocument.querySelectorAll('.wiki-variable');

    if (variableElements.length === 0) {
      return wikiDocument;
    }

    logger.debug(`🔍 DOMVariableHandler: Processing ${variableElements.length} variables`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each variable element

    for (let i = 0; i < variableElements.length; i++) {
      const varElement = variableElements[i] as LinkedomElement;
      try {
        // Get variable name from data attribute
         
        const varName = varElement.getAttribute('data-variable');

        if (!varName) {
          logger.warn('⚠️  Variable element missing data-variable attribute');
          continue;
        }

        // Resolve variable value (resolveVariable handles context normalization)
         
        const value = this.resolveVariable(varName, context);

        if (value !== null && value !== undefined) {
          // Update element text content with resolved value
           
          varElement.textContent = String(value);
          processedCount++;
        } else {
          // Variable not found - keep original syntax
           
          varElement.textContent = `{$${varName}}`;
          logger.warn(`⚠️  Variable not found: ${varName}`);
        }

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('❌ Error processing variable:', errorMessage);
        // On error, show error message
         
        varElement.textContent = `[Error: ${errorMessage}]`;
      }
    }

    logger.debug(`✅ DOMVariableHandler: Processed ${processedCount} variables, ${errorCount} errors`);

    return wikiDocument;
  }

  /**
   * Resolves a variable name to its value
   *
   * @param {string} varName - Variable name (without {$ })
   * @param {VariableContext} context - Rendering context
   * @returns {string | number | null} Variable value or null if not found
   */
  resolveVariable(varName: string, context: VariableContext): string | number | null {
    if (!this.variableManager || !this.variableManager.variableHandlers) {
      return null;
    }

    // Get handler for this variable (case-insensitive)
    const handler = this.variableManager.variableHandlers.get(varName.toLowerCase().trim());

    if (!handler) {
      return null;
    }

    try {
      // Extract pageContext from context if it exists (WikiContext.toParseOptions() structure)
      // Context can be either:
      // 1. { pageContext: { pageName, userContext, requestInfo }, engine } (from WikiContext)
      // 2. { pageName, userContext, requestInfo } (direct format)
      const variableContext = context.pageContext || context;

      const result = handler(variableContext);

      // Handle async handlers
      if (result instanceof Promise) {
        logger.warn(`⚠️  Variable '${varName}' returned Promise - cannot resolve synchronously`);
        return null;
      }

      return result;

    } catch (error) {
      logger.error(`❌ Error resolving variable '${varName}':`, error);
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
   * @param {ExtractedElement} element - Extracted element from extractJSPWikiSyntax()
   * @param {VariableContext} context - Rendering context
   * @param {WikiDocument} wikiDocument - WikiDocument to create node in
   * @returns {Promise<Element>} DOM node for the variable
   *
   * @example
   * const element = { type: 'variable', varName: '$username', id: 0, ... };
   * const node = await handler.createNodeFromExtract(element, context, wikiDoc);
   * // Returns: <span class="wiki-variable" data-variable="username">JohnDoe</span>
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- Implements DOM handler async interface
  async createNodeFromExtract(element: ExtractedElement, context: VariableContext, wikiDocument: WikiDocument): Promise<LinkedomElement> {
    // Get VariableManager dynamically
    if (!this.variableManager) {
      this.variableManager = this.engine.getManager('VariableManager') as VariableManager | null;
    }

    // Extract variable name (remove $ prefix if present)
    const varName = element.varName.startsWith('$')
      ? element.varName.substring(1)
      : element.varName;

    // Resolve variable value
    let value: string | number;
    try {
      const resolvedValue = this.resolveVariable(varName, context);

      // If value is null/undefined, use default text
      if (resolvedValue === null || resolvedValue === undefined) {
        value = `{$${varName}}`; // Show unresolved variable
      } else {
        value = resolvedValue;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Error resolving variable '${varName}':`, errorMessage);
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
   * @returns {VariableStatistics} Statistics
   */
  getStatistics(wikiDocument: WikiDocument): VariableStatistics {
     
    const variableElements = wikiDocument.querySelectorAll('.wiki-variable');

    const uniqueVariablesSet = new Set<string>();
    const variables: VariableInfo[] = [];


    for (let i = 0; i < variableElements.length; i++) {
      const varElement = variableElements[i] as LinkedomElement;
      const varName = varElement.getAttribute('data-variable');
      if (varName) {
        uniqueVariablesSet.add(varName);
        const textContent = varElement.textContent;
        variables.push({
          name: varName,
          resolved: !textContent.startsWith('{$')
        });
      }
    }

    const stats: VariableStatistics = {
      totalVariables: variableElements.length,
      uniqueCount: uniqueVariablesSet.size,
      uniqueVariables: Array.from(uniqueVariablesSet),
      variables: variables
    };

    return stats;
  }
}

export default DOMVariableHandler;

// CommonJS compatibility
module.exports = DOMVariableHandler;
