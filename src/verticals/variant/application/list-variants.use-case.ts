import { type Variant } from '../domain/variant.entity'
import { variantRepository } from '../infrastructure/persistence/variant.repository'

export class ListVariantsUseCase {
  async execute (): Promise<Variant[]> {
    return await variantRepository.findAll()
  }
}
