import "dotenv/config"
import { Writable } from "node:stream"
import { createInterface } from "node:readline/promises"
import { initDrizzleDB, shutdownDrizzleDB } from "../database"
import { saveUserUseCase } from "../verticals/user/application/save-user.use-case"

const email = process.argv[2]
if (!email) throw new Error("Usage: pnpm admin:user <email>")

let muted = false
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding)
    callback()
  },
})
const prompt = createInterface({ input: process.stdin, output, terminal: true })
process.stdout.write("Password: ")
muted = true
const password = await prompt.question("")
muted = false
prompt.close()
process.stdout.write("\n")

if (password.length < 12) throw new Error("Password must be at least 12 characters")
if (Buffer.byteLength(password) > 72) throw new Error("Password must be at most 72 bytes")

await initDrizzleDB()
try {
  const user = await saveUserUseCase.execute(email, password)
  console.log(`Saved admin user ${user.email}`)
} finally {
  await shutdownDrizzleDB()
}
