/**
 * EmailManager — shared outbound email transport.
 *
 * A single manager used by any feature that needs to send email:
 * magic-link auth, notification escalation, server-error alerts, etc.
 *
 * Two providers, selected by `ngdpbase.mail.provider`:
 *   console  — prints to server log (default / development)
 *   smtp     — sends via NodemailerMailProvider; works with any SMTP relay
 *              (Gmail, Resend, SendGrid, SES, self-hosted Postfix, …)
 *
 * Implements the MailProvider interface so it can be passed directly to
 * MagicLinkAuthProvider without any changes to that class.
 *
 * @see docs/admin/email-setup.md for operator setup instructions
 * @see {@link https://github.com/jwilleke/ngdpbase/issues/456}
 */

import BaseManager from './BaseManager.js';
import type { BackupData } from './BaseManager.js';
import type { WikiEngine } from '../types/WikiEngine.js';
import type ConfigurationManager from './ConfigurationManager.js';
import type { MailMessage, MailProvider } from '../mail/MailProvider.js';
import { ConsoleMailProvider } from '../mail/MailProvider.js';
import { NodemailerMailProvider } from '../mail/NodemailerMailProvider.js';
import logger from '../utils/logger.js';

class EmailManager extends BaseManager implements MailProvider {
  private provider: MailProvider;
  private providerName: string;
  private from: string;
  private enabled: boolean;

  constructor(engine: WikiEngine) {
    super(engine);
    this.provider = new ConsoleMailProvider();
    this.providerName = 'console';
    this.from = '';
    this.enabled = false;
  }

  async initialize(config: Record<string, unknown> = {}): Promise<void> {
    await super.initialize(config);

    const configManager = this.engine.getManager<ConfigurationManager>('ConfigurationManager');

    this.enabled = (configManager?.getProperty('ngdpbase.mail.enabled', false) as boolean) ?? false;
    const providerKey = (configManager?.getProperty('ngdpbase.mail.provider', 'console') as string) ?? 'console';
    const globalFrom = (configManager?.getProperty('ngdpbase.mail.from', '') as string) ?? '';

    if (providerKey === 'smtp') {
      const smtpHost = (configManager?.getProperty('ngdpbase.mail.provider.smtp.host', '') as string) ?? '';
      const smtpPort = (configManager?.getProperty('ngdpbase.mail.provider.smtp.port', 587) as number) ?? 587;
      const smtpSecure = (configManager?.getProperty('ngdpbase.mail.provider.smtp.secure', false) as boolean) ?? false;
      const smtpUser = (configManager?.getProperty('ngdpbase.mail.provider.smtp.user', '') as string) ?? '';
      const smtpPass = (configManager?.getProperty('ngdpbase.mail.provider.smtp.pass', '') as string) ?? '';
      const smtpFrom = (configManager?.getProperty('ngdpbase.mail.provider.smtp.from', '') as string) ?? '';

      // Resolve effective from address: smtp.from overrides global mail.from
      this.from = smtpFrom || globalFrom;

      // Validate required SMTP fields
      if (!smtpHost) {
        logger.error('[EmailManager] ngdpbase.mail.provider.smtp.host is not configured — emails will fail. See docs/admin/email-setup.md');
      }
      if (!this.from) {
        logger.error('[EmailManager] No from address configured (set ngdpbase.mail.provider.smtp.from or ngdpbase.mail.from) — emails will be rejected. See docs/admin/email-setup.md');
      }
      if (!smtpUser) {
        logger.warn('[EmailManager] ngdpbase.mail.provider.smtp.user is empty — most SMTP relays require authentication');
      }
      if (!smtpPass) {
        logger.warn('[EmailManager] ngdpbase.mail.provider.smtp.pass is empty — most SMTP relays require authentication');
      }

      this.provider = new NodemailerMailProvider({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser || undefined,
        pass: smtpPass || undefined,
        from: this.from
      });
      this.providerName = 'smtp';
    } else {
      // console provider — always warn so operators know mail is not being sent
      this.from = globalFrom;
      this.provider = new ConsoleMailProvider();
      this.providerName = 'console';
      logger.warn(
        '[EmailManager] provider is "console" — emails will be printed to the server log, not sent. ' +
        'Set ngdpbase.mail.provider: "smtp" for production. See docs/admin/email-setup.md'
      );
    }

    logger.info(`[EmailManager] Initialized provider=${this.providerName} enabled=${this.enabled}` +
      (this.from ? ` from=${this.from}` : ''));
  }

  /**
   * Send an email. Injects the configured from address if the message omits it.
   */
  async send(message: MailMessage): Promise<void> {
    const outgoing: MailMessage = this.from && !(message as MailMessage & { from?: string }).from
      ? { ...message, from: this.from } as MailMessage
      : message;
    await this.provider.send(outgoing);
  }

  /**
   * Convenience wrapper — build and send a message in one call.
   */
  async sendTo(to: string, subject: string, text: string, html?: string): Promise<void> {
    await this.send({ to, subject, text, ...(html ? { html } : {}) });
  }

  /** Name of the active provider: 'console' | 'smtp' */
  getProviderName(): string {
    return this.providerName;
  }

  /** Effective from address (smtp.from or mail.from) */
  getFrom(): string {
    return this.from;
  }

  /** Whether ngdpbase.mail.enabled is true */
  isEnabled(): boolean {
    return this.enabled;
  }

  async shutdown(): Promise<void> {
    await super.shutdown();
  }

  backup(): Promise<BackupData> {
    return Promise.resolve({
      managerName: 'EmailManager',
      timestamp: new Date().toISOString(),
      data: { provider: this.providerName, enabled: this.enabled }
    });
  }

  restore(_backupData: BackupData): Promise<void> {
    return Promise.resolve();
  }
}

export default EmailManager;

