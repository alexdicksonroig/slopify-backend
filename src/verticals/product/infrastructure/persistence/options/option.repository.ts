import { getDrizzleDB } from "@database"
import { eq } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { ProductOptionValue } from "../../../domain/options/product-option-value.entity"
import { type LocalizedText } from "../../../domain/localized-text"
import { productOptionValues, productOptions } from "../schema"

export type CreateProductOption = {
  optionId: string
  possibleValues: LocalizedText[]
  label: LocalizedText
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
          option.optionId,
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
        .values({ optionId: option.optionId, label: option.label })
        .returning()
      const values = await transaction
        .insert(productOptionValues)
        .values(option.possibleValues.map((label) => ({ productOptionId: record.id, label })))
        .returning()

      return new ProductOption(
        record.id,
        record.optionId,
        values.map((value) => new ProductOptionValue(value.id, value.label)),
        record.label,
      )
    })
  }

  async delete(optionId: string): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(productOptions)
      .where(eq(productOptions.optionId, optionId))
      .returning({ id: productOptions.id })
    return Boolean(record)
  }
}

export const optionRepository = new OptionRepository()
