import type { Product } from '@domain/purchase/Product'
import type { ProductRepository } from '@application/purchase/ports/ProductRepository.port'

export class MockProductRepository implements ProductRepository {
  private products = new Map<string, Product>()

  async getAll(): Promise<Product[]> {
    return Array.from(this.products.values())
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return Array.from(this.products.values()).find((p) => p.barcode === barcode) ?? null
  }

  async create(input: { name: string; barcode: string }): Promise<Product> {
    const product: Product = {
      id: crypto.randomUUID(),
      name: input.name,
      barcode: input.barcode,
      createdAt: new Date().toISOString(),
    }
    this.products.set(product.id, product)
    return product
  }
}
