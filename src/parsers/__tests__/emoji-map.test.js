/**
 * emoji-map unit tests (Issue #512)
 */
const { EMOJI_MAP, EMOJI_SHORTCODE_REGEX, convertEmojiShortcodes } = require('../data/emoji-map');

describe('EMOJI_MAP', () => {
  test('is a non-empty object', () => {
    expect(typeof EMOJI_MAP).toBe('object');
    expect(Object.keys(EMOJI_MAP).length).toBeGreaterThan(50);
  });

  test('all values are non-empty strings', () => {
    for (const [key, val] of Object.entries(EMOJI_MAP)) {
      expect(typeof val).toBe('string');
      expect(val.length).toBeGreaterThan(0);
      expect(typeof key).toBe('string');
    }
  });

  test('contains key standard shortcodes', () => {
    expect(EMOJI_MAP['smile']).toBe('😄');
    expect(EMOJI_MAP['heart']).toBe('❤️');
    expect(EMOJI_MAP['rocket']).toBe('🚀');
    expect(EMOJI_MAP['+1']).toBe('👍');
    expect(EMOJI_MAP['-1']).toBe('👎');
    expect(EMOJI_MAP['tada']).toBe('🎉');
  });
});

describe('EMOJI_SHORTCODE_REGEX', () => {
  test('matches :word: pattern', () => {
    EMOJI_SHORTCODE_REGEX.lastIndex = 0;
    expect(EMOJI_SHORTCODE_REGEX.test(':smile:')).toBe(true);
  });

  test('matches :+1: and :-1:', () => {
    expect(':+1:'.match(/:([a-z0-9_+-]+):/)).toBeTruthy();
    expect(':-1:'.match(/:([a-z0-9_+-]+):/)).toBeTruthy();
  });

  test('does not match partial patterns', () => {
    expect(':smile'.match(/:([a-z0-9_+-]+):/)).toBeNull();
    expect('smile:'.match(/:([a-z0-9_+-]+):/)).toBeNull();
  });
});

describe('convertEmojiShortcodes', () => {
  test('converts a known shortcode', () => {
    expect(convertEmojiShortcodes(':smile:')).toBe('😄');
  });

  test('converts multiple shortcodes in one string', () => {
    const result = convertEmojiShortcodes('I :heart: this :rocket:');
    expect(result).toBe('I ❤️ this 🚀');
  });

  test('leaves unknown shortcodes unchanged', () => {
    expect(convertEmojiShortcodes(':nope:')).toBe(':nope:');
  });

  test('empty string input returns empty string', () => {
    expect(convertEmojiShortcodes('')).toBe('');
  });

  test('string with no shortcodes is returned unchanged', () => {
    const text = 'Hello world, no emoji here.';
    expect(convertEmojiShortcodes(text)).toBe(text);
  });

  test(':+1: and :-1: convert correctly', () => {
    expect(convertEmojiShortcodes(':+1:')).toBe('👍');
    expect(convertEmojiShortcodes(':-1:')).toBe('👎');
  });

  test('partial colon patterns are not converted', () => {
    expect(convertEmojiShortcodes(':smile')).toBe(':smile');
    expect(convertEmojiShortcodes('smile:')).toBe('smile:');
  });

  test('mixed known and unknown shortcodes', () => {
    const result = convertEmojiShortcodes(':tada: :unknown: :fire:');
    expect(result).toBe('🎉 :unknown: 🔥');
  });
});
