/**
 * EmojiAutocomplete — Inline emoji shortcode picker for the wiki editor (Issue #512)
 *
 * Triggers when the user types ':' followed by 2+ characters in the textarea.
 * Filters EMOJI_CLIENT_DATA locally (no API call) and shows a dropdown at the
 * cursor position using the same positioning logic as PageAutocomplete.
 *
 * Usage in edit.ejs:
 *   const emojiAutocomplete = new EmojiAutocomplete({ onSelect: fn });
 *   // wire into 'input' and 'keydown' listeners on the content textarea
 */

// Client-side emoji data — [shortcode, char, category]
// Shortcodes must match server-side EMOJI_MAP in src/parsers/data/emoji-map.ts
const EMOJI_CLIENT_DATA = [
  // Smileys
  ['smile',               '😄', 'smileys'],
  ['smiley',              '😃', 'smileys'],
  ['grinning',            '😀', 'smileys'],
  ['laughing',            '😆', 'smileys'],
  ['sweat_smile',         '😅', 'smileys'],
  ['joy',                 '😂', 'smileys'],
  ['rofl',                '🤣', 'smileys'],
  ['wink',                '😉', 'smileys'],
  ['blush',               '😊', 'smileys'],
  ['innocent',            '😇', 'smileys'],
  ['heart_eyes',          '😍', 'smileys'],
  ['kissing_heart',       '😘', 'smileys'],
  ['yum',                 '😋', 'smileys'],
  ['sunglasses',          '😎', 'smileys'],
  ['thinking',            '🤔', 'smileys'],
  ['smirk',               '😏', 'smileys'],
  ['unamused',            '😒', 'smileys'],
  ['roll_eyes',           '🙄', 'smileys'],
  ['grimacing',           '😬', 'smileys'],
  ['sleeping',            '😴', 'smileys'],
  ['mask',                '😷', 'smileys'],
  ['partying_face',       '🥳', 'smileys'],
  ['scream',              '😱', 'smileys'],
  ['cry',                 '😢', 'smileys'],
  ['sob',                 '😭', 'smileys'],
  ['angry',               '😠', 'smileys'],
  ['rage',                '😡', 'smileys'],
  ['skull',               '💀', 'smileys'],
  ['ghost',               '👻', 'smileys'],
  ['alien',               '👽', 'smileys'],
  ['robot',               '🤖', 'smileys'],
  ['clown_face',          '🤡', 'smileys'],
  // Gestures
  ['+1',                  '👍', 'gestures'],
  ['thumbsup',            '👍', 'gestures'],
  ['-1',                  '👎', 'gestures'],
  ['thumbsdown',          '👎', 'gestures'],
  ['clap',                '👏', 'gestures'],
  ['raised_hands',        '🙌', 'gestures'],
  ['pray',                '🙏', 'gestures'],
  ['handshake',           '🤝', 'gestures'],
  ['wave',                '👋', 'gestures'],
  ['raised_hand',         '✋', 'gestures'],
  ['ok_hand',             '👌', 'gestures'],
  ['v',                   '✌️', 'gestures'],
  ['crossed_fingers',     '🤞', 'gestures'],
  ['vulcan_salute',       '🖖', 'gestures'],
  ['muscle',              '💪', 'gestures'],
  ['fist',                '✊', 'gestures'],
  ['eyes',                '👀', 'gestures'],
  ['brain',               '🧠', 'gestures'],
  // Objects & symbols
  ['heart',               '❤️', 'objects'],
  ['orange_heart',        '🧡', 'objects'],
  ['yellow_heart',        '💛', 'objects'],
  ['green_heart',         '💚', 'objects'],
  ['blue_heart',          '💙', 'objects'],
  ['purple_heart',        '💜', 'objects'],
  ['broken_heart',        '💔', 'objects'],
  ['sparkling_heart',     '💖', 'objects'],
  ['star',                '⭐', 'objects'],
  ['star2',               '🌟', 'objects'],
  ['sparkles',            '✨', 'objects'],
  ['zap',                 '⚡', 'objects'],
  ['fire',                '🔥', 'objects'],
  ['tada',                '🎉', 'objects'],
  ['balloon',             '🎈', 'objects'],
  ['trophy',              '🏆', 'objects'],
  ['medal',               '🥇', 'objects'],
  ['rocket',              '🚀', 'objects'],
  ['100',                 '💯', 'objects'],
  ['white_check_mark',    '✅', 'objects'],
  ['x',                   '❌', 'objects'],
  ['warning',             '⚠️', 'objects'],
  ['bulb',                '💡', 'objects'],
  ['wrench',              '🔧', 'objects'],
  ['pencil',              '✏️', 'objects'],
  ['book',                '📖', 'objects'],
  ['memo',                '📝', 'objects'],
  ['link',                '🔗', 'objects'],
  ['bell',                '🔔', 'objects'],
  ['lock',                '🔒', 'objects'],
  ['mag',                 '🔍', 'objects'],
  ['computer',            '💻', 'objects'],
  ['calendar',            '📅', 'objects'],
  ['camera',              '📷', 'objects'],
  ['art',                 '🎨', 'objects'],
  ['music',               '🎵', 'objects'],
  ['pizza',               '🍕', 'objects'],
  ['coffee',              '☕', 'objects'],
  // Nature
  ['sunny',               '☀️', 'nature'],
  ['cloud',               '☁️', 'nature'],
  ['rainbow',             '🌈', 'nature'],
  ['snowflake',           '❄️', 'nature'],
  ['rose',                '🌹', 'nature'],
  ['sunflower',           '🌻', 'nature'],
  ['dog',                 '🐶', 'nature'],
  ['cat',                 '🐱', 'nature'],
  ['rabbit',              '🐰', 'nature'],
  ['bear',                '🐻', 'nature'],
  ['panda_face',          '🐼', 'nature'],
  ['penguin',             '🐧', 'nature'],
  ['unicorn',             '🦄', 'nature'],
  ['dragon',              '🐉', 'nature'],
  ['butterfly',           '🦋', 'nature'],
  ['bee',                 '🐝', 'nature'],
  ['bug',                 '🐛', 'nature'],
];

