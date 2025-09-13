/**
 * ImagePlugin for amdWiki
 * Implements inline image functionality similar to JSPWiki's Image plugin
 * Syntax: [{Image src='path/to/image.jpg' alt='description' width='200' height='150'}]
 */

const ImagePlugin = {
  name: 'ImagePlugin',

  /**
   * Execute the plugin
   * @param {Object} context - Rendering context
   * @param {Object} params - Plugin parameters object (parsed from syntax)
   * @returns {string} HTML output
   */
  execute(context, params) {
    try {
      // Get configuration (if available)
      const config = context.engine ? context.engine.getConfig() : null;
      const defaultAlt = config ? config.get('features.images.defaultAlt', 'Uploaded image') : 'Uploaded image';
      const defaultClass = config ? config.get('features.images.defaultClass', 'wiki-image') : 'wiki-image';

      // Build the image tag
      let imgTag = '<img';

      // Required src attribute
      if (params.src) {
        // Handle relative paths - assume images are in /public/images or /attachments
        let src = params.src;
        if (!src.startsWith('http') && !src.startsWith('/')) {
          // Relative path - prepend with /images/
          src = `/images/${src}`;
        }
        // If it's already an absolute path starting with /images/, use as-is
        imgTag += ` src="${src}"`;
      } else {
        return '<span class="error">Image plugin: src attribute is required</span>';
      }

      // Optional attributes
      if (params.alt) {
        imgTag += ` alt="${params.alt}"`;
      } else {
        imgTag += ` alt="${defaultAlt}"`;
      }

      if (params.width) {
        imgTag += ` width="${params.width}"`;
      }

      if (params.height) {
        imgTag += ` height="${params.height}"`;
      }

      if (params.title) {
        imgTag += ` title="${params.title}"`;
      }

      if (params.border) {
        imgTag += ` style="border: ${params.border}px solid #ccc;"`;
      }

      // Handle class and style
      let styles = [];
      let classes = [];

      if (params.class) {
        classes.push(params.class);
      } else {
        classes.push(defaultClass);
      }

      if (params.style) {
        styles.push(params.style);
      }

      // Add alignment styles
      if (params.align) {
        const align = params.align.toLowerCase();
        if (align === 'left') {
          styles.push('float: left; margin-right: 10px;');
        } else if (align === 'right') {
          styles.push('float: right; margin-left: 10px;');
        } else if (align === 'center') {
          styles.push('display: block; margin: 0 auto;');
        }
      }

      if (classes.length > 0) {
        imgTag += ` class="${classes.join(' ')}"`;
      }

      if (styles.length > 0) {
        const existingStyle = imgTag.includes('style=') ? imgTag.match(/style="([^"]*)"/)[1] + ';' : '';
        imgTag = imgTag.replace(/style="[^"]*"/, '');
        imgTag += ` style="${existingStyle}${styles.join(' ')}"`;
      }

      imgTag += ' />';

      // Handle link wrapping
      if (params.link) {
        imgTag = `<a href="${params.link}" target="_blank">${imgTag}</a>`;
      }

      // Handle caption
      if (params.caption) {
        const alignClass = params.align ? `text-${params.align.toLowerCase()}` : '';
        imgTag = `
<div class="image-plugin-container ${alignClass}" style="margin-bottom: 10px;">
  ${imgTag}
  <div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">${params.caption}</div>
</div>`;
      }

      return imgTag;
    } catch (error) {
      console.error('ImagePlugin error:', error);
      return '<span class="error">Image plugin error</span>';
    }
  }
};

module.exports = ImagePlugin;