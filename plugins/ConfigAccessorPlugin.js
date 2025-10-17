/**
 * ConfigAccessorPlugin - JSPWiki-style plugin for amdWiki
 * Displays configuration values including roles, features, and system settings
 *
 * Usage:
 *   [{ConfigAccessor}]                                    - Display all roles
 *   [{ConfigAccessor type='roles'}]                       - Display all roles (explicit)
 *   [{ConfigAccessor type='config' key='amdwiki.server.port'}] - Display specific config value
 *   [{ConfigAccessor type='manager' manager='UserManager'}]    - Display manager config
 *   [{ConfigAccessor type='feature' feature='search'}]         - Display feature config
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
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context containing engine reference
   * @param {Object} params - Plugin parameters
   * @returns {Promise<string>} HTML output
   */
  async execute(context, params) {
    const opts = params || {};
    const type = opts.type || 'roles'; // 'roles', 'config', 'manager', 'feature'

    try {
      // Get managers from engine
      const configManager = context?.engine?.getManager?.('ConfigurationManager');
      const userManager = context?.engine?.getManager?.('UserManager');

      if (!configManager) {
        return '<p class="error">ConfigurationManager not available</p>';
      }

      // Generate HTML based on type
      switch (type.toLowerCase()) {
        case 'roles':
          return this.displayRoles(userManager);

        case 'config':
          return this.displayConfigValue(configManager, opts.key);

        case 'manager':
          return this.displayManagerConfig(configManager, opts.manager);

        case 'feature':
          return this.displayFeatureConfig(configManager, opts.feature);

        default:
          return `<p class="error">Unknown type: ${escapeHtml(type)}. Use 'roles', 'config', 'manager', or 'feature'.</p>`;
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
   * Display a specific config value
   * @param {Object} configManager - ConfigurationManager instance
   * @param {string} key - Config key (dot-notation)
   * @returns {string} HTML output
   */
  displayConfigValue(configManager, key) {
    if (!key) {
      return '<p class="error">Missing required parameter: key</p><p class="text-muted">Usage: [{ConfigAccessor type=\'config\' key=\'amdwiki.some.key\'}]</p>';
    }

    const value = configManager.getProperty(key);

    if (value === undefined || value === null) {
      return `<p class="text-muted">Config key <code>${escapeHtml(key)}</code> not found</p>`;
    }

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

    const config = configManager.getManagerConfig(managerName);

    if (!config || Object.keys(config).length === 0) {
      return `<p class="text-muted">No configuration found for manager: <code>${escapeHtml(managerName)}</code></p>`;
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

    for (const [key, value] of Object.entries(config)) {
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

    const config = configManager.getFeatureConfig(featureName);

    if (!config || Object.keys(config).length === 0) {
      return `<p class="text-muted">No configuration found for feature: <code>${escapeHtml(featureName)}</code></p>`;
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

    for (const [key, value] of Object.entries(config)) {
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
