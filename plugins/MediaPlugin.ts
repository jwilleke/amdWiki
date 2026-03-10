/**
 * MediaPlugin - Shows total media item count or a list of media items
 *
 * Usage:
 *   [{MediaPlugin}]                              — count of all indexed media items
 *   [{MediaPlugin format='list'}]                — list of media filenames as links
 *   [{MediaPlugin format='list' max='10'}]       — limit list to 10 items
 *   [{MediaPlugin format='list' year='2023'}]    — items from a specific year
 *   [{MediaPlugin format='list' page='MyPage'}]  — items linked to a specific wiki page
 *   [{MediaPlugin format='list' page='current'}] — items linked to the current page
 *   [{MediaPlugin format='count' page='current'}]— count of items on the current page
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import { formatAsCount, formatAsList, parseMaxParam, applyMax } from '../src/utils/pluginFormatters';
import type { PageLink } from '../src/utils/pluginFormatters';

interface MediaItem {
  id: string;
  filename: string;
  year?: number;
  eventName?: string | null;
}

interface MediaManager {
  getYears(): Promise<number[]>;
  listByYear(year: number): Promise<MediaItem[]>;
  listByPage(pageName: string): Promise<MediaItem[]>;
}

const MediaPlugin: SimplePlugin = {
  name: 'MediaPlugin',
  description: 'Shows total media item count or a list of indexed media items',
  author: 'amdWiki',
  version: '1.1.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const engine = context.engine;
    if (!engine) return '0';

    try {
      const mediaManager = engine.getManager('MediaManager') as MediaManager | undefined;
      if (!mediaManager?.getYears) return '0';

      const format = typeof params.format === 'string' ? params.format : 'count';
      const yearParam = params.year != null ? parseInt(String(params.year), 10) : null;
      const pageParam = params.page != null ? String(params.page) : null;

      let items: MediaItem[];

      if (pageParam) {
        // Resolve 'current' to the context page name
        const pageName = pageParam === 'current' ? (context.pageName ?? '') : pageParam;
        items = pageName ? await mediaManager.listByPage(pageName) : [];
      } else if (yearParam && !isNaN(yearParam)) {
        items = await mediaManager.listByYear(yearParam);
      } else {
        const years = await mediaManager.getYears();
        const perYear = await Promise.all(years.map(y => mediaManager.listByYear(y)));
        items = perYear.flat();
      }

      if (format === 'list') {
        const rawMax = params.max;
        const max = parseMaxParam(typeof rawMax === 'boolean' ? undefined : rawMax);
        const links: PageLink[] = applyMax(items, max).map(item => ({
          text: item.eventName ?? item.filename,
          href: `/media/item/${encodeURIComponent(item.id)}`
        }));
        return formatAsList(links, {});
      }

      return formatAsCount(items.length);
    } catch (err) {
      const logger = context.engine?.logger;
      if (logger?.error) logger.error('MediaPlugin error:', err);
      return '0';
    }
  }
};

module.exports = MediaPlugin;
