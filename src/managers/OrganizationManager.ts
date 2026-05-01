import path from 'path';
import { promises as fs } from 'fs';
import BaseManager from './BaseManager.js';
import logger from '../utils/logger.js';
import type { WikiEngine } from '../types/WikiEngine.js';
import type ConfigurationManager from './ConfigurationManager.js';
import type { Organization, OrganizationUpdate, PostalAddress, ContactPoint } from '../types/Organization.js';
import type { OrganizationProvider } from '../types/OrganizationProvider.js';

interface OrganizationProviderConstructor {
  new (engine: WikiEngine): OrganizationProvider;
}

/**
 * Subset of install-form data this manager needs to seed the anchor org.
 * Kept narrow so InstallService and tests can pass plain objects without
 * importing the full InstallData type.
 */
export interface OrganizationSeedData {
  orgName: string;
  orgLegalName?: string;
  orgDescription?: string;
  orgFoundingDate?: string;
  orgUrl?: string;
  orgAddressLocality?: string;
  orgAddressRegion?: string;
  orgAddressCountry?: string;
  /** Email used for the install's primary technical contact. */
  adminEmail?: string;
  /** Filename to write under storagedir, e.g. "acme-corporation.json". */
  filename?: string;
}

/**
 * OrganizationManager — canonical core record for organizations (#617).
 *
 * Owns the on-disk Organization records end-to-end. The install's anchor
 * org is identified by `ngdpbase.application.organization.file`; the rest
 * of the org files in `storagedir` are additional orgs in a multi-org
 * install. UserManager's hardcoded `'ngdpbase-platform'` literal is
 * untouched in this iteration — that follow-up wires JSON-LD sync into
 * `getInstallOrg()`.
 */
class OrganizationManager extends BaseManager {
  readonly description = 'Canonical Organization records (#617)';

