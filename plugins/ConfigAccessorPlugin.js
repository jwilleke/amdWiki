/**
 * ConfigAccessorPlugin - JSPWiki-style plugin for amdWiki
 * Displays configuration values including roles, features, and system settings
 *
 * Usage:
 *   [{ConfigAccessor key='amdwiki.server.port'}]                                - Display single config value (formatted)
 *   [{ConfigAccessor key='amdwiki.server.*'}]                                   - Display matching config values with wildcard (formatted)
 *   [{ConfigAccessor key='amdwiki.server.port' valueonly='true'}]               - Return only the value (inline, ends with newline)
 *   [{ConfigAccessor key='amdwiki.server.port' valueonly='true' after=''}]      - Return only the value (inline, no newline)
 *   [{ConfigAccessor key='amdwiki.server.*' valueonly='true'}]                  - Return matching values, one per line
 *   [{ConfigAccessor key='amdwiki.server.*' valueonly='true' before='* ' after='\n'}]  - Return as bulleted list
 *   [{ConfigAccessor type='roles'}]                                             - Display all roles (formatted)
 *   [{ConfigAccessor type='manager' manager='UserManager'}]                     - Display manager config (formatted)
 *   [{ConfigAccessor type='feature' feature='search'}]                          - Display feature config (formatted)
 *
 * Note: Plugin names are case-insensitive. [{configaccessor}], [{ConfigAccessor}], and [{CONFIGACCESSOR}] all work the same.
 */

/**
 * ConfigAccessorPlugin implementation
 */
