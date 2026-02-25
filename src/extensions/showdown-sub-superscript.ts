/**
 * Showdown extension for subscript and superscript syntax.
 *
 * Subscript:  H~2~O  → H<sub>2</sub>O   (single tilde)
 * Superscript: X^2^  → X<sup>2</sup>    (single caret)
 *
 * The subscript regex uses negative lookahead/lookbehind to avoid
 * matching inside ~~strikethrough~~ (which uses double tildes).
 */

interface ShowdownFilter {
  type: 'lang' | 'output';
  filter: (text: string) => string;
}

function showdownSubSuperscript(): ShowdownFilter[] {
  return [
    {
      // Subscript: ~text~ → <sub>text</sub>
      // Negative lookahead/lookbehind prevents matching ~~double-tilde~~ strikethrough
      type: 'lang',
      filter: (text: string): string =>
        text.replace(/(?<!~)~(?!~)([^~\n]+?)(?<!~)~(?!~)/g, '<sub>$1</sub>')
    },
    {
      // Superscript: ^text^ → <sup>text</sup>
      type: 'lang',
      filter: (text: string): string =>
        text.replace(/\^([^^\n]+?)\^/g, '<sup>$1</sup>')
    }
  ];
}

export default showdownSubSuperscript;