  private provider: OrganizationProvider | null = null;
  private providerClass?: string;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('OrganizationManager requires ConfigurationManager');
    }

    const storageDir = configManager.getResolvedDataPath(
      'ngdpbase.application.organization.storagedir',
      './data/organizations'
    );
    const preflight = this.preflightConfiguredPath(
      'ngdpbase.application.organization.storagedir',
      storageDir
    );
    if (!preflight.ok) {
      logger.warn('🏢 OrganizationManager initialized in degraded mode (storage path unavailable)');
      return;
    }

    const defaultProvider = configManager.getProperty(
      'ngdpbase.application.organization.provider.default',
      'fileorganizationprovider'
    ) as string;
    const providerName = configManager.getProperty(
      'ngdpbase.application.organization.provider',
      defaultProvider
    ) as string;
    this.providerClass = this.normalizeProviderName(providerName);

    logger.info(`🏢 Loading organization provider: ${providerName} (${this.providerClass})`);
    const mod = await import(/* @vite-ignore */ `../providers/${this.providerClass}.js`) as { default: OrganizationProviderConstructor };
    this.provider = new mod.default(this.engine);
    await this.provider.initialize();

    // Startup invariant: if install is complete and an anchor file is named,
    // the file MUST exist. Fail fast — operator deleted or never provisioned it.
    const installComplete = await this.isInstallComplete(storageDir);
    const anchorFile = configManager.getProperty(
      'ngdpbase.application.organization.file',
      ''
    ) as string;
    if (installComplete && anchorFile) {
      const anchorPath = path.join(storageDir, anchorFile);
      const exists = await fileExists(anchorPath);
      if (!exists) {
        throw new Error(
          `[OrganizationManager] Install is complete but the anchor organization file is missing: ${anchorPath}. ` +
          'Restore it from backup, or unset \'ngdpbase.application.organization.file\' if the anchor was intentionally removed.'
        );
      }
    }

    logger.info(`🏢 OrganizationManager initialized (${(await this.provider.list()).length} orgs)`);
  }

  /** Provider accessor, mainly for tests. */
  getProvider(): OrganizationProvider | null {
    return this.provider;
  }

  /** Return the install's anchor org, or null if no `.file` is configured. */
  async getInstallOrg(): Promise<Organization | null> {
    const provider = this.requireProvider();
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    const filename = configManager?.getProperty('ngdpbase.application.organization.file', '') as string;
    if (!filename) return null;
    return provider.getByFile(filename);
  }

  async getById(id: string): Promise<Organization | null> {
    return this.requireProvider().getById(id);
  }

  async getByFile(filename: string): Promise<Organization | null> {
    return this.requireProvider().getByFile(filename);
  }

  async list(): Promise<Organization[]> {
    return this.requireProvider().list();
  }

  async create(org: Organization, filename?: string): Promise<Organization> {
    return this.requireProvider().create(org, filename);
  }

  async update(id: string, patch: OrganizationUpdate): Promise<Organization | null> {
    return this.requireProvider().update(id, patch);
  }

  async delete(id: string): Promise<boolean> {
    return this.requireProvider().delete(id);
  }

  /**
   * Seed the install's anchor org from the install form (or, if `data` is
   * omitted, from `ngdpbase.application.organization.*` config). Idempotent:
   * if an org file with the configured filename already exists, this is a
   * no-op.
   */
  async seedFromConfig(data?: OrganizationSeedData): Promise<Organization | null> {
    const provider = this.requireProvider();
    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('OrganizationManager.seedFromConfig requires ConfigurationManager');
    }

    const seed: OrganizationSeedData = data ?? this.readSeedFromConfig(configManager);

    const filename = seed.filename
      || (configManager.getProperty('ngdpbase.application.organization.file', '') as string)
      || `${slugify(seed.orgName)}.json`;

    const existing = await provider.getByFile(filename);
    if (existing) {
      logger.debug(`🏢 Anchor org file ${filename} already present; skipping seed`);
      return existing;
    }

    const id = seed.orgUrl
      || (configManager.getProperty('ngdpbase.application.organization.url', '') as string)
      || (configManager.getProperty('ngdpbase.base-url', '') as string)
      || `urn:ngdpbase:org:${slugify(seed.orgName)}`;

    const org: Organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': id,
      name: seed.orgName,
      url: seed.orgUrl || id,
      ...(seed.orgLegalName ? { legalName: seed.orgLegalName } : {}),
      ...(seed.orgDescription ? { description: seed.orgDescription } : {}),
      ...(seed.orgFoundingDate ? { foundingDate: seed.orgFoundingDate } : {}),
      address: buildAddress(seed),
      contactPoint: buildContactPoints(seed)
    };

    return provider.create(org, filename);
  }

  /**
   * Probe for installation-complete state without depending on InstallService
   * (which is constructed AFTER managers init). Mirrors InstallService.getInstallCompleteFilePath().
   */
  private async isInstallComplete(_storageDir: string): Promise<boolean> {
    const instanceDataFolder = process.env.FAST_STORAGE || process.env.INSTANCE_DATA_FOLDER || './data';
    const resolved = path.isAbsolute(instanceDataFolder)
      ? instanceDataFolder
      : path.join(process.cwd(), instanceDataFolder);
    return fileExists(path.join(resolved, '.install-complete'));
  }

  private readSeedFromConfig(configManager: ConfigurationManager): OrganizationSeedData {
    const get = (key: string): string => (configManager.getProperty(key, '') as string) || '';
    return {
      orgName: get('ngdpbase.application.organization.name'),
      orgLegalName: get('ngdpbase.application.organization.legal-name'),
      orgDescription: get('ngdpbase.application.organization.description'),
      orgFoundingDate: get('ngdpbase.application.organization.founding-date'),
      orgUrl: get('ngdpbase.application.organization.url'),
      orgAddressLocality: get('ngdpbase.application.organization.address-locality'),
      orgAddressRegion: get('ngdpbase.application.organization.address-region'),
      orgAddressCountry: get('ngdpbase.application.organization.address-country'),
      adminEmail: get('ngdpbase.application.organization.contact-email'),
      filename: get('ngdpbase.application.organization.file')
    };
  }

  private requireProvider(): OrganizationProvider {
    if (!this.provider) {
      throw new Error('OrganizationManager: no provider available (initialization failed or storage path unavailable)');
    }
    return this.provider;
  }

  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Organization provider name cannot be empty');
    }
    const lower = providerName.toLowerCase();
    const known: Record<string, string> = {
      fileorganizationprovider: 'FileOrganizationProvider',
      jsonorganizationprovider: 'FileOrganizationProvider'
    };
    if (known[lower]) return known[lower];
    return lower
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }
}

function buildAddress(seed: OrganizationSeedData): PostalAddress | undefined {
  if (!seed.orgAddressLocality && !seed.orgAddressRegion && !seed.orgAddressCountry) {
    return undefined;
  }
  return {
    '@type': 'PostalAddress',
    addressLocality: seed.orgAddressLocality || null,
    addressRegion: seed.orgAddressRegion || null,
    addressCountry: seed.orgAddressCountry || null
  };
}

function buildContactPoints(seed: OrganizationSeedData): ContactPoint[] | undefined {
  if (!seed.adminEmail) return undefined;
  return [
    {
      '@type': 'ContactPoint',
      contactType: 'Technical Support',
      email: seed.adminEmail
    }
  ];
}

function slugify(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'organization';
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export default OrganizationManager;
