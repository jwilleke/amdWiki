/**
 * MediaSearch - Stub plugin for ngdpbase MediaManager (Phase 3)
 *
 * Renders search results from the media index.
 * Full implementation is deferred to Phase 4 (MediaManager real scan).
 *
 * Intended syntax (Phase 4):
 *   [{MediaSearch keyword="Nassau" format=grid max=20}]
 *
 * Parameters (Phase 4):
 *   keyword — Search query string (required)
 *   format  — Display mode: "grid" (default) or "list"
 *   max     — Maximum number of results to show (default: 20)
 */

import type { PluginContext, PluginParams } from './types';

const MediaSearchPlugin = {
  name: 'MediaSearch',
  description: 'Displays media search results (stub — MediaManager not yet available)',
  author: 'ngdpbase',
  version: '0.1.0',

  /**
   * Execute the plugin.
   * @param _context - Wiki context (unused in stub).
   * @param _params  - Plugin parameters (unused in stub).
   * @returns Stub HTML placeholder.
   */
  execute(_context: PluginContext, _params: PluginParams): string {
    return '<p class="media-stub">MediaSearch plugin not yet available</p>';
  }
};

module.exports = MediaSearchPlugin;
