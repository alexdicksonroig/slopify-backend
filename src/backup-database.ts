import { databaseBackupAdapter } from "./infrastructure/database-backup.adapter"

const key = await databaseBackupAdapter.backupToR2()
console.log(`Database backup uploaded to ${key}`)
