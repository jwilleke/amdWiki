/**
 * IndexPlugin - JSPWiki-style plugin for amdWiki
 * Generates an alphabetical index of all wiki pages
 *
 * Based on JSPWiki's IndexPlugin:
 * https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/plugin/IndexPlugin.java
 */

/**
 * IndexPlugin implementation (new-style with .execute method)
 */
const IndexPlugin = {
  name: 'IndexPlugin',
  description: 'Generates an alphabetical index of all wiki pages',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context containing engine reference
   * @param {Object} params - Plugin parameters
   * @returns {Promise<string>} HTML output
   */
  async execute(context, params) {
    const opts = params || {};

    try {
      // Get PageManager from engine
      const pageManager = context?.engine?.getManager?.('PageManager');
      if (!pageManager) {
        return '<p class="error">PageManager not available</p>';
      }

    // Get all page names
    const allPageNames = await pageManager.getAllPages();

    // Filter pages based on include/exclude patterns
    let filteredPages = allPageNames;

    // Apply include filter (regex)
    if (opts.include) {
      try {
        const includeRegex = new RegExp(opts.include);
        filteredPages = filteredPages.filter(name => includeRegex.test(name));
      } catch (e) {
        return `<p class="error">Invalid include pattern: ${opts.include}</p>`;
      }
    }

    // Apply exclude filter (regex)
    if (opts.exclude) {
      try {
        const excludeRegex = new RegExp(opts.exclude);
        filteredPages = filteredPages.filter(name => !excludeRegex.test(name));
      } catch (e) {
        return `<p class="error">Invalid exclude pattern: ${opts.exclude}</p>`;
      }
    }

    // Sort pages alphabetically (case-insensitive)
    filteredPages.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Group pages by first letter
    const groupedPages = {};
    for (const page of filteredPages) {
      const firstLetter = page.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#'; // Use '#' for non-letters

      if (!groupedPages[key]) {
        groupedPages[key] = [];
      }
      groupedPages[key].push(page);
    }

    // Generate HTML output
    let html = '<div class="index-plugin">\n';

    // Add jump links to sections
    const sections = Object.keys(groupedPages).sort();
    if (sections.length > 1) {
      html += '<div class="index-sections">\n';
      html += '<strong>Jump to:</strong> ';
      html += sections.map(letter =>
        `<a href="#index-${letter}">${letter}</a>`
      ).join(' | ');
      html += '\n</div>\n\n';
    }

    // Generate index content grouped by letter
    for (const letter of sections) {
      html += `<div class="index-section" id="index-${letter}">\n`;
      html += `<h3>${letter}</h3>\n`;
      html += '<ul>\n';

      for (const page of groupedPages[letter]) {
        html += `  <li><a class="wikipage" href="/wiki/${encodeURIComponent(page)}">${escapeHtml(page)}</a></li>\n`;
      }

      html += '</ul>\n';
      html += '</div>\n\n';
    }

    html += '</div>';

    return html;

  } catch (error) {
    console.error('[IndexPlugin] Error:', error);
    return `<p class="error">Error generating index: ${error.message}</p>`;
  }
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * @param {Object} engine - Wiki engine instance
   */
  initialize(engine) {
    console.log(`Initializing ${this.name} v${this.version}`);
  }
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Export plugin
module.exports = IndexPlugin;
