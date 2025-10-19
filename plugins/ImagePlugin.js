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
 *     - float (default): Allows text wrapping around image
 *     - block: Image in its own block, no text wrapping
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

const ImagePlugin = {
  name: "Image",

  /**
   * Execute the plugin
   * @param {Object} context - Rendering context
   * @param {Object} params - Plugin parameters object (parsed from syntax)
   * @returns {string} HTML output
   */
  execute(context, params) {
    try {
      // Get configuration from ConfigurationManager
      const configManager = context.engine?.getManager("ConfigurationManager");
      const defaultAlt =
        configManager?.getProperty(
          "amdwiki.features.images.defaultAlt",
          "Uploaded image"
        ) || "Uploaded image";
      const defaultClass =
        configManager?.getProperty(
          "amdwiki.features.images.defaultClass",
          "wiki-image"
        ) || "wiki-image";

      // Build the image tag
      let imgTag = "<img";

      // Required src attribute
      if (params.src) {
        // Handle relative paths - assume images are in /public/images or /attachments
        let src = params.src;

        // If it starts with http or /, use as-is (absolute path or URL)
        if (!src.startsWith("http") && !src.startsWith("/")) {
          // Relative path - prepend with /images/
          src = `/images/${src}`;
        }
        // If path already starts with /images/, use as-is (no double prefix)

        imgTag += ` src="${src}"`;
      } else {
        return '<span class="error">Image plugin: src attribute is required</span>';
      }

      // Optional attributes
      // If alt is not provided, use caption as alt (if available)
      if (params.alt) {
        imgTag += ` alt="${params.alt}"`;
      } else if (params.caption) {
        imgTag += ` alt="${params.caption}"`;
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

      // Handle class and style
      let styles = [];
      let classes = [];

      if (params.class) {
        classes.push(params.class);
      } else {
        classes.push(defaultClass);
      }

      // Add border style if specified
      if (params.border) {
        styles.push(`border: ${params.border}px solid #ccc;`);
      }

      if (params.style) {
        styles.push(params.style);
      }

      // Handle display parameter
      // display="float" - allows text wrapping (default for left/right align)
      // display="block" - image in its own block, no text wrapping
      // display="inline" - image flows inline with text
      // display="full" - full-width image
      const display = params.display ? params.display.toLowerCase() : "float";
      const align = params.align ? params.align.toLowerCase() : null;

      // Apply display and alignment styles
      if (display === "full") {
        // Full-width display - ignores align parameter
        styles.push("display: block; width: 100%; height: auto; margin: 10px 0;");
      } else if (display === "block") {
        // Block display - no text wrapping
        if (align === "left") {
          styles.push("display: block; margin-right: auto; margin-bottom: 10px;");
        } else if (align === "right") {
          styles.push("display: block; margin-left: auto; margin-bottom: 10px;");
        } else if (align === "center" || !align) {
          styles.push("display: block; margin: 0 auto 10px auto;");
        }
      } else if (display === "inline") {
        // Inline display - flows with text
        if (align === "left") {
          styles.push("vertical-align: middle; margin-right: 5px;");
        } else if (align === "right") {
          styles.push("vertical-align: middle; margin-left: 5px;");
        } else {
          styles.push("vertical-align: middle;");
        }
      } else {
        // Float display (default) - allows text wrapping
        if (align === "left") {
          styles.push("float: left; margin-right: 10px; margin-bottom: 10px;");
        } else if (align === "right") {
          styles.push("float: right; margin-left: 10px; margin-bottom: 10px;");
        } else if (align === "center") {
          styles.push("display: block; margin: 0 auto 10px auto;");
        }
      }

      if (classes.length > 0) {
        imgTag += ` class="${classes.join(" ")}"`;
      }

      if (styles.length > 0) {
        imgTag += ` style="${styles.join(" ")}"`;
      }

      imgTag += " />";

      // Handle link wrapping
      if (params.link) {
        imgTag = `<a href="${params.link}" target="_blank">${imgTag}</a>`;
      }

      // Handle caption
      if (params.caption) {
        const alignClass = params.align
          ? `text-${params.align.toLowerCase()}`
          : "";

        // Build container styles based on display mode
        let containerStyles = [];

        if (display === "full") {
          containerStyles.push("display: block; width: 100%; margin: 10px 0;");
        } else if (display === "block") {
          if (align === "left") {
            containerStyles.push("display: block; margin-right: auto; margin-bottom: 10px;");
          } else if (align === "right") {
            containerStyles.push("display: block; margin-left: auto; margin-bottom: 10px;");
          } else {
            containerStyles.push("display: block; margin: 0 auto 10px auto;");
          }
        } else if (display === "inline") {
          containerStyles.push("display: inline-block; vertical-align: middle;");
          if (align === "left") {
            containerStyles.push("margin-right: 5px;");
          } else if (align === "right") {
            containerStyles.push("margin-left: 5px;");
          }
        } else {
          // Float display
          if (align === "left") {
            containerStyles.push("float: left; margin-right: 10px; margin-bottom: 10px;");
          } else if (align === "right") {
            containerStyles.push("float: right; margin-left: 10px; margin-bottom: 10px;");
          } else {
            containerStyles.push("display: block; margin: 0 auto 10px auto;");
          }
        }

        imgTag = `
<div class="image-plugin-container ${alignClass}" style="${containerStyles.join(" ")}">
  ${imgTag}
  <div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">${params.caption}</div>
</div>`;
      }

      return imgTag;
    } catch (error) {
      console.error("Image plugin error:", error);
      return '<span class="error">Image plugin error</span>';
    }
  },
};

module.exports = ImagePlugin;
