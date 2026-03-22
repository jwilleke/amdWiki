/**
 * AttachmentsPlugin - Shows total attachment count or a list of attachment titles
 *
 * Usage:
 *   [{AttachmentsPlugin}]                    — count of all attachments
 *   [{AttachmentsPlugin format='list'}]       — list of attachment names as links
 *   [{AttachmentsPlugin format='list' max='10'}] — limit list to 10 items
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';
import { formatAsCount, formatAsList, parseMaxParam, applyMax } from '../src/utils/pluginFormatters';
import type { PageLink } from '../src/utils/pluginFormatters';

interface AttachmentMetadata {
  identifier: string;
  name?: string;
  url?: string;
}

interface AttachmentManager {
  getAllAttachments(): Promise<AttachmentMetadata[]>;
}

const AttachmentsPlugin: SimplePlugin = {
  name: 'AttachmentsPlugin',
  description: 'Shows total attachment count or a list of attachments',
  author: 'ngdpbase',
  version: '1.0.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    const engine = context.engine;
    if (!engine) return '0';

    try {
      const attachmentManager = engine.getManager('AttachmentManager') as AttachmentManager | undefined;
      if (!attachmentManager?.getAllAttachments) return '0';

      const attachments = await attachmentManager.getAllAttachments();
      if (!Array.isArray(attachments)) return '0';

      const format = typeof params.format === 'string' ? params.format : 'count';

      if (format === 'list') {
        const rawMax = params.max;
        const max = parseMaxParam(typeof rawMax === 'boolean' ? undefined : rawMax);
        const links: PageLink[] = applyMax(attachments, max).map(a => ({
          text: a.name ?? a.identifier ?? 'Attachment',
          href: a.url ?? `/attach/${encodeURIComponent(a.identifier)}`
        }));
        return formatAsList(links, {});
      }

      return formatAsCount(attachments.length);
    } catch (err) {
      const logger = context.engine?.logger;
      if (logger?.error) logger.error('AttachmentsPlugin error:', err);
      return '0';
    }
  }
};

module.exports = AttachmentsPlugin;
