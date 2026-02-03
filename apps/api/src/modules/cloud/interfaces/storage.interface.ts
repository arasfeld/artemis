export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface SignedUrlOptions {
  expiresIn?: number;
}

export interface IStorageService {
  upload(
    key: string,
    body: Buffer,
    options?: UploadOptions
  ): Promise<UploadResult>;

  getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn?: number
  ): Promise<{ url: string; key: string }>;

  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
