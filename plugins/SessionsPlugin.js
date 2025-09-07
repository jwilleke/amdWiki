/**
 * SessionsPlugin - JSPWiki-style sessions plugin
 * Returns the number of active sessions
 */

const SessionsPlugin = {
  name: 'SessionsPlugin',
  description: 'Shows the number of active sessions',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context
   * @param {Object} params - Plugin parameters
   * @returns {string} HTML output
   */
  execute(context, params) {
    // For now, return a simple count of 1
    // In a real implementation, this would track actual sessions
    return '1';
  }
};

module.exports = SessionsPlugin;
