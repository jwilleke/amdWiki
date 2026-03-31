/**
 * AuthManager — pluggable authentication provider chain.
 *
 * Registers one or more AuthProviders and delegates authenticate/initiate
 * calls to the appropriate provider. Routes call only AuthManager — never
 * individual providers directly.
 *
 * The `ngdpbase.auth.required-factors` config key defines which providers
 * must be satisfied (in order) for a full login. Currently single-factor
 * only; multi-factor state management is deferred to a future issue.
 *
 * Built-in providers:
 *   - PasswordAuthProvider  (always registered)
 *   - MagicLinkAuthProvider (registered when ngdpbase.auth.magic-link.enabled)
 *
 * Future providers (see #421, #422):
 *   - TotpAuthProvider
 *   - OAuthAuthProvider
 *
 * @see {@link https://github.com/jwilleke/ngdpbase/issues/396}
 */

import BaseManager from './BaseManager';
import type { BackupData } from './BaseManager';
import type { WikiEngine } from '../types/WikiEngine';
import type ConfigurationManager from './ConfigurationManager';
import type {
  AuthProvider,
  AuthInitiateContext,
  AuthVerifyCredentials
} from '../providers/BaseAuthProvider';
import { PasswordAuthProvider } from '../providers/PasswordAuthProvider';
import { MagicLinkAuthProvider } from '../providers/MagicLinkAuthProvider';
import { ConsoleMailProvider } from '../mail/MailProvider';
import { NodemailerMailProvider } from '../mail/NodemailerMailProvider';
import logger from '../utils/logger';

export interface AuthenticateResult {
  success: boolean;
  username?: string;
}

class AuthManager extends BaseManager {
  private providers: Map<string, AuthProvider>;
  private requiredFactors: string[];

  constructor(engine: WikiEngine) {
    super(engine);
    this.providers = new Map();
    this.requiredFactors = ['password'];
  }

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');

    // Always register password provider
    this.providers.set('password', new PasswordAuthProvider(this.engine));
    logger.debug('[AuthManager] Registered provider: password');

    // Register magic-link provider if enabled
    if (configManager?.getProperty('ngdpbase.auth.magic-link.enabled', false)) {
      const ttlMinutes = configManager.getProperty(
        'ngdpbase.auth.magic-link.ttl-minutes', 15
      ) as number;
      const baseUrl = (configManager.getProperty(
        'ngdpbase.auth.magic-link.base-url', ''
      ) as string).replace(/\/$/, '');
      const transport = configManager.getProperty(
        'ngdpbase.auth.magic-link.mail-transport', 'console'
      ) as string;

      const mailProvider = transport === 'smtp'
        ? new NodemailerMailProvider({
          host: configManager.getProperty('ngdpbase.auth.magic-link.smtp.host', '') as string,
          port: configManager.getProperty('ngdpbase.auth.magic-link.smtp.port', 587) as number,
          secure: configManager.getProperty('ngdpbase.auth.magic-link.smtp.secure', false) as boolean,
          user: configManager.getProperty('ngdpbase.auth.magic-link.smtp.user', '') as string,
          pass: configManager.getProperty('ngdpbase.auth.magic-link.smtp.pass', '') as string,
          from: configManager.getProperty('ngdpbase.auth.magic-link.smtp.from', '') as string
        })
        : new ConsoleMailProvider();

      this.providers.set('magic-link', new MagicLinkAuthProvider(this.engine, {
        ttlMs: ttlMinutes * 60_000,
        baseUrl,
        mailProvider
      }));
      logger.info(`[AuthManager] Registered provider: magic-link (transport=${transport}, ttl=${ttlMinutes}min)`);
    }

    // Load required-factors chain
    const factors = configManager?.getProperty('ngdpbase.auth.required-factors', ['password']);
    this.requiredFactors = Array.isArray(factors) ? (factors as string[]) : ['password'];

    logger.info(`[AuthManager] Initialized — required factors: [${this.requiredFactors.join(', ')}]`);
  }

  /**
   * Authenticate using the specified provider.
   * Returns { success, username } — routes need nothing else.
   */
  async authenticate(
    providerId: string,
    credentials: AuthVerifyCredentials
  ): Promise<AuthenticateResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      logger.debug(`[AuthManager] Unknown provider: ${providerId}`);
      return { success: false };
    }

    try {
      const result = await provider.verify(credentials);
      if (!result) return { success: false };
      return { success: true, username: result.username };
    } catch (err) {
      logger.error(`[AuthManager] Error authenticating via ${providerId}:`, err);
      return { success: false };
    }
  }

  /**
   * Initiate a challenge-based auth flow (magic link email, OAuth redirect).
   */
  async initiate(providerId: string, context: AuthInitiateContext): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider?.initiate) {
      logger.debug(`[AuthManager] Provider ${providerId} has no initiate()`);
      return;
    }
    await provider.initiate(context);
  }

  /**
   * Consume a single-use token after the session has been created.
   */
  consumeToken(providerId: string, token: string): void {
    const provider = this.providers.get(providerId);
    provider?.consumeToken?.(token);
  }

  /**
   * Get the redirect URL stored with a magic-link token.
   * Returns '/' if provider or token not found.
   */
  getMagicLinkRedirect(token: string): string {
    const provider = this.providers.get('magic-link') as MagicLinkAuthProvider | undefined;
    return provider?.getTokenRedirect(token) ?? '/';
  }

  /** Returns the ordered list of required auth factors from config. */
  getRequiredFactors(): string[] {
    return this.requiredFactors;
  }

  /** Returns true if the provider is registered. */
  isEnabled(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  /** Returns all registered providers (for admin UI). */
  getProviders(): AuthProvider[] {
    return Array.from(this.providers.values());
  }

  backup(): Promise<BackupData> {
    return Promise.resolve({
      managerName: 'AuthManager',
      timestamp: new Date().toISOString(),
      data: { providers: Array.from(this.providers.keys()) }
    });
  }

  restore(_backupData: BackupData): Promise<void> {
    return Promise.resolve();
  }
}

export default AuthManager;

// CommonJS compatibility
module.exports = AuthManager;
