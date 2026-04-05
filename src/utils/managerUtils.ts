/**
 * Shared utilities for manager-to-plugin content methods.
 *
 * Managers import from here to implement methods like toMarqueeText() or
 * toSlideshowContent() in a consistent way. Plugin code never imports from
 * this file — plugins only receive the formatted output string.
 */

/**
 * Common options for manager methods that feed plugin content.
 * Passed as a raw key=value object from the plugin's fetch= parameter.
 * Domain-specific options (e.g. alertLevel, colorCode) are handled per-manager.
 */
export interface ManagerFetchOptions {
  /** Max items to return. 0 = unlimited. */
  limit?: number;
  /** Field name to sort by — each manager defines valid values. */
  sortBy?: string;
  /** Sort direction. */
  sortOrder?: 'asc' | 'desc';
  /** ISO date string — include only items at or after this date. */
  since?: string;
  /** ISO date string — include only items before this date. */
  before?: string;
}

/**
 * Parse a raw key=value args object (from a plugin fetch= parameter) into
 * a typed ManagerFetchOptions. Unknown keys are silently ignored — each
 * manager is responsible for reading its own domain-specific keys from the
 * same raw object.
 *
 * Convenience shorthand: `sort='date-desc'` expands to
 * `{ sortBy: 'date', sortOrder: 'desc' }`.
 *
 * @example
 * // fetch='HansDataManager.toMarqueeText(limit=3,sort=date-desc)'
 * // raw = { limit: '3', sort: 'date-desc' }
 * const opts = parseManagerFetchOptions(raw);
 * // opts = { limit: 3, sortBy: 'date', sortOrder: 'desc' }
 */
export function parseManagerFetchOptions(raw: Record<string, string> = {}): ManagerFetchOptions {
  const opts: ManagerFetchOptions = {};

  if (raw.limit !== undefined) {
    const n = parseInt(raw.limit, 10);
    if (!isNaN(n) && n >= 0) opts.limit = n;
  }

  if (raw.sortBy !== undefined) {
    opts.sortBy = raw.sortBy;
  }

  if (raw.sortOrder !== undefined) {
    opts.sortOrder = raw.sortOrder === 'desc' ? 'desc' : 'asc';
  }

  if (raw.sort !== undefined) {
    // Convenience: 'field-asc' or 'field-desc' or just 'field'
    const parts = raw.sort.split('-');
    opts.sortBy    = parts[0];
    opts.sortOrder = parts[1] === 'desc' ? 'desc' : 'asc';
  }

  if (raw.since  !== undefined) opts.since  = raw.since;
  if (raw.before !== undefined) opts.before = raw.before;

  return opts;
}

// CommonJS compatibility
module.exports = { parseManagerFetchOptions };
