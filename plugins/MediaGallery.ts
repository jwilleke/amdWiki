/**
 * MediaGallery - Stub plugin for ngdpbase MediaManager (Phase 3)
 *
 * Renders a grid or list of media items for a given year or keyword filter.
 * Full implementation is deferred to Phase 4 (MediaManager real scan).
 *
 * Intended syntax (Phase 4):
 *   [{MediaGallery year=2024 output=grid max=20}]
 *
 * Parameters (Phase 4):
 *   year    — Four-digit year to display (required)
 *   output  — Display mode: "grid" (default) or "list"
 *   max     — Maximum number of items to show (default: 20)
 */

import type { PluginContext, PluginParams } from './types';

const MediaGalleryPlugin = {
  name: 'MediaGallery',
  description: 'Displays a gallery of media items (stub — MediaManager not yet available)',
  author: 'ngdpbase',
  version: '0.1.0',

  /**
   * Execute the plugin.
   * @param _context - Wiki context (unused in stub).
   * @param _params  - Plugin parameters (unused in stub).
   * @returns Stub HTML placeholder.
   */
  execute(_context: PluginContext, _params: PluginParams): string {
    return '<p class="media-stub">MediaGallery plugin not yet available</p>';
  }
};

module.exports = MediaGalleryPlugin;
