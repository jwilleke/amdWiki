/**
 * PageNameMatcher - Utility for matching page names with plural and case variations
 *
 * Implements JSPWiki-style plural matching to allow flexible page name resolution.
 * For example, linking to "Page" will match both "Page" and "Pages".
 *
 * @example
 * const matcher = new PageNameMatcher(true);
 * matcher.findMatch('Page', ['Pages', 'Main']); // Returns 'Pages'
 * matcher.findMatch('Categories', ['Category']); // Returns 'Category'
 */
export default class PageNameMatcher {
  private matchEnglishPlurals: boolean;

  /**
   * Creates a new PageNameMatcher instance
   *
   * @param matchEnglishPlurals - Enable plural matching (default: true)
   */
  constructor(matchEnglishPlurals: boolean = true) {
    this.matchEnglishPlurals = matchEnglishPlurals;
  }

  /**
   * Normalize a page name for comparison (lowercase)
   *
   * @param pageName - The page name to normalize
   * @returns Normalized page name
   */
  normalize(pageName: string): string {
    if (!pageName) return '';
    return pageName.toLowerCase();
  }

  /**
   * Get all possible plural/singular variations of a page name
   *
   * @param pageName - The base page name
   * @returns Array of possible variations (all lowercase)
   */
  getVariations(pageName: string): string[] {
    if (!pageName) return [];

    const normalized = this.normalize(pageName);
    const variations: string[] = [normalized];

    if (!this.matchEnglishPlurals) {
      return variations;
    }

    // Check if it ends with common plural patterns and generate singular/plural forms

    // Pattern 1: ends with 'ies' -> try 'y' form (e.g., "categories" <-> "category")
    if (normalized.endsWith('ies') && normalized.length > 3) {
      const base = normalized.slice(0, -3);
      variations.push(base + 'y');
    } else if (normalized.endsWith('y') && normalized.length > 1) {
      const base = normalized.slice(0, -1);
      // Only add 'ies' if it doesn't end in a vowel + y (e.g., "day" shouldn't become "daies")
      const charBeforeY = normalized.charAt(normalized.length - 2);
      if (!'aeiou'.includes(charBeforeY)) {
        variations.push(base + 'ies');
      }
    }

    // Pattern 2: ends with 'es' -> try without 'es' (e.g., "boxes" <-> "box", "classes" <-> "class")
    if (normalized.endsWith('es') && normalized.length > 2) {
      const base = normalized.slice(0, -2);
      variations.push(base);
      // Also try just removing 's' (e.g., "pages" -> "page")
      variations.push(base + 'e');
    }

    // Pattern 3: ends with 's' -> try without 's' (e.g., "clicks" <-> "click")
    if (normalized.endsWith('s') && normalized.length > 1 && !normalized.endsWith('ss')) {
      const base = normalized.slice(0, -1);
      variations.push(base);
    } else if (!normalized.endsWith('s')) {
      // Add 's' to singular form (e.g., "click" -> "clicks")
      variations.push(normalized + 's');

      // Also try 'es' for words ending in s, x, z, ch, sh
      if (normalized.match(/[sxz]$/) || normalized.endsWith('ch') || normalized.endsWith('sh')) {
        variations.push(normalized + 'es');
      }
    }

    // Remove duplicates and return
    return [...new Set(variations)];
  }

  /**
   * Check if two page names match (considering plurals and case)
   *
   * @param name1 - First page name
   * @param name2 - Second page name
   * @returns True if the names match
   */
  matches(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;

    const variations1 = this.getVariations(name1);
    const variations2 = this.getVariations(name2);

    // Check if any variation of name1 matches any variation of name2
    return variations1.some(v1 => variations2.includes(v1));
  }

  /**
   * Find a matching page name from a list of existing page names
   *
   * @param searchName - The page name to search for
   * @param existingNames - Array of existing page names
   * @returns The matching page name, or null if not found
   */
  findMatch(searchName: string, existingNames: string[]): string | null {
    if (!searchName || !existingNames || existingNames.length === 0) {
      return null;
    }

    const searchVariations = this.getVariations(searchName);

    // Try exact match first (case-insensitive)
    const exactMatch = existingNames.find(name =>
      this.normalize(name) === this.normalize(searchName)
    );
    if (exactMatch) return exactMatch;

    // If plural matching is disabled, stop here
    if (!this.matchEnglishPlurals) {
      return null;
    }

    // Try to find a match using variations
    for (const existingName of existingNames) {
      const existingVariations = this.getVariations(existingName);

      // Check if any search variation matches any existing variation
      const hasMatch = searchVariations.some(searchVar =>
        existingVariations.includes(searchVar)
      );

      if (hasMatch) {
        return existingName;
      }
    }

    return null;
  }

  /**
   * Check if a page name conflicts with any existing pages (considering plurals)
   * Used when creating new pages to prevent creating "Click" when "Clicks" exists
   *
   * @param newPageName - The new page name to check
   * @param existingNames - Array of existing page names
   * @returns The conflicting page name, or null if no conflict
   */
  findConflict(newPageName: string, existingNames: string[]): string | null {
    return this.findMatch(newPageName, existingNames);
  }
}

// CommonJS compatibility
module.exports = classPageNameMatcher{;
