import { getDrizzleDB } from '@database'
import { Variant } from '../../domain/variant.entity'
import { variants } from './schema'

export type CreateVariant = {
  possibleOptions: string[]
  label: string
}

class VariantRepository {
  async findAll (): Promise<Variant[]> {
    const records = await getDrizzleDB().select().from(variants)
    return records.map((record) => new Variant(
      record.id,
      record.possibleOptions,
      record.label
    ))
  }

  async create (variant: CreateVariant): Promise<Variant> {
    const [record] = await getDrizzleDB().insert(variants).values(variant).returning()
    return new Variant(record.id, record.possibleOptions, record.label)
  }
}

export const variantRepository = new VariantRepository()
