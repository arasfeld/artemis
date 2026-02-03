import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  EmailAddress,
  EmailOptions,
  IEmailService,
  SendResult,
  TemplatedEmailOptions,
} from '../../interfaces';
import { getTemplate } from '../../templates';

@Injectable()
export class ConsoleEmailService implements IEmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  constructor() {
    this.logger.warn(
      'ConsoleEmailService initialized - emails will be logged to console only'
    );
  }

  async send(options: EmailOptions): Promise<SendResult> {
    const messageId = uuidv4();
    const toAddresses = this.normalizeAddresses(options.to);

    this.logger.log('='.repeat(60));
    this.logger.log('EMAIL (console only)');
    this.logger.log('='.repeat(60));
    this.logger.log(`Message ID: ${messageId}`);
    this.logger.log(`To: ${toAddresses.map((a) => a.email).join(', ')}`);
    this.logger.log(`Subject: ${options.subject}`);
    if (options.replyTo) {
      this.logger.log(`Reply-To: ${options.replyTo.email}`);
    }
    this.logger.log('-'.repeat(60));
    if (options.text) {
      this.logger.log('Text Body:');
      this.logger.log(options.text);
    }
    if (options.html) {
      this.logger.log('HTML Body (truncated):');
      this.logger.log(options.html.substring(0, 500) + '...');
    }
    this.logger.log('='.repeat(60));

    return {
      messageId,
      success: true,
    };
  }

  async sendTemplated(options: TemplatedEmailOptions): Promise<SendResult> {
    const template = getTemplate(options.template);
    if (!template) {
      throw new Error(`Template not found: ${options.template}`);
    }

    const { html, subject, text } = template(options.data);

    return this.send({
      html,
      replyTo: options.replyTo,
      subject,
      text,
      to: options.to,
    });
  }

  private normalizeAddresses(
    addresses: EmailAddress | EmailAddress[]
  ): EmailAddress[] {
    return Array.isArray(addresses) ? addresses : [addresses];
  }
}
