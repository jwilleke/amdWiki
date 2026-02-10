/**
 * Location plugin for amdWiki
 * Displays locations with map links and optional embedded map previews.
 *
 * Syntax: [{Location name='Paris, France'}]
 *         [{Location coords='48.8566,2.3522'}]
 *         [{Location name='Eiffel Tower' embed=true}]
 *
 * Parameters:
 *   name (optional) - Location name (geocoded by map service)
 *   coords (optional) - Latitude,longitude (e.g., "48.8566,2.3522")
 *   embed (optional) - Show embedded map preview (default: false)
 *   zoom (optional) - Map zoom level 1-18 (default: 13)
 *   width (optional) - Embedded map width (default: "100%")
 *   height (optional) - Embedded map height (default: "300px")
 *   provider (optional) - Link type: geo (RFC 5870), osm, google, apple (default: osm)
 *   label (optional) - Custom display text for link
 *
 * Note: Either 'name' or 'coords' must be provided.
 */

import type { SimplePlugin, PluginContext, PluginParams } from './types';

interface ConfigManager {
  getProperty(key: string, defaultValue: string): string;
}

interface MapProvider {
  name: string;
  linkUrl: (lat: number, lon: number, zoom: number) => string;
  searchUrl: (query: string) => string;
  embedUrl?: (lat: number, lon: number, zoom: number) => string;
}

interface LocationParams extends PluginParams {
  name?: string;
  coords?: string;
  embed?: boolean | string;
  zoom?: number | string;
  width?: string;
  height?: string;
  provider?: string;
  label?: string;
}

const providers: Record<string, MapProvider> = {
  geo: {
    name: 'Maps App',
    linkUrl: (lat, lon, zoom) => `geo:${lat},${lon}?z=${zoom}`,
    searchUrl: (query) => `geo:0,0?q=${encodeURIComponent(query)}`
    // geo: URIs are not embeddable
  },
  osm: {
    name: 'OpenStreetMap',
    linkUrl: (lat, lon, zoom) =>
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`,
    searchUrl: (query) =>
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`,
    embedUrl: (lat, lon, zoom) => {
      // Calculate bounding box based on zoom level
      // Approximate degrees per pixel at zoom level
      const delta = 0.01 * Math.pow(2, 13 - zoom);
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;
    }
  },
  google: {
    name: 'Google Maps',
    linkUrl: (lat, lon, zoom) => `https://www.google.com/maps?q=${lat},${lon}&z=${zoom}`,
    searchUrl: (query) => `https://www.google.com/maps/search/${encodeURIComponent(query)}`
    // Google Maps embed requires API key, not provided by default
  },
  apple: {
    name: 'Apple Maps',
    linkUrl: (lat, lon, zoom) => `https://maps.apple.com/?ll=${lat},${lon}&z=${zoom}`,
    searchUrl: (query) => `https://maps.apple.com/?q=${encodeURIComponent(query)}`
    // Apple Maps embed not publicly available
  }
};

/**
 * Sanitize string for HTML attribute use
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const LocationPlugin: SimplePlugin = {
  name: 'Location',
  description: 'Display locations with map links and embedded previews',
  author: 'amdWiki',
  version: '1.0.0',

  /**
   * Execute the plugin
   * @param context - Rendering context
   * @param params - Plugin parameters object (parsed from syntax)
   * @returns HTML output
   */
  execute(context: PluginContext, params: PluginParams): string {
    try {
      const opts = params as LocationParams;

      // Get configuration from ConfigurationManager
      const configManager = context.engine?.getManager(
        'ConfigurationManager'
      ) as ConfigManager | undefined;
      const defaultProvider =
        configManager?.getProperty('amdwiki.location.defaultProvider', 'osm') || 'osm';

      // Parse parameters
      const name = opts.name;
      const coords = opts.coords;
      const embed = opts.embed === true || opts.embed === 'true';
      const zoomValue = opts.zoom !== undefined ? Number(opts.zoom) : 13;
      const zoom = Math.min(18, Math.max(1, isNaN(zoomValue) ? 13 : zoomValue));
      const width = (opts.width as string) || '100%';
      const height = (opts.height as string) || '300px';
      const providerKey = ((opts.provider as string) || defaultProvider).toLowerCase();
      const customLabel = opts.label;

      // Validate: need either name or coords
      if (!name && !coords) {
        return '<span class="location-error">Location: Missing name or coords parameter</span>';
      }

      // Get provider (fallback to osm if invalid)
      const provider = providers[providerKey] || providers.osm;
      let lat: number | undefined;
      let lon: number | undefined;
      let displayLabel = customLabel || name || coords;

      // Parse coordinates if provided
      if (coords) {
        const parts = coords.split(',').map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lon = parts[1];

          // Validate coordinate ranges
          if (lat < -90 || lat > 90) {
            return '<span class="location-error">Location: Latitude must be between -90 and 90</span>';
          }
          if (lon < -180 || lon > 180) {
            return '<span class="location-error">Location: Longitude must be between -180 and 180</span>';
          }

          if (!customLabel && !name) {
            displayLabel = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          }
        } else {
          return '<span class="location-error">Location: Invalid coords format (use lat,lon)</span>';
        }
      }

      // Generate URL
      let url: string;
      if (lat !== undefined && lon !== undefined) {
        url = provider.linkUrl(lat, lon, zoom);
      } else {
        url = provider.searchUrl(name!);
      }

      // Build HTML output
      const escapedLabel = escapeHtml(displayLabel || '');
      const escapedUrl = escapeHtml(url);
      const escapedProviderName = escapeHtml(provider.name);

      const icon = '<i class="fas fa-map-marker-alt"></i>';
      const link = `<a href="${escapedUrl}" target="_blank" rel="noopener" class="location-link" title="Open in ${escapedProviderName}">${icon} ${escapedLabel}</a>`;

      // Handle embedded map
      if (embed && lat !== undefined && lon !== undefined) {
        if (provider.embedUrl) {
          const embedSrc = escapeHtml(provider.embedUrl(lat, lon, zoom));
          const escapedWidth = escapeHtml(width);
          const escapedHeight = escapeHtml(height);

          return `<div class="location-plugin-container">
  <div class="location-header">${link}</div>
  <div class="location-map" style="width: ${escapedWidth}; height: ${escapedHeight};">
    <iframe src="${embedSrc}" style="border: 0; width: 100%; height: 100%;" loading="lazy" allowfullscreen></iframe>
  </div>
</div>`;
        } else {
          // Provider doesn't support embed, show link with note
          return `<div class="location-plugin-container">
  <div class="location-header">${link}</div>
  <div class="location-map-unavailable">Embedded map not available for ${escapedProviderName}</div>
</div>`;
        }
      }

      return `<span class="location-plugin">${link}</span>`;
    } catch {
      return '<span class="location-error">Location plugin error</span>';
    }
  }
};

module.exports = LocationPlugin;
