import { type User } from "../domain/user.entity"
import { passwordAdapter } from "../infrastructure/password.adapter"
import { userRepository } from "../infrastructure/persistence/user.repository"

class LogInUseCase {
  async execute(email: string, password: string): Promise<User | null> {
    const user = await userRepository.findByEmail(email.trim().toLowerCase())
    const valid = await passwordAdapter.verify(password, user?.passwordHash)
    return user && valid ? user : null
  }
}

export const logInUseCase = new LogInUseCase()
