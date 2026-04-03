import type { Product } from '@domain/purchase/Product'

export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product | null>
  findByBarcode(barcode: string): Promise<Product | null>
  create(input: { name: string; barcode: string }): Promise<Product>
}
