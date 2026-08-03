import { type Variant } from '../domain/variant.entity'
import {
  type CreateVariant,
  variantRepository
} from '../infrastructure/persistence/variant.repository'

export class CreateVariantUseCase {
  async execute (input: CreateVariant): Promise<Variant> {
    return await variantRepository.create(input)
  }
}
