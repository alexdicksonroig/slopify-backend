import { getDrizzleDB } from "@database"
import { eq } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { ProductOptionValue } from "../../../domain/options/product-option-value.entity"
import { productOptionValues, productOptions } from "../schema"

export type CreateProductOption = {
  possibleValues: string[]
  label: string
}

class OptionRepository {
  async getAll(): Promise<ProductOption[]> {
    const database = getDrizzleDB()
    const [options, values] = await Promise.all([
      database.select().from(productOptions).orderBy(productOptions.id),
      database.select().from(productOptionValues).orderBy(productOptionValues.id),
    ])

    return options.map(
      (option) =>
        new ProductOption(
          option.id,
          values
            .filter((value) => value.productOptionId === option.id)
            .map((value) => new ProductOptionValue(value.id, value.label)),
          option.label,
        ),
    )
  }

  async create(option: CreateProductOption): Promise<ProductOption> {
    return await getDrizzleDB().transaction(async (transaction) => {
      const [record] = await transaction
        .insert(productOptions)
        .values({ label: option.label })
        .returning()
      const values = await transaction
        .insert(productOptionValues)
        .values(option.possibleValues.map((label) => ({ productOptionId: record.id, label })))
        .returning()

      return new ProductOption(
        record.id,
        values.map((value) => new ProductOptionValue(value.id, value.label)),
        record.label,
      )
    })
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
