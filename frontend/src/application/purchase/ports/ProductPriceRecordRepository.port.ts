import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'

export interface ProductPriceRecordRepository {
  getLastPriceForProduct(productId: string): Promise<ProductPriceRecord | null>
  createBatch(
    records: Array<{
      productId: string
      marketId: string
      unitPrice: number
      date: string
    }>
  ): Promise<ProductPriceRecord[]>
}
