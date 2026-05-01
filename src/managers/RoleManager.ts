import BaseManager from './BaseManager.js';
import logger from '../utils/logger.js';
import type { WikiEngine } from '../types/WikiEngine.js';
import type ConfigurationManager from './ConfigurationManager.js';
import type { Role, RoleUpdate } from '../types/Role.js';
import type { RoleProvider } from '../types/RoleProvider.js';

interface RoleProviderConstructor {
  new (engine: WikiEngine): RoleProvider;
}

/**
 * RoleManager — canonical core record for OrganizationRole bindings (#617
 * follow-up).
 *
 * One file per (organization, namedPosition) pair. Members of a role are
 * carried as an array of Person `@id` references. Catalog at
 * `ngdpbase.roles.definitions[namedPosition]` is the template at create
 * time; per-record overrides via `additionalProperty[]` are first-class.
 *
 * Iteration 1 (this file) is plumbing only — no UserManager wiring, no
 * PolicyManager swap. CRUD layer that no caller exercises yet.
 */
class RoleManager extends BaseManager {
  readonly description = 'Canonical OrganizationRole records (#617 follow-up)';

  private provider: RoleProvider | null = null;
  private providerClass?: string;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('RoleManager requires ConfigurationManager');
    }

    const storageDir = configManager.getResolvedDataPath(
      'ngdpbase.application.roles.storagedir',
      './data/roles'
    );
    const preflight = this.preflightConfiguredPath(
      'ngdpbase.application.roles.storagedir',
      storageDir
    );
    if (!preflight.ok) {
      logger.warn('🔑 RoleManager initialized in degraded mode (storage path unavailable)');
      return;
    }

    const defaultProvider = configManager.getProperty(
      'ngdpbase.application.roles.provider.default',
      'fileroleprovider'
    ) as string;
    const providerName = configManager.getProperty(
      'ngdpbase.application.roles.provider',
      defaultProvider
    ) as string;
    this.providerClass = this.normalizeProviderName(providerName);

    logger.info(`🔑 Loading role provider: ${providerName} (${this.providerClass})`);
    const mod = await import(/* @vite-ignore */ `../providers/${this.providerClass}.js`) as { default: RoleProviderConstructor };
    this.provider = new mod.default(this.engine);
    await this.provider.initialize();

    logger.info(`🔑 RoleManager initialized (${(await this.provider.list()).length} roles)`);
  }

  /** Provider accessor, mainly for tests. */
  getProvider(): RoleProvider | null {
    return this.provider;
  }

  async getById(id: string): Promise<Role | null> {
    return this.requireProvider().getById(id);
  }

  async getByOrgAndPosition(organizationId: string, namedPosition: string): Promise<Role | null> {
    return this.requireProvider().getByOrgAndPosition(organizationId, namedPosition);
  }

  async listByMember(personId: string): Promise<Role[]> {
    return this.requireProvider().listByMember(personId);
  }

  async list(): Promise<Role[]> {
    return this.requireProvider().list();
  }

  async create(role: Role): Promise<Role> {
    return this.requireProvider().create(role);
  }

  async update(id: string, patch: RoleUpdate): Promise<Role | null> {
    return this.requireProvider().update(id, patch);
  }

  async delete(id: string): Promise<boolean> {
    return this.requireProvider().delete(id);
  }

  private requireProvider(): RoleProvider {
    if (!this.provider) {
      throw new Error('RoleManager: no provider available (initialization failed or storage path unavailable)');
    }
    return this.provider;
  }

  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Role provider name cannot be empty');
    }
    const lower = providerName.toLowerCase();
    const known: Record<string, string> = {
      fileroleprovider: 'FileRoleProvider',
      jsonroleprovider: 'FileRoleProvider'
    };
    if (known[lower]) return known[lower];
    return lower
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }
}

export default RoleManager;
