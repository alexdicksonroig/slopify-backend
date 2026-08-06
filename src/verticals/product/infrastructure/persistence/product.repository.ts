import { eq } from "drizzle-orm"
import { getDrizzleDB } from "@database"
import { Product } from "../../domain/product.entity"
import { type CreateProduct, type UpdateProduct } from "../../domain/product.repository"
import { products } from "./schema"

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const records = await getDrizzleDB().select().from(products)
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
