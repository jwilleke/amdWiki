/**
 * NodemailerMailProvider — SMTP mail transport using nodemailer.
 *
 * Configure via app-custom-config.json:
 *   ngdpbase.auth.magic-link.smtp.host
 *   ngdpbase.auth.magic-link.smtp.port
 *   ngdpbase.auth.magic-link.smtp.secure
 *   ngdpbase.auth.magic-link.smtp.user
 *   ngdpbase.auth.magic-link.smtp.pass
 *   ngdpbase.auth.magic-link.smtp.from
 */

import nodemailer from 'nodemailer';
import type { MailMessage, MailProvider } from './MailProvider';
import logger from '../utils/logger';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export class NodemailerMailProvider implements MailProvider {
  private transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(private config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.user && config.pass
        ? { auth: { user: config.user, pass: config.pass } }
        : {})
    });
  }

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {})
    });
    logger.info(`[NodemailerMailProvider] Sent email to ${message.to}: ${message.subject}`);
  }
}
