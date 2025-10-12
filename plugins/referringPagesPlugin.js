/**
 * ReferringPagesPlugin - JSPWiki-style plugin for amdWiki
 * Generates HTML for referring pages macro
 */

// Plugin metadata
const pluginInfo = {
  name: 'ReferringPagesPlugin',
  description: 'Lists pages that refer to the current page',
  author: 'amdWiki',
  version: '1.0.0'
};

// Plugin implementation
function ReferringPagesPlugin(pageName, params, linkGraph) {
  // Parse parameters (params is already an object from PluginManager)
  const opts = params || {};

  // Use page parameter if provided, otherwise use pageName
  const targetPage = opts.page || pageName;

  // Defaults
  const max = opts.max ? parseInt(opts.max) : 10;
  const before = opts.before || '';
  const after = opts.after || '';

  // Find referring pages
  let referring = [];
  if (linkGraph && linkGraph[targetPage]) {
    referring = linkGraph[targetPage];
  }

  // Debug: console.log(`[ReferringPagesPlugin] pageName=${pageName} targetPage=${targetPage} referring=${referring.length} linkGraph keys=${linkGraph ? Object.keys(linkGraph).length : 0}`);

  if (opts.show === 'count') {
    return String(referring.length);
  }

  // If no referring pages, show an informative message (JSPWiki-compatible behavior)
  if (referring.length === 0) {
    return '<p><em>No pages currently refer to this page.</em></p>';
  }

  // Limit and format
  referring = referring.slice(0, max);

  // If before/after are provided, format each link with those markers
  if (before || after) {
    // Convert escaped sequences
    let processedBefore = before.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    let processedAfter = after.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    // Check for list markers BEFORE escaping
    const isList = processedBefore.includes('*') || processedBefore.includes('-');

    // If before contains * or -, create a proper HTML list
    if (isList) {
      const linksList = referring.map(p =>
        `<li><a class="wikipage" href="/wiki/${encodeURIComponent(p)}">${p}</a></li>`
      ).join('');
      return `<ul>${linksList}</ul>`;
    }

    // Otherwise, use custom before/after markers
    // Escape special markdown characters to prevent markdown processing
    processedBefore = processedBefore.replace(/\*/g, '&#42; ');
    processedAfter = processedAfter.replace(/\*/g, '&#42; ');

    // Create links with before/after markers
    const linksList = referring.map(p =>
      `${processedBefore}<a class="wikipage" href="/wiki/${encodeURIComponent(p)}">${p}</a>${processedAfter}`
    ).join('');

    // Convert newlines to <br> tags for HTML rendering
    return linksList.replace(/\n/g, '<br>');
  }

  // Default: wrap in <ul><li> list
  const linksList = referring.map(p =>
    `<li><a class="wikipage" href="/wiki/${encodeURIComponent(p)}">${p}</a></li>`
  ).join('');

  return `<ul>${linksList}</ul>`;
}

// Plugin initialization (JSPWiki-style)
function initialize(engine) {
  console.log(`Initializing ${pluginInfo.name} v${pluginInfo.version}`);
  // Any plugin-specific initialization can go here
}

// Export plugin with metadata
module.exports = ReferringPagesPlugin;
module.exports.name = 'ReferringPagesPlugin';
module.exports.description = 'Lists pages that refer to the current page';
module.exports.author = 'amdWiki';
module.exports.version = '1.0.0';
module.exports.initialize = initialize;
