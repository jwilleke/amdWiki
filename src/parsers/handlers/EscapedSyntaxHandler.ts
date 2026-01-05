import BaseSyntaxHandler from './BaseSyntaxHandler';
import logger from '../../utils/logger';

/**
 * Match information interface
 */
interface MatchInfo {
  fullMatch: string;
  innerContent: string;
  index: number;
  length: number;
}

/**
 * Parse context interface
 */
interface ParseContext {
  pageName?: string;
  userName?: string;
  engine?: {
    getManager: (name: string) => unknown;
  };
}

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
  declare handlerId: string;

  constructor() {
    super(
      /\[\[([^\]]+)\]/g, // Pattern: [[content] - escape any content (no nested ])
      100, // Highest priority - must process before PluginSyntaxHandler (90)
      {
        description: 'JSPWiki-style double bracket escaping for literal syntax display',
        version: '1.0.0',
        dependencies: []
      }
    );
    this.handlerId = 'EscapedSyntaxHandler';
  }

  /**
   * Process content by finding escaped double bracket patterns
   * @param content - Content to process
   * @param context - Parse context
   * @returns Content with escaped syntax converted to literals
   */
  async process(content: string, context: ParseContext): Promise<string> {
    if (!content) {
      return content;
    }

    // Find all double bracket patterns
    const matches: MatchInfo[] = [];
    let match: RegExpExecArray | null;

    // Reset regex state
    this.pattern.lastIndex = 0;

    while ((match = this.pattern.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],        // [[content]
        innerContent: match[1] ?? '',     // content
        index: match.index,
        length: match[0].length
      });
    }

    // Process matches in reverse order to maintain string positions
    let processedContent = content;

    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];

      try {
        const replacement = await this.handleMatch(matchInfo, context);

        // Replace the match with the escaped output
        processedContent =
          processedContent.slice(0, matchInfo.index) +
          replacement +
          processedContent.slice(matchInfo.index + matchInfo.length);

      } catch (error) {
        const err = error as Error;
        logger.error(`❌ Escape handler error for ${matchInfo.fullMatch}:`, err.message);
        // Leave original syntax on error
      }
    }

    return processedContent;
  }

  /**
   * Handle a specific escaped syntax match
   * @param matchInfo - Match information
   * @param _context - Parse context
   * @returns Literal output
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleMatch(matchInfo: MatchInfo, _context: ParseContext): Promise<string> {
    // Convert [[content] to [content] but HTML-encode the brackets to prevent further processing
    const literalContent = `&#91;${matchInfo.innerContent}&#93;`;
    return literalContent;
  }

  /**
   * Get supported escape patterns for this handler
   * @returns Array of supported patterns
   */
  getSupportedPatterns(): string[] {
    return [
      '[[{PluginName}]',
      '[[{$variable}]',
      '[[WikiLink]]',
      '[[{PluginName param=value}]'
    ];
  }

  /**
   * Get handler information for debugging
   * @returns Handler information
   */
  getInfo(): Record<string, unknown> {
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

export default EscapedSyntaxHandler;

// CommonJS compatibility
module.exports = EscapedSyntaxHandler;
