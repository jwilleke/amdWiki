/**
 * Image plugin for amdWiki
 * Implements inline image functionality similar to JSPWiki's Image plugin
 *
 * Syntax: [{Image src='path/to/image.jpg' alt='description' width='200' height='150'}]
 *
 * Parameters:
 *   src (required) - Image source path or URL
 *   alt (optional) - Alt text (defaults to caption if not provided)
 *   caption (optional) - Image caption (also used as alt if alt not provided)
 *   width (optional) - Image width
 *   height (optional) - Image height
 *   align (optional) - Horizontal alignment: left, right, center
 *   display (optional) - Display mode:
 *     - block (default): Image in its own block, no text wrapping
 *     - float: Allows text wrapping around image
 *     - inline: Image flows inline with text
 *     - full: Full-width image
 *   border (optional) - Border width in pixels
 *   style (optional) - Custom inline CSS styles
 *   class (optional) - Custom CSS class
 *   title (optional) - Title attribute (tooltip)
 *   link (optional) - URL to link the image to
 *
 * Examples:
 *   [{Image src='/path/image.jpg' caption='My Image'}]
 *   [{Image src='/path/image.jpg' align='left' display='float' caption='Floats with text'}]
 *   [{Image src='/path/image.jpg' align='left' display='block' caption='No text wrapping'}]
 *   [{Image src='/path/image.jpg' display='full' caption='Full width image'}]
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface ConfigManager {
  getProperty(key: string, defaultValue: string): string;
}

interface AttachmentMeta {
  name: string;
  url: string;
  [key: string]: unknown;
}

interface AttachmentManager {
  getAttachmentsForPage(pageName: string): Promise<AttachmentMeta[]>;
  getAttachmentByFilename(filename: string): Promise<AttachmentMeta | null>;
}

interface ImageParams extends PluginParams {
  src?: string;
  alt?: string;
  caption?: string;
  width?: string | number;
  height?: string | number;
  align?: string;
  display?: string;
  border?: string | number;
  style?: string;
  class?: string;
  title?: string;
  link?: string;
}

const ImagePlugin: SimplePlugin = {
  name: 'Image',

  /**
   * Execute the plugin
   * @param context - Rendering context
   * @param params - Plugin parameters object (parsed from syntax)
   * @returns HTML output
   */
  async execute(context: PluginContext, params: PluginParams): Promise<string> {
    try {
      const opts = params as ImageParams;

      // Get configuration from ConfigurationManager
      const configManager = context.engine?.getManager('ConfigurationManager') as ConfigManager | undefined;
      const defaultAlt =
        configManager?.getProperty(
          'amdwiki.features.images.defaultAlt',
          'Uploaded image'
        ) || 'Uploaded image';
      const defaultClass =
        configManager?.getProperty(
          'amdwiki.features.images.defaultClass',
          'wiki-image'
        ) || 'wiki-image';

      // Build the image tag
      let imgTag = '<img';

      // Required src attribute
      if (opts.src) {
        let src = String(opts.src);

        // If it starts with http or /, use as-is (absolute path or URL)
        if (!src.startsWith('http') && !src.startsWith('/')) {
          // Try to resolve via attachment storage
          const attachmentManager = context.engine?.getManager('AttachmentManager') as AttachmentManager | undefined;
          let resolved = false;

          if (attachmentManager) {
            // Step 1: Check attachments on the current page by exact filename match
            try {
              const pageAttachments = await attachmentManager.getAttachmentsForPage(context.pageName);
              const match = pageAttachments.find(a => a.name === src);
              if (match) {
                src = match.url;
                resolved = true;
              }
            } catch {
              // Attachment lookup failed, continue to next step
            }

            // Step 2: If src contains '/', treat as Page/filename pattern
            if (!resolved && src.includes('/')) {
              try {
                const slashIndex = src.indexOf('/');
                const refPageName = src.substring(0, slashIndex);
                const refFileName = src.substring(slashIndex + 1);
                const refAttachments = await attachmentManager.getAttachmentsForPage(refPageName);
                const match = refAttachments.find(a => a.name === refFileName);
                if (match) {
                  src = match.url;
                  resolved = true;
                }
              } catch {
                // Cross-page lookup failed, continue to fallback
              }
            }

            // Step 2.5: Global filename search across all attachments
            if (!resolved) {
              try {
                const globalMatch = await attachmentManager.getAttachmentByFilename(src);
                if (globalMatch) {
                  src = globalMatch.url;
                  resolved = true;
                }
              } catch {
                // Global lookup failed, continue to fallback
              }
            }
          }

          // Step 3: Fall back to /images/ path
          if (!resolved) {
            src = `/images/${src}`;
          }
        }

        imgTag += ` src="${src}"`;
      } else {
        return '<span class="error">Image plugin: src attribute is required</span>';
      }

      // Optional attributes
      // If alt is not provided, use caption as alt (if available)
      if (opts.alt) {
        imgTag += ` alt="${opts.alt}"`;
      } else if (opts.caption) {
        imgTag += ` alt="${opts.caption}"`;
      } else {
        imgTag += ` alt="${defaultAlt}"`;
      }

      if (opts.width) {
        imgTag += ` width="${opts.width}"`;
      }

      if (opts.height) {
        imgTag += ` height="${opts.height}"`;
      }

      if (opts.title) {
        imgTag += ` title="${opts.title}"`;
      }

      // Handle class and style
      const styles: string[] = [];
      const classes: string[] = [];

      if (opts.class) {
        classes.push(String(opts.class));
      } else {
        classes.push(defaultClass);
      }

      // Add border style if specified
      if (opts.border) {
        styles.push(`border: ${opts.border}px solid #ccc;`);
      }

      if (opts.style) {
        styles.push(String(opts.style));
      }

      // Handle display parameter
      // display="float" - allows text wrapping (default for left/right align)
      // display="block" - image in its own block, no text wrapping
      // display="inline" - image flows inline with text
      // display="full" - full-width image
      const display = opts.display ? String(opts.display).toLowerCase() : 'block';
      const align = opts.align ? String(opts.align).toLowerCase() : null;

      // Apply display and alignment styles
      if (display === 'full') {
        // Full-width display - ignores align parameter
        styles.push('display: block; width: 100%; height: auto; margin: 10px 0;');
      } else if (display === 'block') {
        // Block display - no text wrapping
        if (align === 'left') {
          styles.push('display: block; margin-right: auto; margin-bottom: 10px;');
        } else if (align === 'right') {
          styles.push('display: block; margin-left: auto; margin-bottom: 10px;');
        } else if (align === 'center' || !align) {
          styles.push('display: block; margin: 0 auto 10px auto;');
        }
      } else if (display === 'inline') {
        // Inline display - flows with text
        if (align === 'left') {
          styles.push('vertical-align: middle; margin-right: 5px;');
        } else if (align === 'right') {
          styles.push('vertical-align: middle; margin-left: 5px;');
        } else {
          styles.push('vertical-align: middle;');
        }
      } else {
        // Float display (default) - allows text wrapping
        if (align === 'left') {
          styles.push('float: left; margin-right: 10px; margin-bottom: 10px;');
        } else if (align === 'right') {
          styles.push('float: right; margin-left: 10px; margin-bottom: 10px;');
        } else if (align === 'center') {
          styles.push('display: block; margin: 0 auto 10px auto;');
        }
      }

      if (classes.length > 0) {
        imgTag += ` class="${classes.join(' ')}"`;
      }

      if (styles.length > 0) {
        imgTag += ` style="${styles.join(' ')}"`;
      }

      imgTag += ' />';

      // Handle link wrapping
      if (opts.link) {
        imgTag = `<a href="${opts.link}" target="_blank">${imgTag}</a>`;
      }

      // Handle caption
      if (opts.caption) {
        const alignClass = align ? `text-${align}` : '';

        // Build container styles based on display mode
        const containerStyles: string[] = [];

        if (display === 'full') {
          containerStyles.push('display: block; width: 100%; margin: 10px 0;');
        } else if (display === 'block') {
          if (align === 'left') {
            containerStyles.push('display: block; margin-right: auto; margin-bottom: 10px;');
          } else if (align === 'right') {
            containerStyles.push('display: block; margin-left: auto; margin-bottom: 10px;');
          } else {
            containerStyles.push('display: block; margin: 0 auto 10px auto;');
          }
        } else if (display === 'inline') {
          containerStyles.push('display: inline-block; vertical-align: middle;');
          if (align === 'left') {
            containerStyles.push('margin-right: 5px;');
          } else if (align === 'right') {
            containerStyles.push('margin-left: 5px;');
          }
        } else {
          // Float display
          if (align === 'left') {
            containerStyles.push('float: left; margin-right: 10px; margin-bottom: 10px;');
          } else if (align === 'right') {
            containerStyles.push('float: right; margin-left: 10px; margin-bottom: 10px;');
          } else {
            containerStyles.push('display: block; margin: 0 auto 10px auto;');
          }
        }

        imgTag = `
<div class="image-plugin-container ${alignClass}" style="${containerStyles.join(' ')}">
  ${imgTag}
  <div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">${opts.caption}</div>
</div>`;
      }

      return imgTag;
    } catch {
      return '<span class="error">Image plugin error</span>';
    }
  }
};

module.exports = ImagePlugin;
