/**
 * LocaleUtils - Utility functions for handling browser locale and internationalization
 */

/**
 * Language quality pair from Accept-Language header parsing
 */
interface LanguageQuality {
  locale: string;
  quality: number;
}

/**
 * Date format option for user preferences
 */
interface DateFormatOption {
  value: string;
  label: string;
  description: string;
}

/**
 * Supported locale information
 */
interface SupportedLocale {
  code: string;
  name: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

/**
 * Locale utilities for handling browser locale and internationalization
 */
class LocaleUtils {
  /**
   * Parse Accept-Language header to get preferred locale
   * @param acceptLanguage - Accept-Language header value
   * @returns Best matching locale (e.g., 'en-US', 'fr-FR', 'de-DE')
   */
  static parseAcceptLanguage(acceptLanguage: string): string {
    if (!acceptLanguage || typeof acceptLanguage !== 'string') {
      return 'en-US'; // Default fallback
    }

    // Parse Accept-Language header format: "en-US,en;q=0.9,fr;q=0.8"
    const languages: LanguageQuality[] = acceptLanguage
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
   * @param locale - Raw locale string
   * @returns Normalized locale (e.g., 'en-US', 'fr-FR')
   */
  static normalizeLocale(locale: string): string {
    if (!locale) return 'en-US';

    // Handle common formats
    const normalized = locale.toLowerCase().replace('_', '-');

    // Map common language codes to full locales
    const localeMap: Record<string, string> = {
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
   * @param locale - Locale string (e.g., 'en-US')
   * @returns Date format pattern for user preferences
   */
  static getDateFormatFromLocale(locale: string): string {
    const normalizedLocale = this.normalizeLocale(locale);

    // Map locales to common date format preferences
    const dateFormatMap: Record<string, string> = {
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
   * @param locale - Locale string (e.g., 'en-US')
   * @returns Time format preference ('12h' or '24h')
   */
  static getTimeFormatFromLocale(locale: string): '12h' | '24h' {
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
   * @param date - Date to format
   * @param locale - Locale string
   * @returns Formatted date string
   */
  static formatDate(date: Date, locale: string = 'en-US'): string {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    const normalizedLocale = this.normalizeLocale(locale);

    try {
      return date.toLocaleDateString(normalizedLocale);
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Invalid locale '${normalizedLocale}', falling back to en-US`);
      return date.toLocaleDateString('en-US');
    }
  }

  /**
   * Format time using specified locale
   * @param date - Date to format
   * @param locale - Locale string
   * @returns Formatted time string
   */
  static formatTime(date: Date, locale: string = 'en-US'): string {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    const normalizedLocale = this.normalizeLocale(locale);

    try {
      return date.toLocaleTimeString(normalizedLocale);
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Invalid locale '${normalizedLocale}', falling back to en-US`);
      return date.toLocaleTimeString('en-US');
    }
  }

  /**
   * Get available date format options
   * @returns Array of date format options
   */
  static getDateFormatOptions(): DateFormatOption[] {
    return [
      { value: 'auto', label: 'Auto (from locale)', description: 'Use locale-specific format' },
      { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy', description: '12/25/2023 (US format)' },
      { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy', description: '25/12/2023 (European format)' },
      { value: 'dd.MM.yyyy', label: 'dd.MM.yyyy', description: '25.12.2023 (German format)' },
      { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd', description: '2023/12/25 (ISO-style)' },
      { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd', description: '2023-12-25 (ISO date)' },
      { value: 'yyyy-MM-dd HH:mm', label: 'yyyy-MM-dd HH:mm', description: '2023-12-25 14:30 (ISO datetime)' }
    ];
  }

  /**
   * Get supported locales list
   * @returns Array of supported locale objects
   */
  static getSupportedLocales(): SupportedLocale[] {
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

  /**
   * Validate timezone string
   * @param timezone - Timezone to validate
   * @returns True if timezone is valid
   */
  static isValidTimezone(timezone: string): boolean {
    try {
      // Test if timezone is supported by Intl.DateTimeFormat
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get timezone display name
   * @param timezone - Timezone identifier (e.g., 'America/New_York')
   * @param locale - Locale for display name (default: 'en-US')
   * @returns Human-readable timezone name
   */
  static getTimezoneDisplayName(timezone: string, locale: string = 'en-US'): string {
    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: 'long'
      });

      const parts = formatter.formatToParts(new Date());
      const timeZonePart = parts.find(part => part.type === 'timeZoneName');

      return timeZonePart ? timeZonePart.value : timezone;
    } catch {
      return timezone;
    }
  }
}

export default LocaleUtils;

// CommonJS compatibility
module.exports = LocaleUtils;
