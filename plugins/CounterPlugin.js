/**
 * CounterPlugin - JSPWiki-style plugin for amdWiki
 * Maintains page-specific counters that increment each time they render
 *
 * Unlike a persistent hit counter, this tracks counters within a single page render cycle.
 * Useful for numbering items, tracking plugin invocations, or conditional logic.
 *
 * Counter values can be accessed as variables:
 * - [{$counter}] - Access default counter value without incrementing
 * - [{$counter-name}] - Access named counter value without incrementing
 *
 * Syntax examples:
 * [{Counter}]                          - Default counter, increments by 1, shows value
 * [{Counter increment='5'}]            - Increments default counter by 5
 * [{Counter name='chapter'}]           - Named counter 'chapter'
 * [{Counter name='chapter' increment='2'}] - Increments 'chapter' by 2
 * [{Counter showResult='false'}]       - Silent increment (no output)
 * [{Counter start='100'}]              - Reset counter to 100
 * [{Counter name='section' start='1'}] - Reset named counter to 1
 * [{Counter increment='-1'}]           - Decrement counter
 *
 * Based on JSPWiki's Counter.java:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/plugin/Counter.java
 * https://jspwiki-wiki.apache.org/Wiki.jsp?page=Counter
 */

const CounterPlugin = {
  name: 'CounterPlugin',
  description: 'Maintains page-specific counters for numbering and tracking',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context containing counter state
   * @param {Object} params - Plugin parameters
   * @returns {string} Counter value or empty string
   */
  execute(context, params) {
    try {
      // Parse parameters
      const opts = params || {};
      const counterName = opts.name || 'counter';
      const increment = this.parseNumber(opts.increment, 1);
      const showResult = this.parseBoolean(opts.showResult, true);
      const start = opts.start !== undefined ? this.parseNumber(opts.start, 0) : undefined;

      // Initialize counters storage in context if needed
      if (!context.counters) {
        context.counters = {};
      }

      // Build the counter variable name (matches JSPWiki format)
      const varName = counterName === 'counter' ? 'counter' : `counter-${counterName}`;

      // Handle 'start' parameter - resets the counter
      if (start !== undefined) {
        context.counters[varName] = start;
      } else {
        // Get current value or initialize to 0
        const currentValue = context.counters[varName] || 0;
        // Apply increment
        context.counters[varName] = currentValue + increment;
      }

      // Return the counter value if showResult is true
      if (showResult) {
        return String(context.counters[varName]);
      }

      // Silent mode - return empty string
      return '';

    } catch (error) {
      console.error('[CounterPlugin] Error:', error);
      return `[Counter Error: ${error.message}]`;
    }
  },

  /**
   * Parse a parameter value as a number
   * @param {*} value - Value to parse
   * @param {number} defaultValue - Default if parsing fails
   * @returns {number} Parsed number
   */
  parseNumber(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`[CounterPlugin] Invalid number "${value}", using default ${defaultValue}`);
      return defaultValue;
    }

    return num;
  },

  /**
   * Parse a parameter value as a boolean
   * @param {*} value - Value to parse
   * @param {boolean} defaultValue - Default if parsing fails
   * @returns {boolean} Parsed boolean
   */
  parseBoolean(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const str = String(value).toLowerCase();
    if (str === 'true' || str === 'yes' || str === '1') {
      return true;
    }
    if (str === 'false' || str === 'no' || str === '0') {
      return false;
    }

    return defaultValue;
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * Registers counter variables with VariableManager for [{$counter}] access
   * @param {Object} engine - Wiki engine instance
   */
  initialize(engine) {
    console.log(`Initializing ${this.name} v${this.version}`);

    // Register counter variable handler with VariableManager
    const variableManager = engine.getManager?.('VariableManager');
    if (variableManager) {
      // Register handler for default counter variable [{$counter}]
      variableManager.registerVariable('counter', (context) => {
        return context?.counters?.counter?.toString() || '0';
      });

      console.log('[CounterPlugin] Registered counter variable handlers with VariableManager');
    } else {
      console.warn('[CounterPlugin] VariableManager not available - counter variables will not work');
    }
  }
};

module.exports = CounterPlugin;
