'use strict';

const { extractSection, spliceSection, getSectionCount, headingSlug } = require('../SectionUtils');

const SIMPLE = `---
title: Test Page
---

# Introduction
Intro content.

## Background
Background content.

# Methods
Methods content.

## Sub-method
Sub content.

# Conclusion
Final content.
`;

const NO_FRONTMATTER = `# Alpha
Alpha content.

## Beta
Beta content.

# Gamma
Gamma content.
`;

const CODE_BLOCK = `# Real Heading
Some text.

\`\`\`
# Not a heading
\`\`\`

## Real Sub-heading
More text.
`;

describe('SectionUtils — getSectionCount', () => {
  test('counts ATX headings, skipping frontmatter', () => {
    expect(getSectionCount(SIMPLE)).toBe(5); // H1, H2, H1, H2, H1
  });

  test('counts headings when there is no frontmatter', () => {
    expect(getSectionCount(NO_FRONTMATTER)).toBe(3); // H1, H2, H1
  });

  test('ignores headings inside fenced code blocks', () => {
    expect(getSectionCount(CODE_BLOCK)).toBe(2); // # Real Heading + ## Real Sub-heading
  });

  test('returns 0 for empty content', () => {
    expect(getSectionCount('')).toBe(0);
    expect(getSectionCount('Just text, no headings.')).toBe(0);
  });
});

describe('SectionUtils — extractSection', () => {
  test('extracts first top-level section including its sub-headings', () => {
    const result = extractSection(SIMPLE, 0); // # Introduction (level 1)
    expect(result).toContain('# Introduction');
    expect(result).toContain('Intro content.');
    // ## Background is a sub-section of # Introduction, so it IS included
    expect(result).toContain('## Background');
    expect(result).toContain('Background content.');
    // # Methods is at same level — NOT included
    expect(result).not.toContain('# Methods');
  });

  test('extracts a sub-section (H2) which ends at next same-or-higher heading', () => {
    const result = extractSection(SIMPLE, 1); // ## Background (level 2)
    expect(result).toContain('## Background');
    expect(result).toContain('Background content.');
    // # Methods has level 1 ≤ 2, so it ends the section
    expect(result).not.toContain('# Methods');
  });

  test('extracts section that runs to end of file', () => {
    const result = extractSection(SIMPLE, 4); // # Conclusion
    expect(result).toContain('# Conclusion');
    expect(result).toContain('Final content.');
  });

  test('returns null for out-of-range index', () => {
    expect(extractSection(SIMPLE, -1)).toBeNull();
    expect(extractSection(SIMPLE, 99)).toBeNull();
  });

  test('works without frontmatter', () => {
    // NO_FRONTMATTER: # Alpha (level 1), ## Beta (level 2, sub of Alpha), # Gamma (level 1)
    // Section 0 = # Alpha + ## Beta (everything before # Gamma)
    const result = extractSection(NO_FRONTMATTER, 0); // # Alpha
    expect(result).toContain('# Alpha');
    expect(result).toContain('Alpha content.');
    expect(result).toContain('## Beta'); // sub-section included
    expect(result).not.toContain('# Gamma'); // next top-level heading excluded
  });

  test('does not treat headings inside code blocks as section boundaries', () => {
    // CODE_BLOCK has 2 real sections: # Real Heading (level 1) and ## Real Sub-heading (level 2).
    // The "# Not a heading" inside the fence is ignored by findHeadings.
    // Section 0 (# Real Heading, level 1) has no later level-1 heading, so it runs to end of file.
    expect(getSectionCount(CODE_BLOCK)).toBe(2);
    const result = extractSection(CODE_BLOCK, 0); // # Real Heading — runs to EOF
    expect(result).toContain('# Real Heading');
    expect(result).toContain('# Not a heading'); // raw text inside code fence, part of section
    // ## Real Sub-heading is a sub-section of # Real Heading (level 2 > 1), included
    expect(result).toContain('## Real Sub-heading');
  });
});

describe('SectionUtils — spliceSection', () => {
  test('replaces a section (including its sub-headings) and preserves frontmatter and other sections', () => {
    // Section 0 = # Introduction + ## Background (everything before # Methods)
    const newContent = '# Introduction\nUpdated intro.';
    const result = spliceSection(SIMPLE, 0, newContent);

    expect(result).toContain('title: Test Page'); // frontmatter preserved
    expect(result).toContain('# Introduction\nUpdated intro.');
    expect(result).not.toContain('Intro content.'); // old content gone
    // ## Background was part of section 0 — gone after replacement
    expect(result).not.toContain('## Background');
    // Later top-level sections are intact
    expect(result).toContain('# Methods');
    expect(result).toContain('# Conclusion');
  });

  test('replaces a middle section', () => {
    const result = spliceSection(SIMPLE, 2, '# Methods\nNew methods.');
    expect(result).toContain('# Introduction'); // earlier section intact
    expect(result).toContain('# Methods\nNew methods.');
    expect(result).not.toContain('Methods content.');
    expect(result).toContain('# Conclusion'); // later section intact
  });

  test('replaces last section', () => {
    const result = spliceSection(SIMPLE, 4, '# Conclusion\nThe end.');
    expect(result).toContain('# Conclusion\nThe end.');
    expect(result).not.toContain('Final content.');
    expect(result).toContain('# Introduction'); // earlier intact
  });

  test('returns original if index out of range', () => {
    expect(spliceSection(SIMPLE, 99, 'new')).toBe(SIMPLE);
    expect(spliceSection(SIMPLE, -1, 'new')).toBe(SIMPLE);
  });

  test('round-trips: extract then splice restores original', () => {
    const original = NO_FRONTMATTER;
    for (let i = 0; i < getSectionCount(original); i++) {
      const extracted = extractSection(original, i);
      const spliced = spliceSection(original, i, extracted);
      // Content should be semantically identical (modulo trailing whitespace)
      expect(spliced.trim()).toBe(original.trim());
    }
  });
});

// ---------------------------------------------------------------------------
// headingSlug
// ---------------------------------------------------------------------------

describe('headingSlug()', () => {
  test('lowercase and hyphenates spaces', () => {
    expect(headingSlug('Hello World')).toBe('hello-world');
  });

  test('removes parentheses and special chars', () => {
    expect(headingSlug('PLA (Polylactic Acid)')).toBe('pla-polylactic-acid');
  });

  test('handles digits', () => {
    expect(headingSlug('3D Printing Filaments')).toBe('3d-printing-filaments');
  });

  test('collapses multiple spaces/hyphens', () => {
    expect(headingSlug('Hello   World')).toBe('hello-world');
  });

  test('empty string returns empty string', () => {
    expect(headingSlug('')).toBe('');
  });

  test('only special chars returns empty string', () => {
    expect(headingSlug('(!) @#$')).toBe('');
  });

  test('preserves existing hyphens', () => {
    expect(headingSlug('Step-by-Step Guide')).toBe('step-by-step-guide');
  });
});
