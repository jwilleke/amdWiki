/**
 * imageTransform — shared image transform pipeline for Asset providers.
 *
 * Wraps sharp with a consistent options interface so all providers
 * (BasicAttachmentProvider, FileSystemMediaProvider, future S3Provider, etc.)
 * generate thumbnails and apply format conversions through a single code path.
 *
 * Part of Epic #405 Phase 6 — Transform pipeline.
 */

import sharp from 'sharp';

/**
 * Options for a single image transform operation.
 */
export interface ImageTransformOptions {
  /** Target width in pixels (omit to skip resizing) */
  width?: number;
  /** Target height in pixels (omit to skip resizing) */
  height?: number;
  /**
   * Resize fit mode (default: 'inside').
   *   inside   — preserve full image, letterbox to fit bounds
   *   cover    — crop to fill bounds exactly
   *   contain  — letterbox with background fill
   *   fill     — stretch to exact bounds (may distort)
   */
  fit?: 'inside' | 'cover' | 'contain' | 'fill';
  /** Output format (default: 'jpeg') */
  format?: 'jpeg' | 'webp' | 'png';
  /** Compression quality 1–100 (default: 85; ignored for png) */
  quality?: number;
}

/**
 * Transform an image using sharp.
 *
 * Accepts either a Buffer (e.g. a freshly uploaded file) or an absolute
 * file path (e.g. a media-library file). Applies EXIF-based auto-rotation
 * before resizing so orientation is always correct regardless of camera model.
 *
 * @param input   - Image buffer or absolute path to the source file
 * @param options - Resize / format options
 * @returns       - Transformed image as a Buffer
 * @throws        - Re-throws sharp errors (caller should handle)
 */
export async function transformImage(
  input: Buffer | string,
  options: ImageTransformOptions
): Promise<Buffer> {
  const { width, height, fit = 'inside', format = 'jpeg', quality = 85 } = options;

  let pipeline = sharp(input).rotate(); // auto-rotate from EXIF Orientation

  if (width && height) {
    pipeline = pipeline.resize(width, height, { fit });
  }

  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else {
    pipeline = pipeline.png();
  }

  return pipeline.toBuffer();
}

/**
 * Parse a size string of the form "WxH" (e.g. "300x300", "150x150").
 *
 * @returns `{ width, height }` on success, or `null` if the string is malformed.
 */
export function parseSize(size: string): { width: number; height: number } | null {
  const sep = size.indexOf('x');
  if (sep < 1) return null;
  const w = parseInt(size.slice(0, sep), 10);
  const h = parseInt(size.slice(sep + 1), 10);
  if (!w || !h || isNaN(w) || isNaN(h) || w < 1 || h < 1) return null;
  return { width: w, height: h };
}
