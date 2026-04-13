/**
 * TaggingService — statistical controlled-vocabulary tagger.
 *
 * Scores page content against a fixed vocabulary (from CatalogManager) and
 * returns matched terms. No ML required — uses token overlap with a
 * configurable threshold.
 *
 * Only terms in `allowedCategories` are candidates (default: ['subject']).
 * Workflow-status terms (draft, review, published) are intentionally excluded
 * so they remain manual workflow state — not content descriptors.
 *
 * Related: #507 (auto-tagging for ElasticsearchSearchProvider)
 */

export interface VocabTerm {
  term: string;
  label: string;
  category?: string;
}

export interface TaggingOptions {
  /**
   * Minimum fraction of a vocabulary term's tokens that must appear in the
   * content text to count as a match. Default: 0.5 (half the tokens must hit).
   */
  threshold?: number;
  /** Maximum number of tags to return (highest-scoring first). Default: 10 */
  maxTags?: number;
  /**
   * Only auto-tag terms whose `category` is in this list. Terms with no
   * category set are also included. Default: ['subject']
   */
  allowedCategories?: string[];
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'are', 'was', 'has',
  'have', 'been', 'not', 'but', 'they', 'their', 'which', 'more', 'also',
  'can', 'its', 'all', 'any', 'one', 'may', 'use', 'used', 'using', 'will',
  'page', 'wiki', 'about', 'when', 'where', 'how', 'what', 'who', 'than',
  'into', 'such', 'other', 'each', 'some', 'then', 'she', 'his', 'her'
]);

interface PreparedTerm {
  term: string;
  tokens: string[];
}

interface ScoredTerm {
  term: string;
  score: number;
}

export class TaggingService {
  private readonly threshold: number;
  private readonly maxTags: number;
  private readonly allowedCategories: string[];
  private vocab: PreparedTerm[] = [];

  constructor(options: TaggingOptions = {}) {
    this.threshold = options.threshold ?? 0.5;
    this.maxTags = options.maxTags ?? 10;
    this.allowedCategories = options.allowedCategories ?? ['subject'];
  }

  /**
   * Load (or replace) the controlled vocabulary.
   * Call once after CatalogManager.getTerms() resolves.
   */
  setVocabulary(terms: VocabTerm[]): void {
    this.vocab = terms
      .filter(t => !t.category || this.allowedCategories.includes(t.category))
      .map(t => ({
        term: t.term,
        tokens: this._tokenize(t.term.replace(/-/g, ' ') + ' ' + t.label)
      }))
      .filter(t => t.tokens.length > 0);
  }

  /** Number of vocabulary terms currently loaded. */
  get vocabularySize(): number {
    return this.vocab.length;
  }

  /**
   * Return matched taxonomy terms for the given content + title.
   * Terms already in `existingTags` are never duplicated in the output.
   */
  tag(content: string, title = '', existingTags: string[] = []): string[] {
    if (this.vocab.length === 0) return [];

    const existing = new Set(existingTags);
    const textTokens = this._tokenize((title + ' ' + content).replace(/-/g, ' '));
    const wordFreq = new Map<string, number>();
    for (const w of textTokens) {
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
    }

    const scored: ScoredTerm[] = [];
    for (const { term, tokens } of this.vocab) {
      if (existing.has(term)) continue;
      const matchCount = tokens.filter(t => wordFreq.has(t)).length;
      const score = matchCount / tokens.length;
      if (score >= this.threshold) {
        scored.push({ term, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxTags)
      .map(s => s.term);
  }

  private _tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOPWORDS.has(w));
  }
}
