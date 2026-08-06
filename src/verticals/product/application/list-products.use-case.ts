import { type Product } from '../domain/product.entity'
import { productRepository } from '../infrastructure/persistence/product.repository'

export class ListProductsUseCase {
  async execute (): Promise<Product[]> {
    return await productRepository.findAll()
  }
}

export const listProductsUseCase = new ListProductsUseCase()
