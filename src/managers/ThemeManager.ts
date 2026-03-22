import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

export interface ThemeInfo {
  name: string;
  description: string;
  version: string;
  author: string;
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
    this.activeTheme = activeTheme || 'default';
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
    return {
      activeTheme: t,
      coreCssPath: '/themes/core.css',
      variablesCssPath: `/themes/${t}/css/variables.css`,
      logoPath: `/themes/${t}/assets/favicon.png`,
      faviconPath: `/themes/${t}/assets/favicon.png`,
      locationCssPath: '/themes/plugins/location.css',
      themeInfo
    };
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