const ConfigAccessorPlugin = {
  name: 'ConfigAccessorPlugin',
  description: 'Access configuration values including roles, features, and system settings',
  author: 'amdWiki',
  version: '2.1.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context containing engine reference
   * @param {Object} params - Plugin parameters
   * @returns {Promise<string>} HTML output or plain text
   */
  async execute(context, params) {
    const opts = params || {};
    const key = opts.key;
    const type = opts.type;
    const valueonly = opts.valueonly === 'true' || opts.valueonly === true;
    const before = opts.before !== undefined ? opts.before : '';
    // Note: after default is determined in displayConfigValue based on single vs multiple values
    const after = opts.after;

    try {
      // Get managers from engine
      const configManager = context?.engine?.getManager?.('ConfigurationManager');
      const userManager = context?.engine?.getManager?.('UserManager');

      if (!configManager) {
        return '<p class="error">ConfigurationManager not available</p>';
      }

      // Require either key or type parameter
      if (!key && !type) {
        return '<p class="error">Missing required parameter: must specify either \'key\' or \'type\'</p>';
      }

      // If key is provided, handle config value(s)
      if (key) {
        return this.displayConfigValue(configManager, key, valueonly, before, after);
      }

      // Otherwise handle type-based display (no valueonly support for these)
      switch (type.toLowerCase()) {
        case 'roles':
          return this.displayRoles(userManager);

        case 'manager':
          return this.displayManagerConfig(configManager, opts.manager);

        case 'feature':
          return this.displayFeatureConfig(configManager, opts.feature);

        default:
          return `<p class="error">Unknown type: ${escapeHtml(type)}. Use 'roles', 'manager', or 'feature'.</p>`;
      }

    } catch (error) {
      console.error('[ConfigAccessorPlugin] Error:', error);
      return `<p class="error">Error accessing configuration: ${escapeHtml(error.message)}</p>`;
    }
  },

  /**
   * Display all roles
   * @param {Object} userManager - UserManager instance
   * @returns {string} HTML output
   */
  displayRoles(userManager) {
    if (!userManager) {
      return '<p class="error">UserManager not available</p>';
    }

    const roles = userManager.getRoles();

    if (!roles || roles.length === 0) {
      return '<p class="text-muted">No roles configured</p>';
    }

    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += '      <h5><i class="fas fa-users"></i> Available Roles</h5>\n';
    html += '      <small class="text-muted">System and user-defined roles</small>\n';
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += '      <div class="table-responsive">\n';
    html += '        <table class="table table-sm table-hover">\n';
    html += '          <thead>\n';
    html += '            <tr>\n';
    html += '              <th style="width: 20%;">Role Name</th>\n';
    html += '              <th style="width: 25%;">Display Name</th>\n';
    html += '              <th style="width: 35%;">Description</th>\n';
    html += '              <th style="width: 10%;">Type</th>\n';
    html += '              <th style="width: 10%;">Icon</th>\n';
    html += '            </tr>\n';
    html += '          </thead>\n';
    html += '          <tbody>\n';

    // Sort roles: system first, then alphabetically
    const sortedRoles = [...roles].sort((a, b) => {
      if (a.issystem && !b.issystem) return -1;
      if (!a.issystem && b.issystem) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const role of sortedRoles) {
      const color = role.color || '#6c757d';
      const badge = role.issystem ?
        '<span class="badge bg-primary">System</span>' :
        '<span class="badge bg-secondary">Custom</span>';

      html += '            <tr>\n';
      html += `              <td><code>${escapeHtml(role.name)}</code></td>\n`;
      html += `              <td><strong style="color: ${escapeHtml(color)};">${escapeHtml(role.displayname)}</strong></td>\n`;
      html += `              <td><small class="text-muted">${escapeHtml(role.description || 'No description')}</small></td>\n`;
      html += `              <td>${badge}</td>\n`;
      html += `              <td><i class="fas fa-${escapeHtml(role.icon || 'user')}" style="color: ${escapeHtml(color)};"></i></td>\n`;
      html += '            </tr>\n';
    }

    html += '          </tbody>\n';
    html += '        </table>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="card-footer text-muted">\n';
    html += `      <small>Total Roles: ${roles.length} | System Roles: ${roles.filter(r => r.issystem).length} | Custom Roles: ${roles.filter(r => !r.issystem).length}</small>\n`;
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;
  },

  /**
   * Display config value(s) with optional wildcard support
   * @param {Object} configManager - ConfigurationManager instance
   * @param {string} key - Config key (dot-notation, supports wildcards with *)
   * @param {boolean} valueonly - If true, return only the value(s) without HTML formatting
   * @param {string} before - String to prepend before each value (default: '')
   * @param {string} after - String to append after each value (default: '\n')
   * @returns {string} HTML output or plain text
   */
  displayConfigValue(configManager, key, valueonly = false, before = '', after = '\n') {
    if (!key) {
      return '<p class="error">Missing required parameter: key</p><p class="text-muted">Usage: [{ConfigAccessor key=\'amdwiki.some.key\'}]</p>';
    }

    // Check if key contains wildcard
    const hasWildcard = key.includes('*');

    if (hasWildcard) {
      // Get all properties and filter by pattern
      const allProps = configManager.getAllProperties();
      const pattern = new RegExp('^' + key.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      const matchingKeys = Object.keys(allProps).filter(k => pattern.test(k)).sort();

      if (matchingKeys.length === 0) {
        if (valueonly) {
          return ''; // Return empty string for valueonly if no matches
        }
        return `<p class="text-muted">No config keys match pattern: <code>${escapeHtml(key)}</code></p>`;
      }

      // If valueonly, return values with before/after formatting
      if (valueonly) {
        return matchingKeys.map(k => {
          const val = allProps[k];
          const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return before + valStr + after;
        }).join('');
      }

      // Otherwise, return formatted HTML table
      let html = '<div class="config-accessor-plugin">\n';
      html += '  <div class="card">\n';
      html += '    <div class="card-header">\n';
      html += `      <h6><i class="fas fa-cog"></i> Configuration Values (${matchingKeys.length} matches)</h6>\n`;
      html += `      <small class="text-muted">Pattern: <code>${escapeHtml(key)}</code></small>\n`;
      html += '    </div>\n';
      html += '    <div class="card-body">\n';
      html += '      <div class="table-responsive">\n';
      html += '        <table class="table table-sm">\n';
      html += '          <thead>\n';
      html += '            <tr>\n';
      html += '              <th style="width: 40%;">Key</th>\n';
      html += '              <th style="width: 60%;">Value</th>\n';
      html += '            </tr>\n';
      html += '          </thead>\n';
      html += '          <tbody>\n';

      for (const matchKey of matchingKeys) {
        const value = allProps[matchKey];
        const displayValue = typeof value === 'object' ?
          JSON.stringify(value, null, 2) :
          String(value);

        html += '            <tr>\n';
        html += `              <td><code>${escapeHtml(matchKey)}</code></td>\n`;
        html += `              <td><code>${escapeHtml(displayValue)}</code></td>\n`;
        html += '            </tr>\n';
      }

      html += '          </tbody>\n';
      html += '        </table>\n';
      html += '      </div>\n';
      html += '    </div>\n';
      html += '  </div>\n';
      html += '</div>\n';

      return html;
    }

    // Single key lookup (no wildcard)
    const value = configManager.getProperty(key);

    if (value === undefined || value === null) {
      if (valueonly) {
        return ''; // Return empty string for valueonly if not found
      }
      return `<p class="text-muted">Config key <code>${escapeHtml(key)}</code> not found</p>`;
    }

    // If valueonly, return just the value with before/after formatting
    if (valueonly) {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return before + valStr + after;
    }

    // Otherwise, return formatted HTML
    let html = '<div class="config-accessor-plugin">\n';
    html += '  <div class="card">\n';
    html += '    <div class="card-header">\n';
    html += '      <h6><i class="fas fa-cog"></i> Configuration Value</h6>\n';
    html += '    </div>\n';
    html += '    <div class="card-body">\n';
    html += `      <p><strong>Key:</strong> <code>${escapeHtml(key)}</code></p>\n`;

    // Format value based on type
    if (typeof value === 'object') {
      html += `      <p><strong>Value:</strong></p>\n`;
      html += `      <pre><code>${escapeHtml(JSON.stringify(value, null, 2))}</code></pre>\n`;
    } else {
      html += `      <p><strong>Value:</strong> <code>${escapeHtml(String(value))}</code></p>\n`;
    }

    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';

    return html;
  },

  /**
   * Display manager-specific configuration
   * @param {Object} configManager - ConfigurationManager instance
   * @param {string} managerName - Name of the manager
   * @returns {string} HTML output
   */
  displayManagerConfig(configManager, managerName) {
    if (!managerName) {
      return '<p class="error">Missing required parameter: manager</p><p class="text-muted">Usage: [{ConfigAccessor type=\'manager\' manager=\'UserManager\'}]</p>';
    }

    try {
      const config = configManager.getManagerConfig(managerName);

      // Check if config is a valid object with properties
      if (!config || typeof config !== 'object' || Array.isArray(config)) {
        return `<p class="text-muted">No configuration found for manager: <code>${escapeHtml(managerName)}</code></p>`;
      }

      const configEntries = Object.entries(config);
      if (configEntries.length === 0) {
        return `<p class="text-muted">No configuration properties found for manager: <code>${escapeHtml(managerName)}</code></p>`;
      }

      let html = '<div class="config-accessor-plugin">\n';
      html += '  <div class="card">\n';
      html += '    <div class="card-header">\n';
      html += `      <h6><i class="fas fa-cogs"></i> ${escapeHtml(managerName)} Configuration</h6>\n`;
      html += '    </div>\n';
      html += '    <div class="card-body">\n';
      html += '      <div class="table-responsive">\n';
      html += '        <table class="table table-sm">\n';
      html += '          <thead>\n';
      html += '            <tr>\n';
      html += '              <th style="width: 40%;">Property</th>\n';
      html += '              <th style="width: 60%;">Value</th>\n';
      html += '            </tr>\n';
      html += '          </thead>\n';
      html += '          <tbody>\n';

      for (const [key, value] of configEntries) {
        const displayValue = typeof value === 'object' ?
          JSON.stringify(value, null, 2) :
          String(value);

        html += '            <tr>\n';
        html += `              <td><code>${escapeHtml(key)}</code></td>\n`;
        html += `              <td><code>${escapeHtml(displayValue)}</code></td>\n`;
        html += '            </tr>\n';
      }

      html += '          </tbody>\n';
      html += '        </table>\n';
      html += '      </div>\n';
      html += '    </div>\n';
      html += '  </div>\n';
      html += '</div>\n';

      return html;

    } catch (error) {
      console.error('[ConfigAccessorPlugin] Error in displayManagerConfig:', error);
      return `<p class="error">Error displaying manager configuration: ${escapeHtml(error.message)}</p>`;
    }
  },

  /**
   * Display feature-specific configuration
   * @param {Object} configManager - ConfigurationManager instance
   * @param {string} featureName - Name of the feature
   * @returns {string} HTML output
   */
  displayFeatureConfig(configManager, featureName) {
    if (!featureName) {
      return '<p class="error">Missing required parameter: feature</p><p class="text-muted">Usage: [{ConfigAccessor type=\'feature\' feature=\'search\'}]</p>';
    }

    try {
      const config = configManager.getFeatureConfig(featureName);

      // Check if config is a valid object with properties
      if (!config || typeof config !== 'object' || Array.isArray(config)) {
        return `<p class="text-muted">No configuration found for feature: <code>${escapeHtml(featureName)}</code></p>`;
      }

      const configEntries = Object.entries(config);
      if (configEntries.length === 0) {
        return `<p class="text-muted">No configuration properties found for feature: <code>${escapeHtml(featureName)}</code></p>`;
      }

      let html = '<div class="config-accessor-plugin">\n';
      html += '  <div class="card">\n';
      html += '    <div class="card-header">\n';
      html += `      <h6><i class="fas fa-puzzle-piece"></i> ${escapeHtml(featureName)} Feature Configuration</h6>\n`;
      html += '    </div>\n';
      html += '    <div class="card-body">\n';
      html += '      <div class="table-responsive">\n';
      html += '        <table class="table table-sm">\n';
      html += '          <thead>\n';
      html += '            <tr>\n';
      html += '              <th style="width: 40%;">Property</th>\n';
      html += '              <th style="width: 60%;">Value</th>\n';
      html += '            </tr>\n';
      html += '          </thead>\n';
      html += '          <tbody>\n';

      for (const [key, value] of configEntries) {
        const displayValue = typeof value === 'object' ?
          JSON.stringify(value, null, 2) :
          String(value);

        html += '            <tr>\n';
        html += `              <td><code>${escapeHtml(key)}</code></td>\n`;
        html += `              <td><code>${escapeHtml(displayValue)}</code></td>\n`;
        html += '            </tr>\n';
      }

      html += '          </tbody>\n';
      html += '        </table>\n';
      html += '      </div>\n';
      html += '    </div>\n';
      html += '  </div>\n';
      html += '</div>\n';

      return html;

    } catch (error) {
      console.error('[ConfigAccessorPlugin] Error in displayFeatureConfig:', error);
      return `<p class="error">Error displaying feature configuration: ${escapeHtml(error.message)}</p>`;
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
  if (text === null || text === undefined) return '';
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

// Export plugin
module.exports = ConfigAccessorPlugin;
