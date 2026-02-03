import { ConfigService } from '@nestjs/config';

export interface AwsConfig {
  accessKeyId?: string;
  region: string;
  secretAccessKey?: string;
}

export interface S3Config {
  bucket: string;
  signedUrlExpires: number;
}

export interface SesConfig {
  fromEmail: string;
  fromName: string;
}

export interface CloudConfig {
  aws: AwsConfig;
  localStackEndpoint: string;
  s3: S3Config;
  ses: SesConfig;
  useLocalStack: boolean;
}

export function getCloudConfig(config: ConfigService): CloudConfig {
  return {
    aws: {
      accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
      region: config.get('AWS_REGION', 'us-east-1'),
      secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
    },
    localStackEndpoint: config.get(
      'LOCALSTACK_ENDPOINT',
      'http://localhost:4566'
    ),
    s3: {
      bucket: config.getOrThrow('S3_BUCKET'),
      signedUrlExpires: parseInt(
        config.get('S3_SIGNED_URL_EXPIRES', '3600'),
        10
      ),
    },
    ses: {
      fromEmail: config.getOrThrow('SES_FROM_EMAIL'),
      fromName: config.get('SES_FROM_NAME', 'Artemis'),
    },
    useLocalStack: config.get('USE_LOCALSTACK', 'true') === 'true',
  };
}
