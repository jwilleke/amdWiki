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
  private matchCamelCase: boolean;
  /** Index mapping variation -> original page name for O(1) lookups */
  private variationIndex: Map<string, string> | null = null;

  /**
   * Creates a new PageNameMatcher instance
   *
   * @param matchEnglishPlurals - Enable plural matching (default: true)
   * @param matchCamelCase - Enable CamelCase splitting/joining matching (default: false)
   */
  constructor(matchEnglishPlurals: boolean = true, matchCamelCase: boolean = false) {
    this.matchEnglishPlurals = matchEnglishPlurals;
    this.matchCamelCase = matchCamelCase;
  }

  /**
   * Build an index from page names for fast O(1) lookups
   * Call this once with all page names before doing many findMatch calls
   *
   * Uses two passes so that exact page names always take priority over
   * plural/singular variants. Without this, "Plugin" would register "plugins"
   * as a variation and steal the index entry from the real "Plugins" page.
   *
   * @param pageNames - Array of all existing page names
   */
  buildIndex(pageNames: string[]): void {
    this.variationIndex = new Map();

    // First pass: register every exact (normalized) page name.
    // These entries must never be overwritten by a variation from another page.
    for (const pageName of pageNames) {
      this.variationIndex.set(this.normalize(pageName), pageName);
    }

    // Second pass: add plural/case variations — only if the slot is still free.
    for (const pageName of pageNames) {
      const variations = this.getVariations(pageName);
      for (const variation of variations) {
        if (!this.variationIndex.has(variation)) {
          this.variationIndex.set(variation, pageName);
        }
      }
    }
  }

  /**
   * Clear the index (call when page list changes)
   */
  clearIndex(): void {
    this.variationIndex = null;
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
   * Split a CamelCase name into separate words
   * e.g., "HealthCare" → ["Health", "Care"], "XMLParser" → ["XML", "Parser"]
   */
  private splitCamelCase(name: string): string[] {
    return name.match(/[A-Z]+(?=[A-Z][a-z])|[A-Z][a-z]*|[a-z]+/g) || [name];
  }

  /**
   * Join space-separated words into CamelCase
   * e.g., "Health Care" → "HealthCare"
   */
  private joinCamelCase(name: string): string {
    return name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
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

    // Build base forms: original + CamelCase variations
    const baseForms: string[] = [normalized];

    if (this.matchCamelCase) {
      // Split CamelCase: "healthcare" from "HealthCare" → "health care"
      const parts = this.splitCamelCase(pageName);
      if (parts.length > 1) {
        const spaced = parts.join(' ').toLowerCase();
        if (spaced !== normalized) {
          baseForms.push(spaced);
        }
      }

      // Join spaced words: "health care" → "healthcare"
      if (pageName.includes(' ')) {
        const joined = this.joinCamelCase(pageName).toLowerCase();
        if (joined !== normalized) {
          baseForms.push(joined);
        }
      }
    }

    if (!this.matchEnglishPlurals) {
      return [...new Set(baseForms)];
    }

    // Apply plural expansion to each base form
    const variations: string[] = [...baseForms];

    for (const form of baseForms) {
      // Pattern 1: ends with 'ies' -> try 'y' form (e.g., "categories" <-> "category")
      if (form.endsWith('ies') && form.length > 3) {
        const base = form.slice(0, -3);
        variations.push(base + 'y');
      } else if (form.endsWith('y') && form.length > 1) {
        const base = form.slice(0, -1);
        // Only add 'ies' if it doesn't end in a vowel + y (e.g., "day" shouldn't become "daies")
        const charBeforeY = form.charAt(form.length - 2);
        if (!'aeiou'.includes(charBeforeY)) {
          variations.push(base + 'ies');
        }
      }

      // Pattern 2: ends with 'es' -> try without 'es' (e.g., "boxes" <-> "box", "classes" <-> "class")
      if (form.endsWith('es') && form.length > 2) {
        const base = form.slice(0, -2);
        variations.push(base);
        // Also try just removing 's' (e.g., "pages" -> "page")
        variations.push(base + 'e');
      }

      // Pattern 3: ends with 's' -> try without 's' (e.g., "clicks" <-> "click")
      if (form.endsWith('s') && form.length > 1 && !form.endsWith('ss')) {
        const base = form.slice(0, -1);
        variations.push(base);
      } else if (!form.endsWith('s')) {
        // Add 's' to singular form (e.g., "click" -> "clicks")
        variations.push(form + 's');

        // Also try 'es' for words ending in s, x, z, ch, sh
        if (form.match(/[sxz]$/) || form.endsWith('ch') || form.endsWith('sh')) {
          variations.push(form + 'es');
        }
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
   * @param existingNames - Array of existing page names (ignored if index is built)
   * @returns The matching page name, or null if not found
   */
  findMatch(searchName: string, existingNames: string[]): string | null {
    if (!searchName) {
      return null;
    }

    // Use indexed lookup if available (O(1) instead of O(n))
    if (this.variationIndex) {
      const searchVariations = this.getVariations(searchName);
      for (const variation of searchVariations) {
        const match = this.variationIndex.get(variation);
        if (match) return match;
      }
      return null;
    }

    // Fallback to linear search if no index
    if (!existingNames || existingNames.length === 0) {
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
module.exports = PageNameMatcher;
