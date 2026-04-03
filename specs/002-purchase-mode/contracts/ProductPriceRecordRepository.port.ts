/**
 * PORT: ProductPriceRecordRepository
 *
 * Defines the contract for product price history operations.
 * Implementations: MockProductPriceRecordRepository (mock-first), future API adapter.
 */

import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'

export interface ProductPriceRecordRepository {
  /**
   * Get the most recent price record for a given product across all markets.
   * Returns null if the product has never been purchased.
   * Used to display "last known price" during product assignment (FR-017).
   */
  getLastPriceForProduct(productId: string): Promise<ProductPriceRecord | null>

  /**
   * Create price records in bulk for all items in a saved purchase.
   * Called when a purchase is saved — one record per PurchaseItem.
   */
  createBatch(
    records: Array<{
      productId: string
      marketId: string
      unitPrice: number
      date: string // ISO 8601 date (YYYY-MM-DD)
    }>
  ): Promise<ProductPriceRecord[]>
}
