import { getDrizzleDB } from "@database"
import { eq } from "drizzle-orm"
import { User } from "../../domain/user.entity"
import { users } from "./schema"

class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [record] = await getDrizzleDB().select().from(users).where(eq(users.email, email))
    return record ? new User(record.id, record.email, record.passwordHash) : null
  }

  async save(email: string, passwordHash: string): Promise<User> {
    const [record] = await getDrizzleDB()
      .insert(users)
      .values({ email, passwordHash })
      .onConflictDoUpdate({ target: users.email, set: { passwordHash } })
      .returning()
    return new User(record.id, record.email, record.passwordHash)
  }
}

export const userRepository = new UserRepository()
