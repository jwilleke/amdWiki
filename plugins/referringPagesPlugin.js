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
function referringPagesPlugin(pageName, params, linkGraph) {
  // Parse parameters
  const opts = {};
  params.replace(/([a-zA-Z]+)=('([^']*)'|"([^"]*)"|([^\s]+))/g, (m, key, val, s1, s2, s3) => {
    opts[key] = s1 || s2 || s3;
  });
  
  // Defaults
  const max = opts.max ? parseInt(opts.max) : 10;
  
  // Find referring pages
  let referring = [];
  if (linkGraph && linkGraph[pageName]) {
    referring = linkGraph[pageName];
  }
  
  if (opts.show === 'count') {
    return String(referring.length);
  }
  
  // Limit and format
  referring = referring.slice(0, max);
  let links = referring.map(p => `<li><a class="wikipage" href="/wiki/${p}">${p}</a></li>`).join('');
  
  if (links) {
    links = `<ul>${links}</ul>`;
    // Remove any asterisk before <ul>
    links = links.replace(/\*\s*<ul>/, '<ul>');
    // Remove <p>...</p> wrapping if present and only keep <ul>...</ul>
    links = links.replace(/<p>.*?(<ul>.*<\/ul>).*?<\/p>/, '$1');
    // Remove all stray newlines after </ul>
    links = links.replace(/<\/ul>\s*$/g, '</ul>');
  }
  
  return links;
}

// Plugin initialization (JSPWiki-style)
function initialize(engine) {
  console.log(`Initializing ${pluginInfo.name} v${pluginInfo.version}`);
  // Any plugin-specific initialization can go here
}

// Export plugin with metadata
module.exports = referringPagesPlugin;
module.exports.name = pluginInfo.name;
module.exports.description = pluginInfo.description;
module.exports.author = pluginInfo.author;
module.exports.version = pluginInfo.version;
module.exports.initialize = initialize;
