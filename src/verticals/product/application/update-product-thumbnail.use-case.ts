import { randomUUID } from 'node:crypto'
import { type Product } from '../domain/product.entity'
import { productRepository } from '../infrastructure/persistence/product.repository'
import { r2Adapter } from '../infrastructure/r2.adapter'

export class UpdateProductThumbnailUseCase {
  async execute (
    product: Product,
    image: Buffer,
    type: { ext: string, mime: string }
  ): Promise<Product> {
    const previousReference = product.thumbnail
    const reference = `product-thumbnails/${product.id}/${randomUUID()}.${type.ext}`

    await r2Adapter.upload(reference, image, type.mime)
    product.replaceThumbnail(reference)
    await productRepository.setThumbnail(product)

    if (previousReference) void r2Adapter.delete(previousReference).catch(() => {})
    return product
  }
}
