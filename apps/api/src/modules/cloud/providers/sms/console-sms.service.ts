import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ISmsService, SmsOptions, SmsResult } from '../../interfaces';

@Injectable()
export class ConsoleSmsService implements ISmsService {
  private readonly logger = new Logger(ConsoleSmsService.name);

  constructor() {
    this.logger.warn(
      'ConsoleSmsService initialized - SMS will be logged to console only'
    );
  }

  async send(options: SmsOptions): Promise<SmsResult> {
    const messageId = uuidv4();

    this.logger.log('='.repeat(60));
    this.logger.log('SMS (console only)');
    this.logger.log('='.repeat(60));
    this.logger.log(`Message ID: ${messageId}`);
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`Message: ${options.message}`);
    this.logger.log('='.repeat(60));

    return {
      messageId,
      success: true,
    };
  }
}
