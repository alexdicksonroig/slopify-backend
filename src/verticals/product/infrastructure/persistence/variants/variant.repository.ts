import { getDrizzleDB } from "@database"
import { and, countDistinct, eq, inArray, or } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { ProductOptionValue } from "../../../domain/options/product-option-value.entity"
import { Product } from "../../../domain/product.entity"
import {
  ProductVariant,
  ProductVariantWithProduct,
  type ProductOptionSelection,
  type VariantInList,
} from "../../../domain/variants/product-variant.entity"
import {
  productOptionValues,
  productOptions,
  products,
  productVariants,
  selectedOptions,
} from "../schema"

class VariantRepository {
  async findAll(filters: { optionId: number; valueId: number }[]): Promise<VariantInList[]> {
    const database = getDrizzleDB()
    const filterConditions = filters.map((filter) =>
      and(
        eq(selectedOptions.productOptionId, filter.optionId),
        eq(selectedOptions.productOptionValueId, filter.valueId),
      ),
    )
    const variantIds = filterConditions.length
      ? database
          .select({ variantId: selectedOptions.productVariantId })
          .from(selectedOptions)
          .where(or(...filterConditions))
          .groupBy(selectedOptions.productVariantId)
          .having(eq(countDistinct(selectedOptions.productOptionId), filters.length))
      : undefined

    const variants = await database
      .select({
        id: productVariants.id,
        productId: products.id,
        unitAmount: productVariants.unitAmount,
        currency: productVariants.currency,
        productName: products.name,
        productDescription: products.description,
        productThumbnailReference: products.thumbnailReference,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(variantIds ? inArray(productVariants.id, variantIds) : undefined)
      .orderBy(productVariants.id)

    const variantsInList = variants.map((variant) => ({
      id: variant.id,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      product: new Product(
        variant.productId,
        variant.productName,
        variant.productDescription,
        variant.productThumbnailReference,
      ),
    }))

    return variantsInList
  }

  // TODO: Refactor/cleanup
  async findById(id: number): Promise<ProductVariantWithProduct | null> {
    const database = getDrizzleDB()
    const [variant] = await database
      .select({
        id: productVariants.id,
        productId: products.id,
        unitAmount: productVariants.unitAmount,
        currency: productVariants.currency,
        productName: products.name,
        productDescription: products.description,
        productThumbnailReference: products.thumbnailReference,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(eq(productVariants.id, id))
      .limit(1)

    if (!variant) return null

    const records = await database
      .select({
        optionId: productOptions.id,
        optionLabel: productOptions.label,
        valueId: productOptionValues.id,
        valueLabel: productOptionValues.label,
      })
      .from(selectedOptions)
      .innerJoin(productOptions, eq(productOptions.id, selectedOptions.productOptionId))
      .innerJoin(
        productOptionValues,
        eq(productOptionValues.id, selectedOptions.productOptionValueId),
      )
      .where(eq(selectedOptions.productVariantId, id))
      .orderBy(productOptions.id)

    return new ProductVariantWithProduct(
      variant.id,
      variant.productId,
      variant.unitAmount,
      variant.currency,
      records.map((record) => ({
        option: new ProductOption(record.optionId, [], record.optionLabel),
        value: new ProductOptionValue(record.valueId, record.valueLabel),
      })),
      new Product(
        variant.productId,
        variant.productName,
        variant.productDescription,
        variant.productThumbnailReference,
      ),
    )
  }

  async findForProduct(productId: number): Promise<ProductVariant[]> {
    const database = getDrizzleDB()
    const variants = await database
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.id)

    if (variants.length === 0) return []

    const records = await database
      .select({
        variantId: selectedOptions.productVariantId,
        optionId: productOptions.id,
        optionLabel: productOptions.label,
        valueId: productOptionValues.id,
        valueLabel: productOptionValues.label,
      })
      .from(selectedOptions)
      .innerJoin(productOptions, eq(productOptions.id, selectedOptions.productOptionId))
      .innerJoin(
        productOptionValues,
        eq(productOptionValues.id, selectedOptions.productOptionValueId),
      )
      .where(
        inArray(
          selectedOptions.productVariantId,
          variants.map((variant) => variant.id),
        ),
      )
      .orderBy(selectedOptions.productVariantId, productOptions.id)

    const selectionsByVariant = new Map<number, ProductOptionSelection[]>()
    for (const record of records) {
      const selections = selectionsByVariant.get(record.variantId) ?? []
      selections.push({
        option: new ProductOption(record.optionId, [], record.optionLabel),
        value: new ProductOptionValue(record.valueId, record.valueLabel),
      })
      selectionsByVariant.set(record.variantId, selections)
    }

    return variants.map(
      (variant) =>
        new ProductVariant(
          variant.id,
          variant.productId,
          variant.unitAmount,
          variant.currency,
          selectionsByVariant.get(variant.id) ?? [],
        ),
    )
  }

  async createVariant(
    productId: number,
    unitAmount: number,
    currency: string,
  ): Promise<ProductVariant> {
    const [record] = await getDrizzleDB()
      .insert(productVariants)
      .values({ productId, unitAmount, currency })
      .returning({ id: productVariants.id })

    return new ProductVariant(record.id, productId, unitAmount, currency, [])
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(productVariants)
      .where(eq(productVariants.id, id))
      .returning({ id: productVariants.id })
    return Boolean(record)
  }

  async addSelection(variantId: number, optionId: number, valueId: number): Promise<void> {
    const database = getDrizzleDB()
    const [variant] = await database
      .select({ productId: productVariants.productId })
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1)
    if (!variant) throw new Error("Product variant not found")

    await database.insert(selectedOptions).values({
      productId: variant.productId,
      productVariantId: variantId,
      productOptionId: optionId,
      productOptionValueId: valueId,
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
