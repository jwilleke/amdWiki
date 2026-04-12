/**
 * Shape of a sist2 document's `_source` field as stored in Elasticsearch.
 *
 * All fields are optional except `name`, `path`, and `mime` which sist2 always
 * populates. Numeric EXIF fields returned by sist2 are typed as strings because
 * sist2 stores them as keyword/text (e.g. "f/2.8", "1/250").
 */
export interface Sist2Document {
  /** Filename stem — or sequence number string for sub-documents */
  name: string;
  /** Relative path from the sist2 scan root (e.g. "jims/data/photos/family") */
  path: string;
  /** MIME type (e.g. "image/jpeg") */
  mime: string;
  /** File extension without leading dot */
  extension?: string;
  /** File size in bytes */
  size?: number;
  /** Last-modified time as Unix epoch seconds */
  mtime?: number;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /**
   * Thumbnail availability: 0 = no thumbnail generated yet; positive integer =
   * number of thumbnail pages available (images: 1; PDFs/videos: N pages).
   */
  thumbnail?: number;
  /** sist2 scan index integer ID (e.g. 1776001547 for "NAS Scan") */
  index?: number;
  /** SHA-256 file checksum */
  checksum?: string;
  /** Space-separated user-assigned tags (set via sist2 UI or POST /tag/<id>) */
  tag?: string;
  /** Extracted text content */
  content?: string;
  /** EXIF camera manufacturer */
  exif_make?: string;
  /** EXIF camera model */
  exif_model?: string;
  /** EXIF capture date/time string */
  exif_datetime?: string;
  /** GPS latitude as decimal degrees string */
  exif_gps_latitude_dec?: string;
  /** GPS longitude as decimal degrees string */
  exif_gps_longitude_dec?: string;
  /** EXIF shutter speed (e.g. "1/250") */
  exif_exposure_time?: string;
  /** EXIF aperture (e.g. "f/2.8") */
  exif_fnumber?: string;
  /** EXIF focal length (e.g. "50 mm") */
  exif_focal_length?: string;
  /** EXIF ISO speed rating */
  exif_iso_speed_ratings?: string;
  /** Document author field */
  author?: string;
}
