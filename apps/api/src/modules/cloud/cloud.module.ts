import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_SERVICE, SMS_SERVICE, STORAGE_SERVICE } from './interfaces';
import { ConsoleEmailService } from './providers/email/console-email.service';
import { LocalEmailService } from './providers/email/local-email.service';
import { SesEmailService } from './providers/email/ses-email.service';
import { ConsoleSmsService } from './providers/sms/console-sms.service';
import { LocalStorageService } from './providers/storage/local-storage.service';
import { S3StorageService } from './providers/storage/s3-storage.service';

@Module({})
export class CloudModule {
  private static readonly logger = new Logger(CloudModule.name);

  static register(): DynamicModule {
    const storageProvider: Provider = {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useLocalStack = config.get('USE_LOCALSTACK', 'true') === 'true';
        const nodeEnv = config.get('NODE_ENV', 'development');

        if (nodeEnv === 'production' || !useLocalStack) {
          this.logger.log('Using S3StorageService (AWS)');
          return new S3StorageService(config);
        }

        this.logger.log('Using LocalStorageService (LocalStack)');
        return new LocalStorageService(config);
      },
    };

    const emailProvider: Provider = {
      provide: EMAIL_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useLocalStack = config.get('USE_LOCALSTACK', 'true') === 'true';
        const nodeEnv = config.get('NODE_ENV', 'development');

        if (nodeEnv === 'production' || !useLocalStack) {
          this.logger.log('Using SesEmailService (AWS)');
          return new SesEmailService(config);
        }

        // Try LocalStack, fall back to console if not available
        try {
          this.logger.log('Using LocalEmailService (LocalStack)');
          return new LocalEmailService(config);
        } catch {
          this.logger.warn(
            'LocalStack not available, using ConsoleEmailService'
          );
          return new ConsoleEmailService();
        }
      },
    };

    const smsProvider: Provider = {
      provide: SMS_SERVICE,
      inject: [ConfigService],
      useFactory: () => {
        // SMS is always console for now (placeholder for future SNS implementation)
        this.logger.log('Using ConsoleSmsService (placeholder)');
        return new ConsoleSmsService();
      },
    };

    return {
      module: CloudModule,
      imports: [ConfigModule],
      providers: [storageProvider, emailProvider, smsProvider],
      exports: [STORAGE_SERVICE, EMAIL_SERVICE, SMS_SERVICE],
    };
  }
}
