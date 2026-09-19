import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class StorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigError";
  }
}

export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

export const PRESIGN_EXPIRES_IN_SECONDS = 300;

/**
 * Reads S3-compatible storage config. Works with AWS S3 and Cloudflare R2 —
 * for R2 set S3_ENDPOINT to `https://<account>.r2.cloudflarestorage.com` and
 * S3_REGION=auto.
 */
export function getStorageConfig(): StorageConfig {
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new StorageConfigError("S3-compatible storage is not configured");
  }

  return {
    bucket,
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

export function isStorageConfigured(): boolean {
  try {
    getStorageConfig();
    return true;
  } catch {
    return false;
  }
}

let cached: { key: string; client: S3Client } | null = null;

function getClient(config: StorageConfig): S3Client {
  const cacheKey = [
    config.region,
    config.endpoint ?? "",
    config.accessKeyId,
    config.forcePathStyle ? "1" : "0",
  ].join("|");

  if (cached && cached.key === cacheKey) return cached.client;

  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  cached = { key: cacheKey, client };
  return client;
}

export async function createPresignedUpload(params: {
  key: string;
  contentType: string;
  contentLength: number;
  expiresIn?: number;
}): Promise<string> {
  const config = getStorageConfig();
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: params.key,
    ContentType: params.contentType,
    // Signed into the request: the client must upload exactly this many bytes.
    ContentLength: params.contentLength,
  });

  return getSignedUrl(getClient(config), command, {
    expiresIn: params.expiresIn ?? PRESIGN_EXPIRES_IN_SECONDS,
  });
}

export interface ObjectHead {
  contentLength: number;
  contentType?: string;
}

export async function headObject(key: string): Promise<ObjectHead> {
  const config = getStorageConfig();
  const result = await getClient(config).send(
    new HeadObjectCommand({ Bucket: config.bucket, Key: key }),
  );
  return {
    contentLength: result.ContentLength ?? 0,
    contentType: result.ContentType,
  };
}

export async function getObjectText(key: string, maxBytes: number): Promise<string> {
  const config = getStorageConfig();
  const result = await getClient(config).send(
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
  );
  if (!result.Body) return "";

  const bytes = await result.Body.transformToByteArray();
  return Buffer.from(bytes.slice(0, maxBytes)).toString("utf8");
}

export function buildPublicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  const bucket = process.env.S3_BUCKET ?? "bucket";
  return `s3://${bucket}/${key}`;
}
