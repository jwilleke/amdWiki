/**
 * TablePlugin — JSPWiki-compatible [{Table}] plugin.
 *
 * Usage (place before a table to enable # auto-numbering):
 *   [{Table}]
 *   || # || Column ||
 *   | # | Row 1   |
 *   | # | Row 2   |
 *
 * The plugin itself outputs nothing. The auto-numbering of cells
 * containing only "#" is handled by the table renderer in MarkupParser.
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types.js';

const TablePlugin: SimplePlugin = {
  name: 'TablePlugin',
  description: 'JSPWiki-compatible Table plugin — enables # auto-numbering in table rows',
  author: 'ngdpbase',
  version: '1.0.0',

  execute(_context: PluginContext, _params: PluginParams): string {
    return '';
  },

  initialize(_engine: unknown): void {
    // no-op
  }
};

export default TablePlugin;
