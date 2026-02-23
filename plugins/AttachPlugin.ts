/**
 * Attach plugin for amdWiki
 * Renders wiki attachments inline in page content.
 *
 * Supports two syntax forms (consistent with ImagePlugin):
 *
 * Named params (preferred):
 *   [{ATTACH src='filename.pdf'}]
 *   [{ATTACH src='photo.jpg' caption='My Photo' align='left' display='float'}]
 *
 * Positional params (legacy/JSPWiki style, also supported):
 *   [{ATTACH filename.pdf}]
 *   [{ATTACH photo.jpg|Caption Text}]
 *
 * Parameters:
 *   src      (required) - Attachment filename. Resolved via AttachmentManager.
 *   caption  (optional) - Caption text. Also used as alt text for images.
 *   align    (optional) - Alignment: left | right | center
 *   display  (optional) - Display mode for images: block (default) | float | inline | full
 *   style    (optional) - Custom inline CSS
 *   class    (optional) - Custom CSS class
 *   target   (optional) - Link target (default: _blank for file downloads, empty for images)
 *   width    (optional) - Image width (images only)
 *   height   (optional) - Image height (images only)
 *
 * For image attachments (.jpg, .jpeg, .png, .gif, .webp, .svg, .bmp):
 *   Renders as a clickable image linking to the full attachment URL.
 *
 * For all other attachments (pdf, doc, zip, etc.):
 *   Renders as a download link with a file-type icon.
 *
 * Resolution order (same as ImagePlugin):
 *   1. Attachments on the current page (exact filename match)
 *   2. Global attachment search across all pages
 *   3. Error span if not found
 *
 * Related issue: #274 [{ATTACH filename}] produces "Plugin 'ATTACH' not found"
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface AttachmentMeta {
  name: string;
  url: string;
  [key: string]: unknown;
}

interface AttachmentManager {
  getAttachmentsForPage(pageName: string): Promise<AttachmentMeta[]>;
  getAttachmentByFilename(filename: string): Promise<AttachmentMeta | null>;
}

interface AttachParams extends PluginParams {
  src?: string;
  caption?: string;
  align?: string;
  display?: string;
  style?: string;
  class?: string;
  target?: string;
  width?: string | number;
  height?: string | number;
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']);

function isImageFile(filename: string): boolean {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return false;
  return IMAGE_EXTENSIONS.has(filename.slice(dot).toLowerCase());
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFileIconClass(filename: string): string {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const iconMap: Record<string, string> = {
    pdf: 'pdf',
    doc: 'word', docx: 'word',
    xls: 'excel', xlsx: 'excel',
    ppt: 'powerpoint', pptx: 'powerpoint',
    zip: 'archive', tar: 'archive', gz: 'archive', '7z': 'archive',
    mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio',
    mp4: 'video', mov: 'video', avi: 'video', webm: 'video',
    txt: 'text', csv: 'text', md: 'text'
  };
  return `attachment-icon-${iconMap[ext] || 'generic'}`;
}

/**
 * Parse filename and optional caption from positional syntax:
 * [{ATTACH filename}] or [{ATTACH filename|Caption Text}]
 *
 * Used as fallback when no named src= param was provided.
 */
function parsePositional(originalMatch: string): { filename: string; caption: string | null } | null {
  // Strip [{ATTACH ...}] wrapper to get the inner content
  const inner = originalMatch.replace(/^\[\{ATTACH\s+/, '').replace(/\s*\}\]$/, '').trim();
  if (!inner || inner.includes('=')) {
    return null; // Named params — already handled by PluginSyntaxHandler
  }
  const parts = inner.split('|').map(p => p.trim());
  const filename = parts[0];
  const caption = parts[1] || null;
  return filename ? { filename, caption } : null;
}

