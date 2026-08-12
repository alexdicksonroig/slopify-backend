import { getDrizzleDB } from "@database"
import { and, eq } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import {
  ProductVariant,
  type ProductOptionSelection,
} from "../../../domain/variants/product-variant.entity"
import { productOptions, productVariants, selectedOptions } from "../schema"

class VariantRepository {
  async findForProduct(productId: number): Promise<ProductVariant[]> {
    const records = await getDrizzleDB()
      .select({
        productVariantId: productVariants.id,
        productId: productVariants.productId,
        sku: productVariants.sku,
        optionId: productOptions.id,
        possibleValues: productOptions.possibleValues,
        label: productOptions.label,
        value: selectedOptions.value,
      })
      .from(productVariants)
      .leftJoin(selectedOptions, eq(selectedOptions.productVariantId, productVariants.id))
      .leftJoin(productOptions, eq(productOptions.id, selectedOptions.productOptionId))
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.id, productOptions.id)

    const variants = new Map<number, ProductVariant>()
    for (const record of records) {
      let variant = variants.get(record.productVariantId)
      if (!variant) {
        variant = new ProductVariant(record.productVariantId, record.productId, record.sku, [])
        variants.set(record.productVariantId, variant)
      }

      if (
        record.optionId !== null &&
        record.possibleValues !== null &&
        record.label !== null &&
        record.value !== null
      ) {
        const selection: ProductOptionSelection = {
          option: new ProductOption(record.optionId, record.possibleValues, record.label),
          value: record.value,
        }
        variant.selections.push(selection)
      }
    }

    return [...variants.values()]
  }

  async createVariant(productId: number, sku: string): Promise<ProductVariant> {
    const [record] = await getDrizzleDB()
      .insert(productVariants)
      .values({ productId, sku })
      .returning({ id: productVariants.id })

    return new ProductVariant(record.id, productId, sku, [])
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(productVariants)
      .where(eq(productVariants.id, id))
      .returning({ id: productVariants.id })
    return Boolean(record)
  }

  async addSelection(variantId: number, optionId: number, value: string): Promise<void> {
    await getDrizzleDB().insert(selectedOptions).values({
      productVariantId: variantId,
      productOptionId: optionId,
      value,
    })
  }

  async deleteSelection(variantId: number, optionId: number): Promise<void> {
    await getDrizzleDB()
      .delete(selectedOptions)
      .where(
        and(
          eq(selectedOptions.productVariantId, variantId),
          eq(selectedOptions.productOptionId, optionId),
        ),
      )
  }
}

export const variantRepository = new VariantRepository()
