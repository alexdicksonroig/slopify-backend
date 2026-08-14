import { and, asc, countDistinct, desc, eq, inArray, or, type SQL } from "drizzle-orm"
import { getDrizzleDB } from "@database"
import { Product } from "../../domain/product.entity"
import {
  type CreateProduct,
  type ProductSort,
  type UpdateProduct,
} from "../../domain/product.repository"
import { products, selectedOptions } from "./schema"

export class ProductRepository {
  async findAll(
    filters?: { optionId: number; valueId: number }[],
    sort?: ProductSort,
  ): Promise<Product[]> {
    const database = getDrizzleDB()
    let query = database.select().from(products).$dynamic()

    if (filters?.length) {
      const conditions: SQL[] = []
      for (const filter of filters) {
        conditions.push(
          and(
            eq(selectedOptions.productOptionId, filter.optionId),
            eq(selectedOptions.productOptionValueId, filter.valueId),
          )!,
        )
      }

      const productIds = database
        .select({ productId: selectedOptions.productId })
        .from(selectedOptions)
        .where(or(...conditions))
        .groupBy(selectedOptions.productId)
        .having(eq(countDistinct(selectedOptions.productOptionId), filters.length))

      query = query.where(inArray(products.id, productIds))
    }

    if (sort === "newest") query = query.orderBy(desc(products.createdAt), desc(products.id))
    if (sort === "price-asc") query = query.orderBy(asc(products.priceInCents), asc(products.id))
    if (sort === "price-desc") query = query.orderBy(desc(products.priceInCents), asc(products.id))

    const records = await query
    return records.map(
      (record) =>
        new Product(
          record.id,
          record.name,
          record.description,
          record.priceInCents,
          record.thumbnailReference,
        ),
    )
  }

  async findById(id: number): Promise<Product | null> {
    const [record] = await getDrizzleDB()
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
    if (!record) return null

    return new Product(
      record.id,
      record.name,
      record.description,
      record.priceInCents,
      record.thumbnailReference,
    )
  }

  async create(product: CreateProduct): Promise<Product> {
    const [record] = await getDrizzleDB().insert(products).values(product).returning()
    return new Product(record.id, record.name, record.description, record.priceInCents, null)
  }

  async update(id: number, product: UpdateProduct): Promise<Product | null> {
    const [record] = await getDrizzleDB()
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()
    if (!record) return null

    return new Product(
      record.id,
      record.name,
      record.description,
      record.priceInCents,
      record.thumbnailReference,
    )
  }

  async setThumbnail(product: Product): Promise<void> {
    await getDrizzleDB()
      .update(products)
      .set({
        thumbnailReference: product.thumbnail,
        updatedAt: new Date(),
      })
      .where(eq(products.id, product.id))
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id })
    return Boolean(record)
  }
}

export const productRepository = new ProductRepository()
