import bcrypt from "bcrypt"

const saltRounds = 12

class PasswordAdapter {
  private readonly unknownUserHash = bcrypt.hashSync("unknown user", saltRounds)

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, saltRounds)
  }

  async verify(password: string, passwordHash: string | undefined): Promise<boolean> {
    const matches = await bcrypt.compare(password, passwordHash ?? this.unknownUserHash)
    return matches && passwordHash !== undefined
  }
}

export const passwordAdapter = new PasswordAdapter()
