import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IStorageService,
  SignedUrlOptions,
  UploadOptions,
  UploadResult,
} from '../../interfaces';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly defaultExpiresIn: number;
  private readonly logger = new Logger(S3StorageService.name);

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.defaultExpiresIn = parseInt(
      this.config.get<string>('S3_SIGNED_URL_EXPIRES', '3600'),
      10
    );

    this.client = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY'
        ),
      },
    });

    this.logger.log('S3StorageService initialized for production');
  }

  async upload(
    key: string,
    body: Buffer,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: options?.contentType,
      Metadata: options?.metadata,
    });

    await this.client.send(command);

    return {
      key,
      url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
    };
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn?: number
  ): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: expiresIn ?? this.defaultExpiresIn,
    });

    return { url, key };
  }

  async getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options?.expiresIn ?? this.defaultExpiresIn,
    });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
