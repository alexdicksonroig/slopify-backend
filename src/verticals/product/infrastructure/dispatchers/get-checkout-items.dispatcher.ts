import { getDrizzleDB } from "@database"
import { eq, inArray } from "drizzle-orm"
import { products, productVariants } from "../persistence/schema"

// revised but not optimal
export const getCheckoutItemsDispatcher = {
  execute: async (items: ReadonlyArray<{ variantId: number; quantity: number }>) => {
    if (items.length === 0) return []

    const variants = await getDrizzleDB()
      .select({
        id: productVariants.id,
        productName: products.name,
        unitAmount: productVariants.unitAmount,
        currency: productVariants.currency,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(
        inArray(
          productVariants.id,
          items.map(({ variantId }) => variantId),
        ),
      )

    const variantsById = new Map(variants.map((variant) => [variant.id, variant]))

    return items.map((item) => {
      const variant = variantsById.get(item.variantId)
      if (!variant) throw new Error(`Product variant ${item.variantId} not found`)

      return {
        ...item,
        productName: variant.productName,
        unitAmount: variant.unitAmount,
        currency: variant.currency,
      }
    })
  },
}
