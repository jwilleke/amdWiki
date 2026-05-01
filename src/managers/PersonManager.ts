import crypto from 'crypto';
import BaseManager from './BaseManager.js';
import logger from '../utils/logger.js';
import type { WikiEngine } from '../types/WikiEngine.js';
import type ConfigurationManager from './ConfigurationManager.js';
import type { Person, PersonUpdate } from '../types/Person.js';
import type { PersonProvider } from '../types/PersonProvider.js';
import type { User } from '../types/User.js';

interface PersonProviderConstructor {
  new (engine: WikiEngine): PersonProvider;
}

interface UserManagerLike {
  getUser(username: string): Promise<Omit<User, 'password'> | undefined>;
}

/**
 * PersonManager — canonical core record for persons (#617).
 *
 * Each User has at most one paired Person record. Migration is lazy:
 * the first time `getByUserIdentifier(username)` is called for a user
 * without a paired Person, one is created from the User's email/displayName.
 *
 * UserManager is NOT modified — it does not auto-sync changes into Person
 * records. That linkage is intentionally deferred to a follow-up issue.
 */
class PersonManager extends BaseManager {
  readonly description = 'Canonical Person records (#617)';

  private provider: PersonProvider | null = null;
  private providerClass?: string;

  constructor(engine: WikiEngine) {
    super(engine);
  }

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');
    if (!configManager) {
      throw new Error('PersonManager requires ConfigurationManager');
    }

    const storageDir = configManager.getResolvedDataPath(
      'ngdpbase.application.persons.storagedir',
      './data/persons'
    );
    const preflight = this.preflightConfiguredPath(
      'ngdpbase.application.persons.storagedir',
      storageDir
    );
    if (!preflight.ok) {
      logger.warn('👤 PersonManager initialized in degraded mode (storage path unavailable)');
      return;
    }

    const defaultProvider = configManager.getProperty(
      'ngdpbase.application.persons.provider.default',
      'filepersonprovider'
    ) as string;
    const providerName = configManager.getProperty(
      'ngdpbase.application.persons.provider',
      defaultProvider
    ) as string;
    this.providerClass = this.normalizeProviderName(providerName);

    logger.info(`👤 Loading person provider: ${providerName} (${this.providerClass})`);
    const mod = await import(/* @vite-ignore */ `../providers/${this.providerClass}.js`) as { default: PersonProviderConstructor };
    this.provider = new mod.default(this.engine);
    await this.provider.initialize();

    logger.info(`👤 PersonManager initialized (${(await this.provider.list()).length} persons)`);
  }

  getProvider(): PersonProvider | null {
    return this.provider;
  }

  async getById(id: string): Promise<Person | null> {
    return this.requireProvider().getById(id);
  }

  async getByIdentifier(identifier: string): Promise<Person | null> {
    return this.requireProvider().getByIdentifier(identifier);
  }

  async list(): Promise<Person[]> {
    return this.requireProvider().list();
  }

  async create(person: Person): Promise<Person> {
    return this.requireProvider().create(person);
  }

  async update(id: string, patch: PersonUpdate): Promise<Person | null> {
    return this.requireProvider().update(id, patch);
  }

  async delete(id: string): Promise<boolean> {
    return this.requireProvider().delete(id);
  }

  /**
   * Lazy-migration entry point.
   *
   * Returns the Person paired to `username`. If none exists and a matching
   * User does, a Person is created from the User's email/displayName and
   * persisted. Subsequent calls return the persisted record.
   */
  async getByUserIdentifier(username: string): Promise<Person | null> {
    const provider = this.requireProvider();
    const existing = await provider.getByIdentifier(username);
    if (existing) return existing;

    const userManager = this.engine.getManager<UserManagerLike>('UserManager');
    if (!userManager) return null;
    const user = await userManager.getUser(username);
    if (!user) return null;

    const person = personFromUser(user);
    return provider.create(person);
  }

  private requireProvider(): PersonProvider {
    if (!this.provider) {
      throw new Error('PersonManager: no provider available (initialization failed or storage path unavailable)');
    }
    return this.provider;
  }

  private normalizeProviderName(providerName: string): string {
    if (!providerName) {
      throw new Error('Person provider name cannot be empty');
    }
    const lower = providerName.toLowerCase();
    const known: Record<string, string> = {
      filepersonprovider: 'FilePersonProvider',
      jsonpersonprovider: 'FilePersonProvider'
    };
    if (known[lower]) return known[lower];
    return lower
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }
}

function personFromUser(user: Omit<User, 'password'>): Person {
  const id = `urn:uuid:${crypto.randomUUID()}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': id,
    identifier: user.username,
    ...(user.displayName ? { name: user.displayName } : {}),
    ...(user.email ? { email: user.email } : {})
  };
}

export default PersonManager;
