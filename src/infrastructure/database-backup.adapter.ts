import { spawn } from "node:child_process"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

// pg_dump reads its connection from PGHOST, PGUSER, PGPASSWORD and PGDATABASE
const dumpDatabase = (): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const pgDump = spawn("pg_dump", ["--format=custom", "--no-owner", "--no-acl"], {
      stdio: ["ignore", "pipe", "inherit"],
    })
    const chunks: Buffer[] = []

    pgDump.stdout.on("data", (chunk: Buffer) => chunks.push(chunk))
    pgDump.on("error", reject)
    pgDump.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(chunks))
      else reject(new Error(`pg_dump exited with code ${code}`))
    })
  })

export const databaseBackupAdapter = {
  backupToR2: async (): Promise<string> => {
    const client = new S3Client({
      endpoint: requiredEnvironmentVariable("R2_ENDPOINT"),
      region: "auto",
      credentials: {
        accessKeyId: requiredEnvironmentVariable("R2_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnvironmentVariable("R2_SECRET_ACCESS_KEY"),
      },
    })
    const key = `postgres/${new Date().toISOString().replace(/:/g, "-")}.dump`

    await client.send(
      new PutObjectCommand({
        Bucket: requiredEnvironmentVariable("R2_BACKUP_BUCKET"),
        Key: key,
        Body: await dumpDatabase(),
        ContentType: "application/octet-stream",
      }),
    )

    return key
  },
}
