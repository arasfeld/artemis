import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailAddress,
  EmailOptions,
  IEmailService,
  SendResult,
  TemplatedEmailOptions,
} from '../../interfaces';
import { getTemplate } from '../../templates';

@Injectable()
export class LocalEmailService implements IEmailService {
  private readonly client: SESClient;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly endpoint: string;
  private readonly logger = new Logger(LocalEmailService.name);

  constructor(private readonly config: ConfigService) {
    this.fromEmail = this.config.getOrThrow<string>('SES_FROM_EMAIL');
    this.fromName = this.config.get<string>('SES_FROM_NAME', 'Artemis');
    this.endpoint = this.config.get<string>(
      'LOCALSTACK_ENDPOINT',
      'http://localhost:4566'
    );

    this.client = new SESClient({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });

    this.logger.log(
      `LocalEmailService initialized with endpoint: ${this.endpoint}`
    );
  }

  async send(options: EmailOptions): Promise<SendResult> {
    const toAddresses = this.normalizeAddresses(options.to);

    const command = new SendEmailCommand({
      Source: `${this.fromName} <${this.fromEmail}>`,
      Destination: {
        ToAddresses: toAddresses.map((addr) =>
          addr.name ? `${addr.name} <${addr.email}>` : addr.email
        ),
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(options.html && {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
          }),
          ...(options.text && {
            Text: {
              Data: options.text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ...(options.replyTo && {
        ReplyToAddresses: [
          options.replyTo.name
            ? `${options.replyTo.name} <${options.replyTo.email}>`
            : options.replyTo.email,
        ],
      }),
    });

    try {
      const result = await this.client.send(command);
      this.logger.log(
        `Email sent to LocalStack SES: ${result.MessageId}`,
        `To: ${toAddresses.map((a) => a.email).join(', ')}`,
        `Subject: ${options.subject}`
      );
      return {
        messageId: result.MessageId ?? 'unknown',
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to send email to LocalStack', error);
      throw error;
    }
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
