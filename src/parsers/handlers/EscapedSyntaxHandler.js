const { BaseSyntaxHandler } = require('./BaseSyntaxHandler');

/**
 * EscapedSyntaxHandler - JSPWiki double bracket escaping
 *
 * Handles JSPWiki-style double bracket escaping: [[{syntax}] → [{syntax}]
 * This allows literal display of wiki syntax without processing.
 *
 * Examples:
 * - [[{PluginName}] → [{PluginName}] (literal, not processed as plugin)
 * - [[{$variable}] → [{$variable}] (literal, not processed as variable)
 * - <!--[[PageName]]--> → <!--[PageName]--> (literal, not processed as wiki link)
 */
class EscapedSyntaxHandler extends BaseSyntaxHandler {
  constructor() {
    super(
      /\[\[(\{[\s\S]*?\})\]/g, // Pattern: [[{PluginName params...}] - escape plugin syntax with any content
      100, // Highest priority - must process before PluginSyntaxHandler (90)
      {
        description: 'JSPWiki-style double bracket escaping for literal syntax display',
        version: '1.0.0',
        dependencies: [],
        cacheEnabled: true
      }
    );
    this.handlerId = 'EscapedSyntaxHandler';
  }

  /**
   * Process content by finding escaped double bracket patterns
   * @param {string} content - Content to process
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Content with escaped syntax converted to literals
   */
  async process(content, context) {
    if (!content) {
      return content;
    }

    // Find all double bracket patterns
    const matches = [];
    let match;

    // Reset regex state
    this.pattern.lastIndex = 0;

    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],        // [[{PluginName}]
        innerContent: match[1],     // {PluginName}
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;

    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];

      try {
        const replacement = await this.handle(matchInfo, context);

        // Replace the match with the escaped output
        processedContent =
          processedContent.slice(0, matchInfo.index) +
          replacement +
          processedContent.slice(matchInfo.index + matchInfo.length);

      } catch (error) {
        console.error(`❌ Escape handler error for ${matchInfo.fullMatch}:`, error.message);
        // Leave original syntax on error
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific escaped syntax match
   * @param {Object} matchInfo - Match information
   * @param {ParseContext} context - Parse context
   * @returns {Promise<string>} - Literal output
   */
  async handle(matchInfo, context) {
    // Convert [[{content}] to [{content}] but HTML-encode the brackets to prevent further processing
    const literalContent = `&#91;${matchInfo.innerContent}&#93;`;

    // Debug: console.log(`🔓 Escaped syntax: ${matchInfo.fullMatch.replace(/\n/g, '\\n')} → ${literalContent}`);

    return literalContent;
  }

  /**
   * Get supported escape patterns for this handler
   * @returns {Array<string>} - Array of supported patterns
   */
  getSupportedPatterns() {
    return [
      '[[{PluginName}]',
      '[[{$variable}]',
      '[[WikiLink]]',
      '[[{PluginName param=value}]'
    ];
  }

  /**
   * Get handler information for debugging
   * @returns {Object} - Handler information
   */
  getInfo() {
    return {
      ...super.getMetadata(),
      supportedPatterns: this.getSupportedPatterns(),
      features: [
        'JSPWiki double bracket escaping',
        'Literal syntax display',
        'Plugin escape support',
        'Variable escape support',
        'Wiki link escape support'
      ]
    };
  }
}

module.exports = EscapedSyntaxHandler;