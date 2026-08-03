import { type Product } from '../domain/product.entity'
import { productRepository } from '../infrastructure/persistence/product.repository'
import { r2Adapter } from '../infrastructure/r2.adapter'

export class DeleteProductThumbnailUseCase {
  async execute (product: Product): Promise<void> {
    if (!product.thumbnail) return

    const reference = product.thumbnail
    product.removeThumbnail()
    await productRepository.setThumbnail(product)
    void r2Adapter.delete(reference).catch(() => {})
  }
}
