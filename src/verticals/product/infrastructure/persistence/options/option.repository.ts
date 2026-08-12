import { getDrizzleDB } from "@database"
import { eq } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { productOptions } from "../schema"

export type CreateProductOption = {
  possibleValues: string[]
  label: string
}

class OptionRepository {
  async getAll(): Promise<ProductOption[]> {
    const records = await getDrizzleDB().select().from(productOptions).orderBy(productOptions.id)

    return records.map(
      (record) => new ProductOption(record.id, record.possibleValues, record.label),
    )
  }

  async create(option: CreateProductOption): Promise<ProductOption> {
    const [record] = await getDrizzleDB().insert(productOptions).values(option).returning()

    return new ProductOption(record.id, record.possibleValues, record.label)
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(productOptions)
      .where(eq(productOptions.id, id))
      .returning({ id: productOptions.id })
    return Boolean(record)
  }
}

export const optionRepository = new OptionRepository()
