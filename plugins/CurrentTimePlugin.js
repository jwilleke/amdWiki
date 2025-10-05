/**
 * CurrentTimePlugin - JSPWiki-style plugin for amdWiki
 * Displays current date/time with customizable formatting
 *
 * Respects user preferences for:
 * - Locale (from profile settings)
 * - Timezone (from profile settings)
 * - Date Format (from profile settings)
 * - Time Format (12h/24h from profile settings)
 *
 * Syntax examples:
 * [{CurrentTimePlugin}] - Uses user preferences
 * [{CurrentTimePlugin format='yyyy-MM-dd HH:mm:ss'}] - Custom format
 * [{CurrentTimePlugin format='hh:mm a'}] - Custom time format
 * [{CurrentTimePlugin format='EEEE, MMMM d, yyyy'}] - Custom date format
 */

const CurrentTimePlugin = {
  name: 'CurrentTimePlugin',
  description: 'Displays current date and time with user locale/timezone preferences',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param {Object} context - Wiki context containing user preferences
   * @param {Object} params - Plugin parameters
   * @returns {string} Formatted date/time string
   */
  execute(context, params) {
    try {
      // Get user preferences from context
      const userPrefs = context?.userContext?.preferences || {};

      // Get locale, timezone, and format preferences
      const locale = userPrefs.locale || 'en-US';
      const timezone = userPrefs.timezone || 'UTC';
      const timeFormat = userPrefs.timeFormat || '12h'; // '12h' or '24h'
      const dateFormat = userPrefs.dateFormat || 'MM/dd/yyyy';

      // Get current time
      const now = new Date();

      // If a custom format is specified, use it
      if (params.format) {
        return this.formatWithPattern(now, params.format, locale, timezone, timeFormat === '12h');
      }

      // Otherwise, use user's preferences
      return this.formatWithUserPreferences(now, locale, timezone, timeFormat, dateFormat);

    } catch (error) {
      console.error('[CurrentTimePlugin] Error:', error);
      return new Date().toLocaleString('en-US');
    }
  },

  /**
   * Format date/time using user preferences
   * @param {Date} date - Date to format
   * @param {string} locale - User's locale preference
   * @param {string} timezone - User's timezone preference
   * @param {string} timeFormat - '12h' or '24h'
   * @param {string} dateFormat - User's date format preference
   * @returns {string} Formatted date/time
   */
  formatWithUserPreferences(date, locale, timezone, timeFormat, dateFormat) {
    try {
      // Use Intl.DateTimeFormat for proper locale/timezone support
      const options = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: timeFormat === '12h'
      };

      const formatter = new Intl.DateTimeFormat(locale, options);
      return formatter.format(date);

    } catch (error) {
      console.error('[CurrentTimePlugin] Format error:', error);
      return date.toLocaleString('en-US');
    }
  },

  /**
   * Format date/time with custom pattern (Java SimpleDateFormat-style)
   * @param {Date} date - Date to format
   * @param {string} pattern - Format pattern
   * @param {string} locale - Locale for formatting
   * @param {string} timezone - Timezone for formatting
   * @param {boolean} hour12 - Use 12-hour format
   * @returns {string} Formatted date/time
   */
  formatWithPattern(date, pattern, locale, timezone, hour12) {
    try {
      // Convert date to specified timezone
      const options = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: hour12,
        weekday: 'long'
      };

      const formatter = new Intl.DateTimeFormat(locale, options);
      const parts = formatter.formatToParts(date);

      // Extract parts
      const partMap = {};
      parts.forEach(part => {
        partMap[part.type] = part.value;
      });

      // Get full month and weekday names
      const monthNameFormatter = new Intl.DateTimeFormat(locale, {
        month: 'long',
        timeZone: timezone
      });
      const monthName = monthNameFormatter.format(date);

      const monthShortFormatter = new Intl.DateTimeFormat(locale, {
        month: 'short',
        timeZone: timezone
      });
      const monthShort = monthShortFormatter.format(date);

      const weekdayNameFormatter = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        timeZone: timezone
      });
      const weekdayName = weekdayNameFormatter.format(date);

      // Build replacements for common Java SimpleDateFormat patterns
      const year = partMap.year || '';
      const month = partMap.month || '';
      const day = partMap.day || '';
      const hour = partMap.hour || '';
      const minute = partMap.minute || '';
      const second = partMap.second || '';
      const weekday = weekdayName || partMap.weekday || '';
      const dayPeriod = partMap.dayPeriod || ''; // AM/PM

      // Replace pattern tokens
      // IMPORTANT: Replace longer patterns first to avoid partial replacements
      let result = pattern;

      // Weekday patterns (do these early before other single-letter replacements)
      result = result.replace(/EEEE/g, weekday);           // Full weekday name
      result = result.replace(/EEE/g, weekday.slice(0, 3)); // Short weekday name

      // Month patterns (longer patterns first)
      result = result.replace(/MMMM/g, monthName);        // Full month name
      result = result.replace(/MMM/g, monthShort);         // Short month name
      result = result.replace(/MM/g, month);               // 2-digit month
      result = result.replace(/\bM\b/g, parseInt(month, 10));  // Month without leading zero (word boundary)

      // Year patterns
      result = result.replace(/yyyy/g, year);
      result = result.replace(/yy/g, year.slice(-2));

      // Day patterns
      result = result.replace(/dd/g, day);                 // 2-digit day
      result = result.replace(/\bd\b/g, parseInt(day, 10));    // Day without leading zero (word boundary)

      // Hour patterns
      result = result.replace(/HH/g, hour);                // 2-digit hour (24h format)
      result = result.replace(/hh/g, hour);                // 2-digit hour (12h format)
      result = result.replace(/\bH\b/g, parseInt(hour, 10));   // Hour without leading zero (word boundary)
      result = result.replace(/\bh\b/g, parseInt(hour, 10));   // Hour without leading zero (word boundary)

      // Minute patterns
      result = result.replace(/mm/g, minute);              // 2-digit minute
      result = result.replace(/\bm\b/g, parseInt(minute, 10)); // Minute without leading zero (word boundary)

      // Second patterns
      result = result.replace(/ss/g, second);              // 2-digit second
      result = result.replace(/\bs\b/g, parseInt(second, 10)); // Second without leading zero (word boundary)

      // AM/PM pattern (do this last to avoid conflicts)
      result = result.replace(/\ba\b/g, dayPeriod);            // AM/PM marker (word boundary)

      return result;

    } catch (error) {
      console.error('[CurrentTimePlugin] Pattern format error:', error);

      // Fallback to basic formatting
      try {
        const options = {
          timeZone: timezone,
          hour12: hour12
        };
        return date.toLocaleString(locale, options);
      } catch (fallbackError) {
        return date.toLocaleString('en-US');
      }
    }
  },

  /**
   * Plugin initialization (JSPWiki-style)
   * @param {Object} engine - Wiki engine instance
   */
  initialize(engine) {
    console.log(`Initializing ${this.name} v${this.version}`);
  }
};

module.exports = CurrentTimePlugin;
