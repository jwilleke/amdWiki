/**
 * Page Autocomplete Module
 *
 * Provides autocomplete functionality for page links
 * - In editor: when typing [page name]
 * - In search dialogs: when searching for pages
 *
 * Related: GitHub Issue #90 - TypeDown for Internal Page Links
 */

class PageAutocomplete {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/page-suggestions';
    this.minChars = options.minChars || 2;
    this.maxSuggestions = options.maxSuggestions || 10;
    this.debounceMs = options.debounceMs || 200;

    this.currentQuery = '';
    this.debounceTimer = null;
    this.suggestions = [];
    this.selectedIndex = -1;
    this.dropdown = null;
    this.onSelect = options.onSelect || ((suggestion) => {});
  }

  /**
   * Fetch suggestions from the API
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of suggestions
   */
  async fetchSuggestions(query) {
    if (!query || query.length < this.minChars) {
      return [];
    }

    try {
      const url = `${this.apiEndpoint}?q=${encodeURIComponent(query)}&limit=${this.maxSuggestions}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Failed to fetch suggestions:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  /**
   * Show autocomplete dropdown
   * @param {HTMLElement} inputElement - The input element to attach dropdown to
   * @param {Array} suggestions - Array of suggestions
   */
  showDropdown(inputElement, suggestions) {
    // Remove existing dropdown
    this.hideDropdown();

    if (!suggestions || suggestions.length === 0) {
      return;
    }

    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'page-autocomplete-dropdown';
    this.dropdown.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-height: 300px;
      overflow-y: auto;
      z-index: 10000;
      min-width: 250px;
    `;

    // Position dropdown
    const rect = inputElement.getBoundingClientRect();
    this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    this.dropdown.style.left = `${rect.left + window.scrollX}px`;

    // Create suggestion items
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'page-autocomplete-item';
      item.dataset.index = index;
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
      `;

      // Highlight query in suggestion
      const titleHtml = this.highlightQuery(suggestion.title, this.currentQuery);

      item.innerHTML = `
        <div style="font-weight: 500;">${titleHtml}</div>
        <div style="font-size: 0.85em; color: #666;">${suggestion.category}</div>
      `;

      // Hover effect
      item.addEventListener('mouseenter', () => {
        this.selectItem(index);
      });

      // Click handler
      item.addEventListener('click', () => {
        this.selectSuggestion(suggestion);
      });

      this.dropdown.appendChild(item);
    });

    document.body.appendChild(this.dropdown);
    this.suggestions = suggestions;
    this.selectedIndex = -1;
  }

  /**
   * Hide autocomplete dropdown
   */
  hideDropdown() {
    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }
    this.dropdown = null;
    this.suggestions = [];
    this.selectedIndex = -1;
  }

  /**
   * Highlight query text in suggestion
   * @param {string} text - Text to highlight in
   * @param {string} query - Query to highlight
   * @returns {string} HTML with highlighted text
   */
  highlightQuery(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  /**
   * Select an item in the dropdown
   * @param {number} index - Index of item to select
   */
  selectItem(index) {
    if (!this.dropdown) return;

    // Remove previous selection
    const items = this.dropdown.querySelectorAll('.page-autocomplete-item');
    items.forEach(item => {
      item.style.backgroundColor = '';
    });

    // Select new item
    if (index >= 0 && index < items.length) {
      items[index].style.backgroundColor = '#e6f2ff';
      this.selectedIndex = index;
    }
  }

  /**
   * Select a suggestion
   * @param {Object} suggestion - The selected suggestion
   */
  selectSuggestion(suggestion) {
    this.hideDropdown();
    this.onSelect(suggestion);
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {boolean} True if event was handled
   */
  handleKeydown(event) {
    if (!this.dropdown || this.suggestions.length === 0) {
      return false;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectItem((this.selectedIndex + 1) % this.suggestions.length);
        return true;

      case 'ArrowUp':
        event.preventDefault();
        const newIndex = this.selectedIndex - 1;
        this.selectItem(newIndex < 0 ? this.suggestions.length - 1 : newIndex);
        return true;

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

  /**
   * Search for suggestions with debouncing
   * @param {string} query - Search query
   * @param {HTMLElement} inputElement - Input element to show dropdown for
   */
  search(query, inputElement) {
    this.currentQuery = query;

    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce the search
    this.debounceTimer = setTimeout(async () => {
      const suggestions = await this.fetchSuggestions(query);
      this.showDropdown(inputElement, suggestions);
    }, this.debounceMs);
  }

  /**
   * Destroy the autocomplete instance
   */
  destroy() {
    this.hideDropdown();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PageAutocomplete;
}
