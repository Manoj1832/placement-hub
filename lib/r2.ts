import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
  isPublic = false
) {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: isPublic ? "public-read" : "private",
    })
  );
  const baseUrl = process.env.R2_PUBLIC_URL;
  return isPublic ? `${baseUrl}/${key}` : null;
}

export async function getPresignedUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }),
    { expiresIn }
  );
}
