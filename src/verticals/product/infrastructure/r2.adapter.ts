import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

const endpoint = requiredEnvironmentVariable("R2_ENDPOINT")
const bucket = requiredEnvironmentVariable("R2_BUCKET")
const publicBaseUrl = requiredEnvironmentVariable("R2_PUBLIC_BASE_URL")

const client = new S3Client({
  endpoint,
  region: "auto",
  credentials: {
    accessKeyId: requiredEnvironmentVariable("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnvironmentVariable("R2_SECRET_ACCESS_KEY"),
  },
})

class R2Adapter {
  async upload(key: string, body: Uint8Array, contentType: string): Promise<void> {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    )
  }

  async delete(key: string): Promise<void> {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  }

  publicUrl(key: string): string {
    return `${publicBaseUrl}/${bucket}/${key}`
  }
}

export const r2Adapter = new R2Adapter()
