/**
 * Shared image HTML rendering utility for wiki plugins.
 *
 * Used by ImagePlugin and AttachPlugin to produce consistent image markup.
 * Callers are responsible for escaping any user-provided values before passing them in.
 */

export interface ImageRenderOpts {
  /** Resolved image URL (pre-escaped if needed) */
  url: string;
  /** Alt text (pre-escaped if needed) */
  alt: string;
  /** Caption text (pre-escaped if needed) */
  caption?: string;
  /** Width attribute */
  width?: string | number;
  /** Height attribute */
  height?: string | number;
  /** Alignment: left | right | center */
  align?: string | null;
  /** Display mode: block (default) | float | inline | full */
  display?: string;
  /** Border width in pixels */
  border?: string | number;
  /** Custom inline CSS styles */
  style?: string;
  /** CSS class (defaults to 'wiki-image') */
  cssClass?: string;
  /** Title attribute */
  title?: string;
  /** If set, wraps the image in an anchor with this href */
  link?: string;
  /** Target attribute for the link anchor (no default) */
  linkTarget?: string;
  /** CSS class for the link anchor */
  linkClass?: string;
}

/**
 * Build image HTML from resolved options.
 *
 * Produces an <img> tag with optional display/alignment styles, optional <a>
 * link wrapper, and optional caption container matching the wiki image style.
 */
export function renderImageHtml(opts: ImageRenderOpts): string {
  const display = opts.display ? opts.display.toLowerCase() : 'block';
  const align = opts.align ? opts.align.toLowerCase() : null;

  // --- img element styles ---
  const styles: string[] = [];
  if (opts.border) styles.push(`border: ${opts.border}px solid #ccc;`);
  if (opts.style) styles.push(opts.style);

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
    // float
    if (align === 'left') styles.push('float: left; margin-right: 10px; margin-bottom: 10px;');
    else if (align === 'right') styles.push('float: right; margin-left: 10px; margin-bottom: 10px;');
    else styles.push('display: block; margin: 0 auto 10px auto;');
  }

  const cssClass = opts.cssClass || 'wiki-image';
  const classAttr = ` class="${cssClass}"`;
  const styleAttr = styles.length ? ` style="${styles.join(' ')}"` : '';
  const widthAttr = opts.width ? ` width="${opts.width}"` : '';
  const heightAttr = opts.height ? ` height="${opts.height}"` : '';
  const titleAttr = opts.title ? ` title="${opts.title}"` : '';

  let imgTag = `<img src="${opts.url}" alt="${opts.alt}"${titleAttr}${classAttr}${styleAttr}${widthAttr}${heightAttr} />`;

  // --- optional link wrapper ---
  if (opts.link) {
    const targetAttr = opts.linkTarget ? ` target="${opts.linkTarget}"` : '';
    const linkClassAttr = opts.linkClass ? ` class="${opts.linkClass}"` : '';
    imgTag = `<a href="${opts.link}"${targetAttr}${linkClassAttr}>${imgTag}</a>`;
  }

  // --- optional caption container ---
  if (opts.caption) {
    const alignClass = align ? `text-${align}` : '';
    const containerStyles: string[] = [];

    if (display === 'full') {
      containerStyles.push('display: block; width: 100%; margin: 10px 0;');
    } else if (display === 'block') {
      if (align === 'left') containerStyles.push('display: block; margin-right: auto; margin-bottom: 10px;');
      else if (align === 'right') containerStyles.push('display: block; margin-left: auto; margin-bottom: 10px;');
      else containerStyles.push('display: block; margin: 0 auto 10px auto;');
    } else if (display === 'inline') {
      containerStyles.push('display: inline-block; vertical-align: middle;');
      if (align === 'left') containerStyles.push('margin-right: 5px;');
      else if (align === 'right') containerStyles.push('margin-left: 5px;');
    } else {
      // float
      if (align === 'left') containerStyles.push('float: left; margin-right: 10px; margin-bottom: 10px;');
      else if (align === 'right') containerStyles.push('float: right; margin-left: 10px; margin-bottom: 10px;');
      else containerStyles.push('display: block; margin: 0 auto 10px auto;');
    }

    const containerStyleAttr = containerStyles.length ? ` style="${containerStyles.join(' ')}"` : '';
    imgTag = `\n<div class="image-plugin-container ${alignClass}"${containerStyleAttr}>\n  ${imgTag}\n  <div class="image-caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">${opts.caption}</div>\n</div>`;
  }

  return imgTag;
}
