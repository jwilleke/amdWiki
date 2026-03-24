import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

export interface ThemeInfo {
  name: string;
  description: string;
  version: string;
  author: string;
  /** Optional Google Fonts (or other) stylesheet URLs to inject in <head> */
  fonts?: string[];
}

export interface ThemePaths {
  /** Active theme name (folder name under themes/) */
  activeTheme: string;
  /** Path to themes/core.css — structural CSS shared by all themes */
  coreCssPath: string;
  /** Path to the active theme's CSS variables file */
  variablesCssPath: string;
  /** Path to the active theme's logo image */
  logoPath: string;
  /** Path to the active theme's favicon */
  faviconPath: string;
  /** Path to the shared location plugin CSS */
  locationCssPath: string;
  /** Metadata from theme.json */
  themeInfo: ThemeInfo | null;
  /** Optional font stylesheet URLs from theme.json fonts[] */
  fontUrls: string[];
}

const DEFAULT_THEME_INFO: ThemeInfo = {
  name: 'Default',
  description: 'Default ngdpbase theme',
  version: '1.0.0',
  author: 'ngdpbase'
};

export class ThemeManager {
  private themesDir: string;
  private activeTheme: string;
  private _paths: ThemePaths;

  constructor(activeTheme: string, themesDir: string) {
    this.themesDir = themesDir;
    this.activeTheme = (typeof activeTheme === 'string' && activeTheme) ? activeTheme : 'default';
    this._paths = this.buildPaths();
  }

  private loadThemeInfo(): ThemeInfo | null {
    const themeJsonPath = path.join(this.themesDir, this.activeTheme, 'theme.json');
    try {
      const raw = fs.readFileSync(themeJsonPath, 'utf8');
      return JSON.parse(raw) as ThemeInfo;
    } catch {
      logger.warn(`Could not load theme.json for theme "${this.activeTheme}" — using defaults`);
      return DEFAULT_THEME_INFO;
    }
  }

  private buildPaths(): ThemePaths {
    const t = this.activeTheme;
    const themeInfo = this.loadThemeInfo();
    const assetsDir = path.join(this.themesDir, t, 'assets');
    return {
      activeTheme: t,
      coreCssPath: '/themes/core.css',
      variablesCssPath: this.resolveVariablesCssPath(t),
      logoPath: this.resolveLogoPath(assetsDir, t),
      faviconPath: this.resolveFaviconPath(assetsDir, t),
      locationCssPath: '/themes/plugins/location.css',
      themeInfo,
      fontUrls: Array.isArray(themeInfo?.fonts) ? themeInfo.fonts : []
    };
  }

  /** Resolve variables.css path — falls back to empty placeholder if theme has no custom vars */
  private resolveVariablesCssPath(t: string): string {
    const themeVars = path.join(this.themesDir, t, 'css', 'variables.css');
    if (fs.existsSync(themeVars)) {
      return `/themes/${t}/css/variables.css`;
    }
    // No theme-specific variables — core.css generic Bootstrap mappings are sufficient
    return '/themes/core-variables-empty.css';
  }

  /** Resolve favicon path: prefer favicon.svg → favicon.png → public fallback */
  private resolveFaviconPath(assetsDir: string, t: string): string {
    const candidates = ['favicon.svg', 'favicon.png'];
    for (const file of candidates) {
      if (fs.existsSync(path.join(assetsDir, file))) {
        return `/themes/${t}/assets/${file}`;
      }
    }
    // No theme favicon — fall back to the public-level default
    return '/favicon.svg';
  }

  /** Resolve logo path: prefer logo.svg → logo.png → favicon.svg → favicon.png → public fallback */
  private resolveLogoPath(assetsDir: string, t: string): string {
    const candidates = ['logo.svg', 'logo.png', 'favicon.svg', 'favicon.png'];
    for (const file of candidates) {
      if (fs.existsSync(path.join(assetsDir, file))) {
        return `/themes/${t}/assets/${file}`;
      }
    }
    // No theme logo or favicon — fall back to the public-level default
    return '/favicon.svg';
  }

  get paths(): ThemePaths {
    return this._paths;
  }

  /** List all available themes (subdirs of themes/ that have a theme.json) */
  static listAvailable(themesDir: string): string[] {
    try {
      return fs
        .readdirSync(themesDir)
        .filter((entry) => {
          const themeJson = path.join(themesDir, entry, 'theme.json');
          return (
            fs.statSync(path.join(themesDir, entry)).isDirectory() &&
            fs.existsSync(themeJson)
          );
        });
    } catch {
      return ['default'];
    }
  }
}
