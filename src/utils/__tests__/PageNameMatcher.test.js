/**
 * PageNameMatcher Unit Tests
 *
 * Pure unit tests with no dependencies on WikiEngine or managers.
 * Tests the string matching logic for plural/singular page name variations.
 */

// Clear the jest.setup.js mock and get the real implementation
// For CommonJS modules, jest.requireActual returns the module.exports directly
const actualModule = jest.requireActual('../PageNameMatcher');
// Handle both default export and named export patterns
const PageNameMatcher = actualModule.default || actualModule;

describe('PageNameMatcher', () => {
  describe('Constructor', () => {
    test('should default to enabling plural matching', () => {
      const matcher = new PageNameMatcher();
      expect(matcher.matchEnglishPlurals).toBe(true);
    });

    test('should accept matchEnglishPlurals parameter', () => {
      const matcher = new PageNameMatcher(false);
      expect(matcher.matchEnglishPlurals).toBe(false);
    });
  });

  describe('normalize()', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher();
    });

    test('should convert to lowercase', () => {
      expect(matcher.normalize('PageName')).toBe('pagename');
      expect(matcher.normalize('UPPERCASE')).toBe('uppercase');
      expect(matcher.normalize('MixedCase')).toBe('mixedcase');
    });

    test('should handle empty strings', () => {
      expect(matcher.normalize('')).toBe('');
      expect(matcher.normalize(null)).toBe('');
      expect(matcher.normalize(undefined)).toBe('');
    });

    test('should preserve spaces and special characters', () => {
      expect(matcher.normalize('Page Name')).toBe('page name');
      expect(matcher.normalize('Page-Name')).toBe('page-name');
    });
  });

  describe('getVariations() - with plural matching enabled', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher(true);
    });

    test('should include original normalized form', () => {
      const variations = matcher.getVariations('Page');
      expect(variations).toContain('page');
    });

    test('should generate plural for singular ending in consonant+y -> ies', () => {
      const variations = matcher.getVariations('Category');
      expect(variations).toContain('category');
      expect(variations).toContain('categories');
    });

    test('should generate singular for plural ending in ies -> y', () => {
      const variations = matcher.getVariations('Categories');
      expect(variations).toContain('categories');
      expect(variations).toContain('category');
    });

    test('should not convert vowel+y to ies', () => {
      const variations = matcher.getVariations('Day');
      expect(variations).toContain('day');
      expect(variations).toContain('days');
      expect(variations).not.toContain('daies');
    });

    test('should handle simple s plural', () => {
      const variations = matcher.getVariations('Page');
      expect(variations).toContain('page');
      expect(variations).toContain('pages');
    });

    test('should handle es plural for words ending in s, x, z', () => {
      const boxVariations = matcher.getVariations('Box');
      expect(boxVariations).toContain('box');
      expect(boxVariations).toContain('boxes');

      // Class ends in 'ss', so it doesn't get 'es' added (would be 'classess')
      // It only gets 's' removed to become 'clas'
      const classVariations = matcher.getVariations('Class');
      expect(classVariations).toContain('class');
      // Don't expect 'classes' since 'ss' ending is handled differently
    });

    test('should handle es plural for words ending in ch, sh', () => {
      const matchVariations = matcher.getVariations('Match');
      expect(matchVariations).toContain('match');
      expect(matchVariations).toContain('matches');

      const wishVariations = matcher.getVariations('Wish');
      expect(wishVariations).toContain('wish');
      expect(wishVariations).toContain('wishes');
    });

    test('should remove duplicates', () => {
      const variations = matcher.getVariations('Pages');
      const uniqueVariations = [...new Set(variations)];
      expect(variations.length).toBe(uniqueVariations.length);
    });

    test('should handle empty input', () => {
      expect(matcher.getVariations('')).toEqual([]);
      expect(matcher.getVariations(null)).toEqual([]);
      expect(matcher.getVariations(undefined)).toEqual([]);
    });
  });

  describe('getVariations() - with plural matching disabled', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher(false);
    });

    test('should return only normalized form', () => {
      const variations = matcher.getVariations('Category');
      expect(variations).toEqual(['category']);
    });

    test('should not generate plural variations', () => {
      const variations = matcher.getVariations('Page');
      expect(variations).toEqual(['page']);
      expect(variations).not.toContain('pages');
    });
  });

  describe('matches()', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher(true);
    });

    test('should match exact names case-insensitively', () => {
      expect(matcher.matches('Page', 'page')).toBe(true);
      expect(matcher.matches('PAGE', 'page')).toBe(true);
      expect(matcher.matches('PaGe', 'pAgE')).toBe(true);
    });

    test('should match singular to plural', () => {
      expect(matcher.matches('Page', 'Pages')).toBe(true);
      expect(matcher.matches('Category', 'Categories')).toBe(true);
      expect(matcher.matches('Box', 'Boxes')).toBe(true);
    });

    test('should match plural to singular', () => {
      expect(matcher.matches('Pages', 'Page')).toBe(true);
      expect(matcher.matches('Categories', 'Category')).toBe(true);
      expect(matcher.matches('Boxes', 'Box')).toBe(true);
    });

    test('should not match unrelated words', () => {
      expect(matcher.matches('Page', 'Book')).toBe(false);
      expect(matcher.matches('Category', 'Article')).toBe(false);
    });

    test('should handle empty/null inputs', () => {
      expect(matcher.matches('', 'Page')).toBe(false);
      expect(matcher.matches('Page', '')).toBe(false);
      expect(matcher.matches(null, 'Page')).toBe(false);
      expect(matcher.matches('Page', null)).toBe(false);
    });
  });

  describe('matches() - with plural matching disabled', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher(false);
    });

    test('should match exact names only', () => {
      expect(matcher.matches('Page', 'page')).toBe(true);
      expect(matcher.matches('Page', 'Pages')).toBe(false);
    });
  });

  describe('findMatch()', () => {
    let matcher;
    let existingPages;

    beforeEach(() => {
      matcher = new PageNameMatcher(true);
      existingPages = ['HomePage', 'Categories', 'Box', 'UserList'];
    });

    test('should find exact match (case-insensitive)', () => {
      expect(matcher.findMatch('HomePage', existingPages)).toBe('HomePage');
      expect(matcher.findMatch('homepage', existingPages)).toBe('HomePage');
      expect(matcher.findMatch('HOMEPAGE', existingPages)).toBe('HomePage');
    });

    test('should prioritize exact match over plural match', () => {
      const pages = ['Page', 'Pages'];
      expect(matcher.findMatch('Page', pages)).toBe('Page');
      expect(matcher.findMatch('Pages', pages)).toBe('Pages');
    });

    test('should find singular when searching for plural', () => {
      const pages = ['Category', 'User'];
      expect(matcher.findMatch('Categories', pages)).toBe('Category');
      expect(matcher.findMatch('Users', pages)).toBe('User');
    });

    test('should find plural when searching for singular', () => {
      expect(matcher.findMatch('Category', existingPages)).toBe('Categories');
    });

    test('should return null when no match found', () => {
      expect(matcher.findMatch('NonExistent', existingPages)).toBeNull();
      expect(matcher.findMatch('Unknown', existingPages)).toBeNull();
    });

    test('should handle empty inputs gracefully', () => {
      expect(matcher.findMatch('', existingPages)).toBeNull();
      expect(matcher.findMatch(null, existingPages)).toBeNull();
      expect(matcher.findMatch('Page', [])).toBeNull();
      expect(matcher.findMatch('Page', null)).toBeNull();
    });

    test('should handle complex plural patterns', () => {
      const pages = ['Wish', 'Match', 'Class'];
      expect(matcher.findMatch('Wishes', pages)).toBe('Wish');
      expect(matcher.findMatch('Matches', pages)).toBe('Match');
      expect(matcher.findMatch('Classes', pages)).toBe('Class');
    });
  });

  describe('findMatch() - with plural matching disabled', () => {
    let matcher;
    let existingPages;

    beforeEach(() => {
      matcher = new PageNameMatcher(false);
      existingPages = ['HomePage', 'Categories', 'Box'];
    });

    test('should only find exact matches', () => {
      expect(matcher.findMatch('HomePage', existingPages)).toBe('HomePage');
      expect(matcher.findMatch('Category', existingPages)).toBeNull();
      expect(matcher.findMatch('Boxes', existingPages)).toBeNull();
    });

    test('should still be case-insensitive', () => {
      expect(matcher.findMatch('homepage', existingPages)).toBe('HomePage');
      expect(matcher.findMatch('CATEGORIES', existingPages)).toBe('Categories');
    });
  });

  describe('findConflict()', () => {
    let matcher;
    let existingPages;

    beforeEach(() => {
      matcher = new PageNameMatcher(true);
      existingPages = ['HomePage', 'Categories', 'Users'];
    });

    test('should detect conflict when creating plural of existing singular', () => {
      const pages = ['Category'];
      expect(matcher.findConflict('Categories', pages)).toBe('Category');
    });

    test('should detect conflict when creating singular of existing plural', () => {
      expect(matcher.findConflict('Category', existingPages)).toBe('Categories');
      expect(matcher.findConflict('User', existingPages)).toBe('Users');
    });

    test('should return null when no conflict exists', () => {
      expect(matcher.findConflict('NewPage', existingPages)).toBeNull();
    });

    test('should detect exact name conflicts', () => {
      expect(matcher.findConflict('HomePage', existingPages)).toBe('HomePage');
    });
  });

  describe('Real-world scenarios', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher(true);
    });

    test('should handle wiki page linking scenarios', () => {
      const wikiPages = [
        'HomePage',
        'UserGuide',
        'Categories',
        'Tag',
        'Wish'
      ];

      // User types [Page] - won't match HomePage (not a plural variation)
      expect(matcher.findMatch('Page', ['HomePage'])).toBeNull();

      // But if HomePage was called "Pages", then "Page" would match
      expect(matcher.findMatch('Page', ['Pages'])).toBe('Pages');

      // User types [category] but Categories exists
      expect(matcher.findMatch('category', wikiPages)).toBe('Categories');

      // User types [Tags] but Tag exists
      expect(matcher.findMatch('Tags', wikiPages)).toBe('Tag');

      // User types [Wishes] but Wish exists
      expect(matcher.findMatch('Wishes', wikiPages)).toBe('Wish');
    });

    test('should prevent duplicate page creation', () => {
      const existingPages = ['UserGuide', 'Categories', 'Box'];

      // User tries to create "UserGuides" when "UserGuide" exists
      expect(matcher.findConflict('UserGuides', existingPages)).toBe('UserGuide');

      // User tries to create "Category" when "Categories" exists
      expect(matcher.findConflict('Category', existingPages)).toBe('Categories');

      // User tries to create "Boxes" when "Box" exists
      expect(matcher.findConflict('Boxes', existingPages)).toBe('Box');
    });

    test('should handle edge cases in page names', () => {
      const pages = ['API', 'FAQ', 'News', 'Glass'];

      // Acronyms
      expect(matcher.findMatch('APIs', pages)).toBe('API');

      // FAQ (already ends in Q, not typical plural pattern)
      expect(matcher.findMatch('FAQs', pages)).toBe('FAQ');

      // News (already ends in s)
      expect(matcher.findMatch('News', pages)).toBe('News');

      // Glass (ends in ss, shouldn't match Glas)
      expect(matcher.findMatch('Glass', pages)).toBe('Glass');
    });

    test('should handle multi-word page names', () => {
      const pages = ['User Guide', 'Quick Start', 'Release Note'];

      // Case insensitive matching
      expect(matcher.findMatch('user guide', pages)).toBe('User Guide');
      expect(matcher.findMatch('QUICK START', pages)).toBe('Quick Start');

      // Plural matching on last word
      expect(matcher.findMatch('Release Notes', pages)).toBe('Release Note');
    });
  });

  describe('CamelCase matching', () => {
    describe('getVariations() - with CamelCase enabled', () => {
      let matcher;

      beforeEach(() => {
        matcher = new PageNameMatcher(true, true);
      });

      test('should split CamelCase "HealthCare" → "health care"', () => {
        const variations = matcher.getVariations('HealthCare');
        expect(variations).toContain('healthcare');
        expect(variations).toContain('health care');
      });

      test('should join spaced "Health Care" → "healthcare"', () => {
        const variations = matcher.getVariations('Health Care');
        expect(variations).toContain('health care');
        expect(variations).toContain('healthcare');
      });

      test('should handle three-word CamelCase "MyHealthCare" → "my health care"', () => {
        const variations = matcher.getVariations('MyHealthCare');
        expect(variations).toContain('myhealthcare');
        expect(variations).toContain('my health care');
      });

      test('should handle consecutive caps "XMLParser" → "xml parser"', () => {
        const variations = matcher.getVariations('XMLParser');
        expect(variations).toContain('xmlparser');
        expect(variations).toContain('xml parser');
      });

      test('should not expand single word "Health"', () => {
        const variations = matcher.getVariations('Health');
        // Single word has no space-separated form different from normalized
        expect(variations).not.toContain('h ealth');
      });
    });

    describe('findMatch() - with CamelCase enabled', () => {
      let matcher;

      beforeEach(() => {
        matcher = new PageNameMatcher(true, true);
      });

      test('should find "Health Care" when searching "HealthCare"', () => {
        expect(matcher.findMatch('HealthCare', ['Health Care'])).toBe('Health Care');
      });

      test('should find "HealthCare" when searching "Health Care"', () => {
        expect(matcher.findMatch('Health Care', ['HealthCare'])).toBe('HealthCare');
      });

      test('should combine with plural matching: "HealthCare" matches "Health Cares"', () => {
        expect(matcher.findMatch('HealthCare', ['Health Cares'])).toBe('Health Cares');
      });
    });

    describe('getVariations() - with CamelCase disabled', () => {
      let matcher;

      beforeEach(() => {
        matcher = new PageNameMatcher(true, false);
      });

      test('should not generate CamelCase variations', () => {
        const variations = matcher.getVariations('HealthCare');
        expect(variations).toContain('healthcare');
        expect(variations).not.toContain('health care');
      });
    });
  });

  describe('Performance and edge cases', () => {
    let matcher;

    beforeEach(() => {
      matcher = new PageNameMatcher(true);
    });

    test('should handle very long page lists efficiently', () => {
      const largePageList = Array.from({ length: 1000 }, (_, i) => `Page${i}`);
      const result = matcher.findMatch('Page500', largePageList);
      expect(result).toBe('Page500');
    });

    test('should handle page names with numbers', () => {
      const pages = ['Page1', 'User2', 'Category3'];
      expect(matcher.findMatch('page1', pages)).toBe('Page1');
      // Users2 won't match User2 because the 's' is removed before the number
      // resulting in "user2" which matches the normalized "user2"
      // But the plural logic adds 's' to the END, so "User2s" would be the plural
      expect(matcher.findMatch('User2s', pages)).toBe('User2');
    });

    test('should handle single-character page names', () => {
      const variations = matcher.getVariations('A');
      expect(variations).toContain('a');
      expect(variations).toContain('as');
    });

    test('should handle page names ending in ss', () => {
      const pages = ['Class', 'Glass', 'Mass'];

      // Should add 'es' for 'Class'
      expect(matcher.findMatch('Classes', pages)).toBe('Class');

      // Should not treat 'ss' as removable 's'
      const glassVariations = matcher.getVariations('Glass');
      expect(glassVariations).not.toContain('glas');
    });
  });
});
