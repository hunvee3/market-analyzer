import Fuse from 'fuse.js'
import type { ProductRepository } from '@application/purchase/ports/ProductRepository.port'
import type { SearchProductsInput } from '@application/purchase/use-cases/use-case-types'
import type { Product } from '@domain/purchase/Product'

export class SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: SearchProductsInput): Promise<Product[]> {
    if (input.strategy === 'barcode') {
      const product = await this.productRepository.findByBarcode(input.query.trim())
      return product ? [product] : []
    }

    const all = await this.productRepository.getAll()
    const query = input.query.trim()
    if (!query) return all

    const fuse = new Fuse(all, {
      keys: ['name'],
      threshold: 0.4,
    })

    return fuse.search(query, { limit: 20 }).map((r) => r.item)
  }
}
