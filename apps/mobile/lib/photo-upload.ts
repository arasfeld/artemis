import { File } from 'expo-file-system';
import type { GetUploadUrlResponse } from '@/types/api';

/**
 * Get the MIME type for a file based on its URI
 */
export function getMimeType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

/**
 * Get a filename from a URI
 */
export function getFilename(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] || `photo-${Date.now()}.jpg`;
}

/**
 * Upload a file to S3 using a presigned URL
 * Uses XMLHttpRequest with ArrayBuffer for better header control
 */
export async function uploadToS3(
  localUri: string,
  presignedUrl: string,
  contentType: string
): Promise<void> {
  // Create a File instance from the URI
  const file = new File(localUri);

  // Read as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Upload using XMLHttpRequest for better header control
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        console.error('Upload failed:', xhr.responseText);
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.send(arrayBuffer);
  });
}

/**
 * Upload a photo using the presigned URL flow
 * Returns the S3 key that should be used with confirmPhotoUpload
 */
export async function uploadPhoto(
  localUri: string,
  getUploadUrl: (params: {
    contentType: string;
    filename: string;
  }) => Promise<GetUploadUrlResponse>
): Promise<string> {
  const filename = getFilename(localUri);
  const contentType = getMimeType(localUri);

  // Get presigned upload URL from our API
  const { key, url } = await getUploadUrl({ contentType, filename });

  // Upload directly to S3
  await uploadToS3(localUri, url, contentType);

  return key;
}
