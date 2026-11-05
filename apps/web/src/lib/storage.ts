import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Neon Object Storage S3-compatible client.
 * Neon provides S3-compatible storage endpoints for branches.
 * Note: Neon Object Storage requires path-style addressing (`forcePathStyle: true`).
 */
export function getStorageClient(): S3Client | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 || process.env.NEON_STORAGE_ENDPOINT;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.NEON_STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.NEON_STORAGE_SECRET_KEY;
  const region = process.env.AWS_REGION || 'us-east-2';

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Neon Object Storage strictly requires path-style addressing
  });
}

export async function uploadToStorage(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<{ url: string; key: string } | null> {
  const client = getStorageClient();
  const bucket = process.env.NEON_STORAGE_BUCKET || process.env.AWS_BUCKET_NAME || 'wayfarer-images';
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 || process.env.NEON_STORAGE_ENDPOINT;

  if (!client || !endpoint) {
    return null;
  }

  const cleanKey = key.replace(/^\/+/, '');
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: body,
      ContentType: contentType,
    })
  );

  // Construct path-style URL: ${endpoint}/${bucket}/${key}
  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  const publicUrl = `${cleanEndpoint}/${bucket}/${cleanKey}`;
  return { url: publicUrl, key: cleanKey };
}

