/**
 * Showdown output extension that replaces Showdown's non-standard heading IDs
 * with GitHub-style slugs.
 *
 * Showdown's `ghHeaderIds: true` strips all non-alphanumeric characters, so
 * "Item Detail Page" → id="itemdetailpage" instead of id="item-detail-page".
 *
 * This extension fixes the IDs to match the GitHub algorithm:
 *   1. Lowercase
 *   2. Remove characters that are not letters, digits, spaces, or hyphens
 *   3. Replace whitespace runs with a single hyphen
 *   4. Trim leading/trailing hyphens
 *
 * This matches the `headingSlug()` function in SectionUtils.ts and ensures
 * same-page anchor links [Display|#slug] navigate correctly.
 */

import { headingSlug } from '../utils/SectionUtils';

interface ShowdownFilter {
  type: 'lang' | 'output';
  filter: (text: string) => string;
}

function showdownHeadingIds(): ShowdownFilter[] {
  return [
    {
      type: 'output',
      filter: (html: string): string =>
        html.replace(
          /<(h[1-6])\s+id="[^"]*">([\s\S]*?)<\/h[1-6]>/gi,
          (_match: string, tag: string, inner: string) => {
            // Strip any inline HTML tags to get the plain heading text for slugging
            const plainText = inner.replace(/<[^>]+>/g, '').trim();
            const id = headingSlug(plainText);
            return `<${tag} id="${id}">${inner}</${tag}>`;
          }
        )
    }
  ];
}

export default showdownHeadingIds;
