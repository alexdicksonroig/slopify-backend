import { type Product } from '../domain/product.entity'
import { type CreateProduct } from '../domain/product.repository'
import { productRepository } from '../infrastructure/persistence/product.repository'

export class CreateProductUseCase {
  async execute (input: CreateProduct): Promise<Product> {
    return await productRepository.create(input)
  }
}

export const createProductUseCase = new CreateProductUseCase()
