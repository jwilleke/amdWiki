/**
 * MediaItem - Stub plugin for ngdpbase MediaManager (Phase 3)
 *
 * Embeds a single media item (image, video, etc.) inline on a wiki page.
 * Full implementation is deferred to Phase 4 (MediaManager real scan).
 *
 * Intended syntax (Phase 4):
 *   [{MediaItem id="uuid" caption="text"}]
 *
 * Parameters (Phase 4):
 *   id      — Media item identifier (required)
 *   caption — Optional caption text displayed beneath the item
 */

import type { PluginContext, PluginParams } from './types';

const MediaItemPlugin = {
  name: 'MediaItem',
  description: 'Embeds a single media item inline (stub — MediaManager not yet available)',
  author: 'ngdpbase',
  version: '0.1.0',

  /**
   * Execute the plugin.
   * @param _context - Wiki context (unused in stub).
   * @param _params  - Plugin parameters (unused in stub).
   * @returns Stub HTML placeholder.
   */
  execute(_context: PluginContext, _params: PluginParams): string {
    return '<p class="media-stub">MediaItem plugin not yet available</p>';
  }
};

module.exports = MediaItemPlugin;