class EmojiAutocomplete {
  constructor(options = {}) {
    this.minChars = options.minChars || 2;
    this.maxSuggestions = options.maxSuggestions || 12;
    this.dropdown = null;
    this.suggestions = [];
    this.selectedIndex = -1;
    this.onSelect = options.onSelect || (() => {});
  }

  /**
   * Filter EMOJI_CLIENT_DATA by query string against shortcode name.
   * Returns objects with { name, char, category }.
   */
  getSuggestions(query) {
    if (!query || query.length < this.minChars) return [];
    const q = query.toLowerCase();
    return EMOJI_CLIENT_DATA
      .filter(([name]) => name.includes(q))
      .slice(0, this.maxSuggestions)
      .map(([name, char, category]) => ({ name, char, category }));
  }

  /**
   * Show the autocomplete dropdown positioned at the cursor.
   * Mirrors PageAutocomplete.showDropdown() — same CSS variables for dark mode.
   */
  showDropdown(textarea, suggestions, cursorPos) {
    this.hideDropdown();
    if (!suggestions || suggestions.length === 0) return;

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'emoji-autocomplete-dropdown';
    this.dropdown.style.cssText = `
      position: absolute;
      background: var(--bs-body-bg, white);
      color: var(--bs-body-color, #000);
      border: 1px solid var(--bs-border-color, #ccc);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-height: 260px;
      overflow-y: auto;
      z-index: 10000;
      min-width: 220px;
    `;

    // Position near cursor using same approach as PageAutocomplete
    if (cursorPos !== null) {
      const coords = this.getCaretCoordinates(textarea, cursorPos);
      const rect = textarea.getBoundingClientRect();
      this.dropdown.style.top = `${rect.top + coords.top + coords.height + window.scrollY}px`;
      this.dropdown.style.left = `${rect.left + coords.left + window.scrollX}px`;
    } else {
      const rect = textarea.getBoundingClientRect();
      this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
      this.dropdown.style.left = `${rect.left + window.scrollX}px`;
    }

    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'emoji-autocomplete-item';
      item.dataset.index = index;
      item.style.cssText = 'padding: 6px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 8px;';

      item.innerHTML = `<span style="font-size:1.4rem;">${suggestion.char}</span>`
                     + `<span><code style="font-size:0.85em;">:${suggestion.name}:</code></span>`;

      item.addEventListener('mouseenter', () => this.selectItem(index));
      item.addEventListener('click', () => this.selectSuggestion(suggestion));

      this.dropdown.appendChild(item);
    });

    document.body.appendChild(this.dropdown);
    this.suggestions = suggestions;
    this.selectedIndex = -1;
  }

  hideDropdown() {
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }
    this.dropdown = null;
    this.suggestions = [];
    this.selectedIndex = -1;
  }

  selectItem(index) {
    if (!this.dropdown) return;
    const items = this.dropdown.querySelectorAll('.emoji-autocomplete-item');
    items.forEach(item => { item.style.backgroundColor = ''; });
    if (index >= 0 && index < items.length) {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      items[index].style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : '#e6f2ff';
      this.selectedIndex = index;
    }
  }

  handleKeydown(event) {
    if (!this.dropdown || this.suggestions.length === 0) return false;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectItem((this.selectedIndex + 1) % this.suggestions.length);
        return true;
      case 'ArrowUp': {
        event.preventDefault();
        const newIndex = this.selectedIndex - 1;
        this.selectItem(newIndex < 0 ? this.suggestions.length - 1 : newIndex);
        return true;
      }
      case 'Enter':
        if (this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
          event.preventDefault();
          this.selectSuggestion(this.suggestions[this.selectedIndex]);
          return true;
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.hideDropdown();
        return true;
    }
    return false;
  }

  selectSuggestion(suggestion) {
    this.hideDropdown();
    this.onSelect(suggestion);
  }

  /**
   * Filter and display suggestions for the given query.
   * Synchronous (no debounce needed — local data is instant).
   */
  search(query, textarea, cursorPos) {
    const suggestions = this.getSuggestions(query);
    if (suggestions.length > 0) {
      this.showDropdown(textarea, suggestions, cursorPos);
    } else {
      this.hideDropdown();
    }
  }

  /**
   * Get caret pixel coordinates within a textarea.
   * Copied from PageAutocomplete for consistent positioning.
   */
  getCaretCoordinates(textarea, position) {
    const div = document.createElement('div');
    const computed = window.getComputedStyle(textarea);
    const properties = [
      'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight',
      'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration',
      'letterSpacing', 'wordSpacing', 'tabSize', 'whiteSpace', 'wordBreak', 'wordWrap'
    ];
    properties.forEach(prop => { div.style[prop] = computed[prop]; });
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    document.body.appendChild(div);

    div.textContent = textarea.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = textarea.value.substring(position) || '.';
    div.appendChild(span);

    const coordinates = {
      top: span.offsetTop,
      left: span.offsetLeft,
      height: parseInt(computed.lineHeight)
    };
    document.body.removeChild(div);
    return coordinates;
  }

  destroy() {
    this.hideDropdown();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EmojiAutocomplete, EMOJI_CLIENT_DATA };
}
