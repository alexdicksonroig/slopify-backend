import { getDrizzleDB } from "@database"
import { eq, inArray } from "drizzle-orm"
import { products, variants } from "../persistence/schema"

// revised but not optimal
export const getCheckoutItemsDispatcher = {
  execute: async (items: ReadonlyArray<{ variantId: number; quantity: number }>) => {
    if (items.length === 0) return []

    const variantRecords = await getDrizzleDB()
      .select({
        id: variants.id,
        productName: products.name,
        unitAmount: variants.unitAmount,
        currency: variants.currency,
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(
        inArray(
          variants.id,
          items.map(({ variantId }) => variantId),
        ),
      )

    const variantsById = new Map(variantRecords.map((variant) => [variant.id, variant]))

    return items.map((item) => {
      const variant = variantsById.get(item.variantId)
      if (!variant) throw new Error(`Variant ${item.variantId} not found`)
      if (variant.unitAmount === null || variant.currency === null) {
        throw new Error(`Variant ${item.variantId} has no price configured`)
      }

      return {
        ...item,
        productName: variant.productName,
        unitAmount: variant.unitAmount,
        currency: variant.currency,
      }
    })
  },
}
