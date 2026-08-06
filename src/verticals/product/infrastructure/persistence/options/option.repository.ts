import { getDrizzleDB } from '@database'
import { ProductOption } from '../../../domain/options/product-option.entity'
import { productOptions } from '../schema'

export type CreateProductOption = {
  possibleValues: string[]
  label: string
}

class OptionRepository {
  async getAll (): Promise<ProductOption[]> {
    const records = await getDrizzleDB()
      .select()
      .from(productOptions)
      .orderBy(productOptions.id)

    return records.map((record) => new ProductOption(
      record.id,
      record.possibleValues,
      record.label
    ))
  }

  async create (option: CreateProductOption): Promise<ProductOption> {
    const [record] = await getDrizzleDB()
      .insert(productOptions)
      .values(option)
      .returning()

    return new ProductOption(record.id, record.possibleValues, record.label)
  }
}

export const optionRepository = new OptionRepository()