const AttachPlugin: SimplePlugin = {
  name: 'ATTACH',
  description: 'Renders wiki attachments inline. Images display as clickable thumbnails; other files display as download links.',
  version: '1.0.0',

  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    try {
      const opts = params as AttachParams;

      // Resolve filename: named param (src=) takes precedence over positional syntax
      let filename = opts.src ? String(opts.src) : '';
      let caption = opts.caption ? String(opts.caption) : '';

      if (!filename) {
        // Fallback: parse [{ATTACH filename|caption}] positional form from originalMatch
        const rawMatch = typeof context.originalMatch === 'string' ? context.originalMatch : '';
        const positional = parsePositional(rawMatch);
        if (positional) {
          filename = positional.filename;
          if (!caption && positional.caption) caption = positional.caption;
        }
      }

      if (!filename) {
        return '<span class="error">ATTACH plugin: src is required</span>';
      }

      // Resolve attachment via AttachmentManager (same strategy as ImagePlugin)
      const attachmentManager = context.engine?.getManager('AttachmentManager') as AttachmentManager | undefined;
      let attachmentUrl = '';
      let attachmentName = filename;

      if (attachmentManager) {
        // Step 1: Current page attachments
        try {
          const pageAttachments = await attachmentManager.getAttachmentsForPage(context.pageName);
          const match = pageAttachments.find(a => a.name === filename);
          if (match) {
            attachmentUrl = match.url;
            attachmentName = match.name;
          }
        } catch {
          // Continue to global search
        }

        // Step 2: Global filename search across all attachments
        if (!attachmentUrl) {
          try {
            const globalMatch = await attachmentManager.getAttachmentByFilename(filename);
            if (globalMatch) {
              attachmentUrl = globalMatch.url;
              attachmentName = globalMatch.name;
            }
          } catch {
            // Not found
          }
        }
      }

      if (!attachmentUrl) {
        return `<span class="attachment-missing">[Attachment not found: ${escapeHtml(filename)}]</span>`;
      }

      const align = opts.align ? String(opts.align).toLowerCase() : null;
      const display = opts.display ? String(opts.display).toLowerCase() : 'block';
      const customStyle = opts.style ? String(opts.style) : '';
      const customClass = opts.class ? String(opts.class) : '';
      const target = opts.target ? String(opts.target) : null;

      if (isImageFile(attachmentName)) {
        // ── Image attachment ──────────────────────────────────────────────────
        // Build img styles (same logic as ImagePlugin)
        const styles: string[] = [];
        if (customStyle) styles.push(customStyle);

        if (display === 'full') {
          styles.push('display: block; width: 100%; height: auto; margin: 10px 0;');
        } else if (display === 'block') {
          if (align === 'left') styles.push('display: block; margin-right: auto; margin-bottom: 10px;');
          else if (align === 'right') styles.push('display: block; margin-left: auto; margin-bottom: 10px;');
          else styles.push('display: block; margin: 0 auto 10px auto;');
        } else if (display === 'inline') {
          styles.push('vertical-align: middle;');
          if (align === 'left') styles.push('margin-right: 5px;');
          else if (align === 'right') styles.push('margin-left: 5px;');
        } else {
          // float (default when align is left/right)
          if (align === 'left') styles.push('float: left; margin-right: 10px; margin-bottom: 10px;');
          else if (align === 'right') styles.push('float: right; margin-left: 10px; margin-bottom: 10px;');
          else styles.push('display: block; margin: 0 auto 10px auto;');
        }

        const classes = [customClass || 'wiki-image'];
        const altText = escapeHtml(caption || attachmentName);
        const styleAttr = styles.length ? ` style="${styles.join(' ')}"` : '';
        const classAttr = ` class="${classes.join(' ')}"`;
        const widthAttr = opts.width ? ` width="${opts.width}"` : '';
        const heightAttr = opts.height ? ` height="${opts.height}"` : '';

        let imgTag = `<img src="${escapeHtml(attachmentUrl)}" alt="${altText}"${classAttr}${styleAttr}${widthAttr}${heightAttr} />`;

        // Wrap in anchor linking to the full attachment
        const targetAttr = target ? ` target="${escapeHtml(target)}"` : '';
        imgTag = `<a href="${escapeHtml(attachmentUrl)}"${targetAttr} class="attach-image-link">${imgTag}</a>`;

        if (caption) {
          const alignClass = align ? `text-${align}` : '';
          const containerStyles: string[] = [];
          if (display === 'float') {
            if (align === 'left') containerStyles.push('float: left; margin-right: 10px; margin-bottom: 10px;');
            else if (align === 'right') containerStyles.push('float: right; margin-left: 10px; margin-bottom: 10px;');
            else containerStyles.push('display: block; margin: 0 auto 10px auto;');
          }
          const containerStyle = containerStyles.length ? ` style="${containerStyles.join(' ')}"` : '';
          imgTag = `\n<div class="image-plugin-container ${alignClass}"${containerStyle}>\n  ${imgTag}\n  <div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">${escapeHtml(caption)}</div>\n</div>`;
        }

        return imgTag;

      } else {
        // ── File attachment ───────────────────────────────────────────────────
        const linkText = escapeHtml(caption || attachmentName);
        const targetAttr = target ? ` target="${escapeHtml(target)}"` : ' target="_blank"';
        const iconClass = getFileIconClass(attachmentName);
        const extraClass = customClass ? ` ${escapeHtml(customClass)}` : '';
        const styleAttr = customStyle ? ` style="${escapeHtml(customStyle)}"` : '';

        return `<a href="${escapeHtml(attachmentUrl)}"${targetAttr} class="attachment-link${extraClass}"${styleAttr}><span class="attachment-icon ${iconClass}" aria-hidden="true"></span>${linkText}</a>`;
      }

    } catch {
      return '<span class="error">ATTACH plugin error</span>';
    }
  }
};

module.exports = AttachPlugin;
