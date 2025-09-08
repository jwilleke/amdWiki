/**
 * User Preferences Manager
 * Handles applying user preferences to UI elements
 */
class UserPreferences {
  constructor(preferences = {}) {
    this.preferences = preferences;
  }

  /**
   * Apply editor preferences to a textarea or editor element
   * @param {HTMLElement} editor - The editor element
   */
  applyEditorPreferences(editor) {
    if (!editor) return;

    // Apply smart pairs if enabled
    if (this.get('editor.plain.smartpairs')) {
      this.enableSmartPairs(editor);
    }

    // Apply auto-indent if enabled
    if (this.get('editor.autoindent')) {
      this.enableAutoIndent(editor);
    }

    // Apply line numbers if enabled
    if (this.get('editor.linenumbers')) {
      this.enableLineNumbers(editor);
    }

    // Apply theme
    const theme = this.get('editor.theme', 'default');
    this.applyEditorTheme(editor, theme);
  }

  /**
   * Enable smart typing pairs for an editor
   * @param {HTMLElement} editor - The editor element
   */
  enableSmartPairs(editor) {
    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>',
      '"': '"',
      "'": "'"
    };

    editor.addEventListener('keydown', (e) => {
      const char = e.key;
      const pos = editor.selectionStart;
      const value = editor.value;
      
      if (pairs[char]) {
        e.preventDefault();
        const before = value.substring(0, pos);
        const after = value.substring(editor.selectionEnd);
        const closing = pairs[char];
        
        editor.value = before + char + closing + after;
        editor.setSelectionRange(pos + 1, pos + 1);
      }
      
      // Handle closing pairs - skip if next character is the closing pair
      else if (Object.values(pairs).includes(char)) {
        const nextChar = value.charAt(pos);
        if (nextChar === char) {
          e.preventDefault();
          editor.setSelectionRange(pos + 1, pos + 1);
        }
      }
      
      // Handle backspace - remove matching pair
      else if (e.key === 'Backspace') {
        const prevChar = value.charAt(pos - 1);
        const nextChar = value.charAt(pos);
        
        if (pairs[prevChar] === nextChar) {
          e.preventDefault();
          const before = value.substring(0, pos - 1);
          const after = value.substring(pos + 1);
          editor.value = before + after;
          editor.setSelectionRange(pos - 1, pos - 1);
        }
      }
    });
  }

  /**
   * Enable auto-indent for an editor
   * @param {HTMLElement} editor - The editor element
   */
  enableAutoIndent(editor) {
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const pos = editor.selectionStart;
        const value = editor.value;
        const lines = value.substring(0, pos).split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Count leading whitespace
        const indent = currentLine.match(/^(\s*)/)[1];
        
        setTimeout(() => {
          const newPos = editor.selectionStart;
          const newValue = editor.value;
          const before = newValue.substring(0, newPos);
          const after = newValue.substring(newPos);
          
          editor.value = before + indent + after;
          editor.setSelectionRange(newPos + indent.length, newPos + indent.length);
        }, 0);
      }
    });
  }

  /**
   * Enable line numbers for an editor
   * @param {HTMLElement} editor - The editor element
   */
  enableLineNumbers(editor) {
    // Create line numbers container
    const container = document.createElement('div');
    container.className = 'editor-with-line-numbers';
    container.style.cssText = 'display: flex; border: 1px solid #ccc; border-radius: 4px;';
    
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lineNumbers.style.cssText = `
      background: #f8f9fa;
      color: #6c757d;
      padding: 8px 4px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.5;
      text-align: right;
      border-right: 1px solid #dee2e6;
      user-select: none;
      min-width: 30px;
    `;
    
    // Wrap editor
    editor.parentNode.insertBefore(container, editor);
    container.appendChild(lineNumbers);
    container.appendChild(editor);
    
    editor.style.border = 'none';
    editor.style.outline = 'none';
    editor.style.resize = 'vertical';
    
    // Update line numbers
    const updateLineNumbers = () => {
      const lines = editor.value.split('\n').length;
      lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
    };
    
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', () => {
      lineNumbers.scrollTop = editor.scrollTop;
    });
    
    updateLineNumbers();
  }

  /**
   * Apply editor theme
   * @param {HTMLElement} editor - The editor element
   * @param {string} theme - Theme name
   */
  applyEditorTheme(editor, theme) {
    const themes = {
      default: {
        background: '#ffffff',
        color: '#212529',
        border: '#ced4da'
      },
      dark: {
        background: '#2d3748',
        color: '#e2e8f0',
        border: '#4a5568'
      },
      monokai: {
        background: '#272822',
        color: '#f8f8f2',
        border: '#3e3d32'
      },
      solarized: {
        background: '#fdf6e3',
        color: '#657b83',
        border: '#eee8d5'
      }
    };

    const themeStyles = themes[theme] || themes.default;
    Object.assign(editor.style, themeStyles);
  }

  /**
   * Get a preference value
   * @param {string} key - Preference key
   * @param {any} defaultValue - Default value if not set
   * @returns {any} Preference value
   */
  get(key, defaultValue = false) {
    return this.preferences[key] !== undefined ? this.preferences[key] : defaultValue;
  }

  /**
   * Set a preference value
   * @param {string} key - Preference key
   * @param {any} value - Preference value
   */
  set(key, value) {
    this.preferences[key] = value;
  }

  /**
   * Apply display preferences to the page
   */
  applyDisplayPreferences() {
    // Apply tooltips setting
    if (this.get('display.tooltips')) {
      this.enableTooltips();
    }

    // Apply reader mode default
    if (this.get('display.readermode') && window.location.pathname.includes('/view/')) {
      window.location.search += (window.location.search ? '&' : '?') + 'view=reader';
    }
  }

  /**
   * Enable Bootstrap tooltips
   */
  enableTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserPreferences;
}

// Make available globally
window.UserPreferences = UserPreferences;
