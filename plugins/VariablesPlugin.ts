/**
 * VariablesPlugin - JSPWiki-style plugin for amdWiki
 * Displays system variables, contextual variables, available plugins, and configuration variables
 *
 * Usage:
 *   [{VariablesPlugin}]                        - Shows all (variables + plugins + config)
 *   [{VariablesPlugin type='all'}]             - Shows all (variables + plugins + config)
 *   [{VariablesPlugin type='system'}]          - Shows only system variables
 *   [{VariablesPlugin type='contextual'}]      - Shows only contextual variables
 *   [{VariablesPlugin type='plugins'}]         - Shows only available plugins
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface VariablesParams extends PluginParams {
  type?: string;
}

interface DebugInfo {
  systemVariables: string[];
  contextualVariables: string[];
  totalVariables: number;
}

interface VariableManager {
  getDebugInfo(): DebugInfo;
  getVariable(name: string, context: PluginContext): string;
}

interface PluginInfo {
  description?: string;
  version?: string;
  author?: string;
  execute?(context: PluginContext, params: PluginParams): Promise<string> | string;
}

interface PluginManager {
  plugins: Map<string, PluginInfo>;
}

/**
 * Escape HTML special characters
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  // Handle non-string/number values safely
  if (typeof text !== 'string' && typeof text !== 'number') {
    return '[Object]';
  }
  const str = String(text);
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m] || m);
}

/**
 * Get description for a variable
 * @param varName - Variable name
 * @returns Description
 */
function getVariableDescription(varName: string): string {
  const descriptions: Record<string, string> = {
    'applicationname': 'Application name from configuration',
    'appname': 'Application name (alias)',
    'baseurl': 'Base URL for the wiki',
    'version': 'amdWiki version number',
    'totalpages': 'Total number of pages in wiki',
    'uptime': 'Server uptime',
    'timestamp': 'Current ISO timestamp',
    'date': 'Current date',
    'time': 'Current time',
    'year': 'Current year',
    'month': 'Current month',
    'day': 'Current day',
    'username': 'Current user\'s name',
    'loginstatus': 'User authentication status',
    'displayname': 'User\'s display name',
    'pagename': 'Current page name',
    'userroles': 'User\'s assigned roles',
    'useragent': 'Browser user agent string',
    'browser': 'Browser name and version',
    'clientip': 'Client IP address',
    'referer': 'HTTP referer',
    'sessionid': 'Session identifier',
    'acceptlanguage': 'Accept-Language header'
  };

  return descriptions[varName.toLowerCase()] || 'Wiki variable';
}

/**
 * VariablesPlugin implementation
 */
