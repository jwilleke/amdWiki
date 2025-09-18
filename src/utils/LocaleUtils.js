/**
 * LocaleUtils - Utility functions for handling browser locale and internationalization
 */

class LocaleUtils {
  /**
   * Parse Accept-Language header to get preferred locale
   * @param {string} acceptLanguage - Accept-Language header value
   * @returns {string} Best matching locale (e.g., 'en-US', 'fr-FR', 'de-DE')
   */
  static parseAcceptLanguage(acceptLanguage) {
    if (!acceptLanguage || typeof acceptLanguage !== 'string') {
      return 'en-US'; // Default fallback
    }

    // Parse Accept-Language header format: "en-US,en;q=0.9,fr;q=0.8"
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const parts = lang.trim().split(';');
        const locale = parts[0].trim();
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { locale, quality };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality score (highest first)

    // Return the highest quality locale
    const preferred = languages[0]?.locale || 'en-US';

    // Normalize common locale formats
    return this.normalizeLocale(preferred);
  }

  /**
   * Normalize locale string to standard format
   * @param {string} locale - Raw locale string
   * @returns {string} Normalized locale (e.g., 'en-US', 'fr-FR')
   */
  static normalizeLocale(locale) {
    if (!locale) return 'en-US';

    // Handle common formats
    const normalized = locale.toLowerCase().replace('_', '-');

    // Map common language codes to full locales
    const localeMap = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ru': 'ru-RU',
      'ar': 'ar-SA',
      'hi': 'hi-IN'
    };

    // If it's just a language code, expand it
    if (localeMap[normalized]) {
      return localeMap[normalized];
    }

    // If it's already in lang-country format, capitalize country
    const parts = normalized.split('-');
    if (parts.length === 2) {
      return `${parts[0]}-${parts[1].toUpperCase()}`;
    }

    return normalized || 'en-US';
  }

  /**
   * Get date format pattern based on locale
   * @param {string} locale - Locale string (e.g., 'en-US')
   * @returns {string} Date format pattern for user preferences
   */
  static getDateFormatFromLocale(locale) {
    const normalizedLocale = this.normalizeLocale(locale);

    // Map locales to common date format preferences
    const dateFormatMap = {
      'en-US': 'MM/dd/yyyy',      // American: 12/25/2023
      'en-GB': 'dd/MM/yyyy',      // British: 25/12/2023
      'en-CA': 'dd/MM/yyyy',      // Canadian: 25/12/2023
      'fr-FR': 'dd/MM/yyyy',      // French: 25/12/2023
      'de-DE': 'dd.MM.yyyy',      // German: 25.12.2023
      'es-ES': 'dd/MM/yyyy',      // Spanish: 25/12/2023
      'it-IT': 'dd/MM/yyyy',      // Italian: 25/12/2023
      'pt-BR': 'dd/MM/yyyy',      // Brazilian Portuguese: 25/12/2023
      'ja-JP': 'yyyy/MM/dd',      // Japanese: 2023/12/25
      'ko-KR': 'yyyy. MM. dd.',   // Korean: 2023. 12. 25.
      'zh-CN': 'yyyy/MM/dd',      // Chinese: 2023/12/25
      'ru-RU': 'dd.MM.yyyy',      // Russian: 25.12.2023
      'ar-SA': 'dd/MM/yyyy',      // Arabic: 25/12/2023
      'hi-IN': 'dd/MM/yyyy'       // Hindi: 25/12/2023
    };

    return dateFormatMap[normalizedLocale] || dateFormatMap['en-US'];
  }

  /**
   * Get time format preference based on locale
   * @param {string} locale - Locale string (e.g., 'en-US')
   * @returns {string} Time format preference ('12h' or '24h')
   */
  static getTimeFormatFromLocale(locale) {
    const normalizedLocale = this.normalizeLocale(locale);

    // Most of the world uses 24-hour format, but some countries prefer 12-hour
    const twelveHourLocales = [
      'en-US',    // United States
      'en-CA',    // Canada (mixed, but 12h common)
      'en-AU',    // Australia (mixed)
      'en-NZ',    // New Zealand (mixed)
      'en-PH'     // Philippines
    ];

    return twelveHourLocales.includes(normalizedLocale) ? '12h' : '24h';
  }

  /**
   * Format date using specified locale
   * @param {Date} date - Date to format
   * @param {string} locale - Locale string
   * @returns {string} Formatted date string
   */
  static formatDate(date, locale = 'en-US') {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    const normalizedLocale = this.normalizeLocale(locale);

    try {
      return date.toLocaleDateString(normalizedLocale);
    } catch (error) {
      console.warn(`Invalid locale '${normalizedLocale}', falling back to en-US`);
      return date.toLocaleDateString('en-US');
    }
  }

  /**
   * Format time using specified locale
   * @param {Date} date - Date to format
   * @param {string} locale - Locale string
   * @returns {string} Formatted time string
   */
  static formatTime(date, locale = 'en-US') {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    const normalizedLocale = this.normalizeLocale(locale);

    try {
      return date.toLocaleTimeString(normalizedLocale);
    } catch (error) {
      console.warn(`Invalid locale '${normalizedLocale}', falling back to en-US`);
      return date.toLocaleTimeString('en-US');
    }
  }

  /**
   * Get supported locales list
   * @returns {Array} Array of supported locale objects
   */
  static getSupportedLocales() {
    return [
      { code: 'en-US', name: 'English (United States)', dateFormat: 'MM/dd/yyyy', timeFormat: '12h' },
      { code: 'en-GB', name: 'English (United Kingdom)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
      { code: 'fr-FR', name: 'Français (France)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
      { code: 'de-DE', name: 'Deutsch (Deutschland)', dateFormat: 'dd.MM.yyyy', timeFormat: '24h' },
      { code: 'es-ES', name: 'Español (España)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
      { code: 'it-IT', name: 'Italiano (Italia)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
      { code: 'pt-BR', name: 'Português (Brasil)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
      { code: 'ja-JP', name: '日本語 (日本)', dateFormat: 'yyyy/MM/dd', timeFormat: '24h' },
      { code: 'ko-KR', name: '한국어 (대한민국)', dateFormat: 'yyyy. MM. dd.', timeFormat: '24h' },
      { code: 'zh-CN', name: '中文 (中国)', dateFormat: 'yyyy/MM/dd', timeFormat: '24h' },
      { code: 'ru-RU', name: 'Русский (Россия)', dateFormat: 'dd.MM.yyyy', timeFormat: '24h' },
      { code: 'ar-SA', name: 'العربية (السعودية)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' },
      { code: 'hi-IN', name: 'हिन्दी (भारत)', dateFormat: 'dd/MM/yyyy', timeFormat: '24h' }
    ];
  }
}

module.exports = LocaleUtils;