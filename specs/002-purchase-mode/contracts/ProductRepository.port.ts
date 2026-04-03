/**
 * PORT: ProductRepository
 *
 * Defines the contract for product persistence operations.
 * Implementations: MockProductRepository (mock-first), future API adapter.
 */

import type { Product } from '@domain/purchase/Product'

export interface ProductRepository {
  /** Return all products. Used for search indexing. */
  getAll(): Promise<Product[]>

  /** Find a product by its ID. Returns null if not found. */
  getById(id: string): Promise<Product | null>

  /**
   * Find a product by exact barcode match.
   * Used during product creation (step 2) and product lookup by barcode.
   * Returns null if no product has this barcode.
   */
  findByBarcode(barcode: string): Promise<Product | null>

  /** Persist a new product and return the created entity. */
  create(input: { name: string; barcode: string }): Promise<Product>
}