const VariablesPlugin: SimplePlugin = {
  name: 'VariablesPlugin',
  description: 'Displays system and contextual variables available in the wiki',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Wiki context containing engine reference
   * @param params - Plugin parameters
   * @returns HTML output
   */
  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const opts = (params || {}) as VariablesParams;
    const type = String(opts.type || 'all'); // 'system', 'contextual', 'plugins', or 'all'

    try {
      // Get managers from engine
      const variableManager = context?.engine?.getManager?.('VariableManager') as VariableManager | undefined;
      const pluginManager = context?.engine?.getManager?.('PluginManager') as PluginManager | undefined;

      if (!variableManager) {
        return '<p class="error">VariableManager not available</p>';
      }

      // Get debug info with all variables
      const debugInfo = variableManager.getDebugInfo();

      // Generate HTML output based on type
      let html = '<div class="variables-plugin">\n';

      // Add navigation tabs if showing all
      if (type === 'all') {
        html += '<ul class="nav nav-tabs mb-3" role="tablist">\n';
        html += '  <li class="nav-item" role="presentation">\n';
        html += '    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#var-system" type="button" role="tab">\n';
        html += '      <i class="fas fa-cog"></i> System Variables\n';
        html += '    </button>\n';
        html += '  </li>\n';
        html += '  <li class="nav-item" role="presentation">\n';
        html += '    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#var-contextual" type="button" role="tab">\n';
        html += '      <i class="fas fa-user"></i> Contextual Variables\n';
        html += '    </button>\n';
        html += '  </li>\n';
        html += '  <li class="nav-item" role="presentation">\n';
        html += '    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#var-plugins" type="button" role="tab">\n';
        html += '      <i class="fas fa-puzzle-piece"></i> Available Plugins\n';
        html += '    </button>\n';
        html += '  </li>\n';
        html += '  <li class="nav-item" role="presentation">\n';
        html += '    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#var-config" type="button" role="tab">\n';
        html += '      <i class="fas fa-sliders-h"></i> Configuration Variables\n';
        html += '    </button>\n';
        html += '  </li>\n';
        html += '</ul>\n';
        html += '<div class="tab-content">\n';
      }

      // System Variables
      if (type === 'all' || type === 'system') {
        html += type === 'all' ? '<div class="tab-pane fade show active" id="var-system" role="tabpanel">\n' : '';
        html += '<div class="card">\n';
        html += '  <div class="card-header">\n';
        html += '    <h5><i class="fas fa-cog"></i> System Variables</h5>\n';
        html += '    <small class="text-muted">Variables that don\'t require user or page context</small>\n';
        html += '  </div>\n';
        html += '  <div class="card-body">\n';
        html += '    <div class="table-responsive">\n';
        html += '      <table class="table table-sm table-hover">\n';
        html += '        <thead>\n';
        html += '          <tr>\n';
        html += '            <th style="width: 25%;">Variable Name</th>\n';
        html += '            <th style="width: 35%;">Current Value</th>\n';
        html += '            <th style="width: 40%;">Description</th>\n';
        html += '          </tr>\n';
        html += '        </thead>\n';
        html += '        <tbody>\n';

        // Add system variables
        for (const varName of debugInfo.systemVariables) {
          const value = variableManager.getVariable(varName, context);
          const description = getVariableDescription(varName);

          html += '          <tr>\n';
          html += `            <td><code>[{$${escapeHtml(varName)}}]</code></td>\n`;
          html += `            <td><code>${escapeHtml(value)}</code></td>\n`;
          html += `            <td><small class="text-muted">${description}</small></td>\n`;
          html += '          </tr>\n';
        }

        html += '        </tbody>\n';
        html += '      </table>\n';
        html += '    </div>\n';
        html += '  </div>\n';
        html += '</div>\n';
        html += type === 'all' ? '</div>\n' : '';
      }

      // Contextual Variables
      if (type === 'all' || type === 'contextual') {
        html += type === 'all' ? '<div class="tab-pane fade" id="var-contextual" role="tabpanel">\n' : '';
        html += '<div class="card">\n';
        html += '  <div class="card-header">\n';
        html += '    <h5><i class="fas fa-user"></i> Contextual Variables</h5>\n';
        html += '    <small class="text-muted">Variables that require user or page context</small>\n';
        html += '  </div>\n';
        html += '  <div class="card-body">\n';
        html += '    <div class="table-responsive">\n';
        html += '      <table class="table table-sm table-hover">\n';
        html += '        <thead>\n';
        html += '          <tr>\n';
        html += '            <th style="width: 25%;">Variable Name</th>\n';
        html += '            <th style="width: 35%;">Your Current Value</th>\n';
        html += '            <th style="width: 40%;">Description</th>\n';
        html += '          </tr>\n';
        html += '        </thead>\n';
        html += '        <tbody>\n';

        // Add contextual variables
        for (const varName of debugInfo.contextualVariables) {
          const value = variableManager.getVariable(varName, context);
          const description = getVariableDescription(varName);

          html += '          <tr>\n';
          html += `            <td><code>[{$${escapeHtml(varName)}}]</code></td>\n`;
          html += `            <td><code>${escapeHtml(value)}</code></td>\n`;
          html += `            <td><small class="text-muted">${description}</small></td>\n`;
          html += '          </tr>\n';
        }

        html += '        </tbody>\n';
        html += '      </table>\n';
        html += '    </div>\n';
        html += '  </div>\n';
        html += '</div>\n';
        html += type === 'all' ? '</div>\n' : '';
      }

      // Available Plugins
      if (type === 'all' || type === 'plugins') {
        html += type === 'all' ? '<div class="tab-pane fade" id="var-plugins" role="tabpanel">\n' : '';
        html += '<div class="card">\n';
        html += '  <div class="card-header">\n';
        html += '    <h5><i class="fas fa-puzzle-piece"></i> Available Plugins</h5>\n';
        html += '    <small class="text-muted">Registered plugins that can be invoked in wiki pages</small>\n';
        html += '  </div>\n';
        html += '  <div class="card-body">\n';

        if (pluginManager && pluginManager.plugins && pluginManager.plugins.size > 0) {
          html += '    <div class="table-responsive">\n';
          html += '      <table class="table table-sm table-hover">\n';
          html += '        <thead>\n';
          html += '          <tr>\n';
          html += '            <th style="width: 25%;">Plugin Name</th>\n';
          html += '            <th style="width: 40%;">Description</th>\n';
          html += '            <th style="width: 15%;">Version</th>\n';
          html += '            <th style="width: 20%;">Author</th>\n';
          html += '          </tr>\n';
          html += '        </thead>\n';
          html += '        <tbody>\n';

          // Sort plugins alphabetically
          const pluginArray = Array.from(pluginManager.plugins.entries());
          pluginArray.sort((a, b) => a[0].localeCompare(b[0]));

          for (const [pluginName, plugin] of pluginArray) {
            const description = plugin.description || 'No description';
            const version = plugin.version || 'N/A';
            const author = plugin.author || 'Unknown';

            html += '          <tr>\n';
            html += `            <td><code>[{${escapeHtml(pluginName)}}]</code></td>\n`;
            html += `            <td><small class="text-muted">${escapeHtml(description)}</small></td>\n`;
            html += `            <td><span class="badge bg-info">${escapeHtml(version)}</span></td>\n`;
            html += `            <td><small>${escapeHtml(author)}</small></td>\n`;
            html += '          </tr>\n';
          }

          html += '        </tbody>\n';
          html += '      </table>\n';
          html += '    </div>\n';
        } else {
          html += '    <p class="text-muted">No plugins currently registered</p>\n';
        }

        html += '  </div>\n';
        html += '</div>\n';
        html += type === 'all' ? '</div>\n' : '';
      }

      // Configuration Variables (using ConfigAccessorPlugin)
      if (type === 'all') {
        html += '<div class="tab-pane fade" id="var-config" role="tabpanel">\n';

        // Get ConfigAccessorPlugin
        const configAccessorPlugin = pluginManager?.plugins?.get('ConfigAccessorPlugin');

        if (configAccessorPlugin && configAccessorPlugin.execute) {
          try {
            // Execute ConfigAccessorPlugin to get configuration values
            const configOutput = await configAccessorPlugin.execute(context, { key: 'amdwiki.*' });
            html += configOutput;
          } catch {
            html += '<div class="alert alert-warning">\n';
            html += '  <i class="fas fa-exclamation-triangle"></i> Error loading configuration variables\n';
            html += '</div>\n';
          }
        } else {
          html += '<div class="alert alert-info">\n';
          html += '  <i class="fas fa-info-circle"></i> ConfigAccessorPlugin not available\n';
          html += '</div>\n';
        }

        html += '</div>\n';
      }

      // Close tab content if showing all
      if (type === 'all') {
        html += '</div>\n';
      }

      // Add summary stats
      const pluginCount = pluginManager && pluginManager.plugins ? pluginManager.plugins.size : 0;
      html += '<div class="mt-3 text-muted text-center">\n';
      html += `  <small>Total Variables: ${debugInfo.totalVariables} | `;
      html += `System: ${debugInfo.systemVariables.length} | `;
      html += `Contextual: ${debugInfo.contextualVariables.length} | `;
      html += `Plugins: ${pluginCount}</small>\n`;
      html += '</div>\n';

      html += '</div>\n';

      return html;

    } catch (error) {
      const err = error as Error;
      return `<p class="error">Error displaying variables: ${escapeHtml(err.message)}</p>`;
    }
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * @param _engine - Wiki engine instance
   */
  initialize(_engine: unknown): void {
    // Plugin initialized
  }
};

module.exports = VariablesPlugin;
