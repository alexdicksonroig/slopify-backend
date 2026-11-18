import { type User } from "../domain/user.entity"
import { passwordAdapter } from "../infrastructure/password.adapter"
import { userRepository } from "../infrastructure/persistence/user.repository"

class SaveUserUseCase {
  async execute(email: string, password: string): Promise<User> {
    const passwordHash = await passwordAdapter.hash(password)
    return await userRepository.save(email.trim().toLowerCase(), passwordHash)
  }
}

export const saveUserUseCase = new SaveUserUseCase()
