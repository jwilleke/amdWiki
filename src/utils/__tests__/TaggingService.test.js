'use strict';

const { TaggingService } = require('../TaggingService');

describe('TaggingService', () => {
  const subjectVocab = [
    { term: 'geology',         label: 'Geology',         category: 'subject' },
    { term: 'medicine',        label: 'Medicine',        category: 'subject' },
    { term: 'oceanography',    label: 'Oceanography',    category: 'subject' },
    { term: 'political-science', label: 'Political Science', category: 'subject' },
    { term: 'meteorology',     label: 'Meteorology',     category: 'subject' }
  ];

  const workflowVocab = [
    { term: 'draft',     label: 'Draft',     category: 'workflow-status' },
    { term: 'review',    label: 'Review',    category: 'workflow-status' },
    { term: 'published', label: 'Published', category: 'workflow-status' }
  ];

  describe('initialization', () => {
    test('starts with empty vocabulary', () => {
      const svc = new TaggingService();
      expect(svc.vocabularySize).toBe(0);
    });

    test('tag() returns [] when vocabulary empty', () => {
      const svc = new TaggingService();
      expect(svc.tag('geology is the study of rocks')).toEqual([]);
    });
  });

  describe('setVocabulary()', () => {
    test('loads subject terms', () => {
      const svc = new TaggingService();
      svc.setVocabulary(subjectVocab);
      expect(svc.vocabularySize).toBe(subjectVocab.length);
    });

    test('excludes workflow-status terms by default', () => {
      const svc = new TaggingService();
      svc.setVocabulary([...subjectVocab, ...workflowVocab]);
      expect(svc.vocabularySize).toBe(subjectVocab.length);
    });

    test('includes terms with no category', () => {
      const svc = new TaggingService();
      svc.setVocabulary([
        { term: 'uncategorized', label: 'Uncategorized' }
      ]);
      expect(svc.vocabularySize).toBe(1);
    });

    test('replaces vocabulary on second call', () => {
      const svc = new TaggingService();
      svc.setVocabulary(subjectVocab);
      svc.setVocabulary([{ term: 'medicine', label: 'Medicine', category: 'subject' }]);
      expect(svc.vocabularySize).toBe(1);
    });

    test('custom allowedCategories includes workflow-status', () => {
      const svc = new TaggingService({ allowedCategories: ['workflow-status'] });
      svc.setVocabulary([...subjectVocab, ...workflowVocab]);
      expect(svc.vocabularySize).toBe(workflowVocab.length);
    });
  });

  describe('tag()', () => {
    let svc;

    beforeEach(() => {
      svc = new TaggingService();
      svc.setVocabulary(subjectVocab);
    });

    test('matches single-word term appearing in content', () => {
      const tags = svc.tag('This article covers geology and volcanic rock formations.');
      expect(tags).toContain('geology');
    });

    test('matches term appearing in title', () => {
      const tags = svc.tag('Igneous rock formations', 'Introduction to Geology');
      expect(tags).toContain('geology');
    });

    test('returns empty when no match', () => {
      const tags = svc.tag('The quick brown fox jumps over the lazy dog.');
      expect(tags).toEqual([]);
    });

    test('matches hyphenated term via token split', () => {
      // political-science → tokens: ['political', 'science']
      // threshold 0.5: need ≥ 1 of 2 tokens in content
      const tags = svc.tag('The political debate over climate policy is complex.');
      expect(tags).toContain('political-science');
    });

    test('does not duplicate existing tags', () => {
      const tags = svc.tag('geology study of rocks', '', ['geology']);
      expect(tags).not.toContain('geology');
    });

    test('returns highest-scoring terms first', () => {
      // Both geology and medicine appear, but geology appears more times
      const tags = svc.tag('geology rocks geology minerals geology formations medicine');
      expect(tags[0]).toBe('geology');
    });

    test('respects maxTags limit', () => {
      const svc2 = new TaggingService({ maxTags: 2 });
      svc2.setVocabulary(subjectVocab);
      const tags = svc2.tag('geology oceanography medicine meteorology political science');
      expect(tags.length).toBeLessThanOrEqual(2);
    });

    test('case-insensitive matching', () => {
      const tags = svc.tag('GEOLOGY and OCEANOGRAPHY are related earth sciences.');
      expect(tags).toContain('geology');
      expect(tags).toContain('oceanography');
    });

    test('matches term from label tokens too', () => {
      // 'medicine' label is 'Medicine' — the label tokens are also indexed
      const tags = svc.tag('medicine is the science of health and disease treatment.');
      expect(tags).toContain('medicine');
    });

    test('threshold controls sensitivity', () => {
      // With threshold 1.0 (exact all tokens required)
      // political-science needs BOTH 'political' and 'science'
      const strictSvc = new TaggingService({ threshold: 1.0 });
      strictSvc.setVocabulary([{ term: 'political-science', label: 'Political Science', category: 'subject' }]);

      // Only 'political' appears → score = 0.5 → below threshold 1.0 → no match
      const noMatch = strictSvc.tag('The political debate was intense.');
      expect(noMatch).not.toContain('political-science');

      // Both 'political' and 'science' → score = 1.0 → match
      const match = strictSvc.tag('The political science curriculum covers elections.');
      expect(match).toContain('political-science');
    });
  });
});
