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
export class LocalStorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly defaultExpiresIn: number;
  private readonly logger = new Logger(LocalStorageService.name);

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.endpoint = this.config.get<string>(
      'LOCALSTACK_ENDPOINT',
      'http://localhost:4566'
    );
    this.defaultExpiresIn = parseInt(
      this.config.get<string>('S3_SIGNED_URL_EXPIRES', '3600'),
      10
    );

    this.client = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      // Disable request checksums for LocalStack compatibility
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });

    this.logger.log(
      `LocalStorageService initialized with endpoint: ${this.endpoint}`
    );
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
      url: `${this.endpoint}/${this.bucket}/${key}`,
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

    const url = await getSignedUrl(this.client, command, {
      expiresIn: options?.expiresIn ?? this.defaultExpiresIn,
    });

    this.logger.debug(`Generated signed URL for key ${key}: ${url}`);
    return url;
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
