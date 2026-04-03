import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'
import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'

export class MockProductPriceRecordRepository implements ProductPriceRecordRepository {
  private records: ProductPriceRecord[] = []

  async getLastPriceForProduct(productId: string): Promise<ProductPriceRecord | null> {
    const matching = this.records
      .filter((r) => r.productId === productId)
      .sort((a, b) => b.date.localeCompare(a.date))
    return matching[0] ?? null
  }

  async createBatch(
    records: Array<{
      productId: string
      marketId: string
      unitPrice: number
      date: string
    }>
  ): Promise<ProductPriceRecord[]> {
    const created = records.map((r): ProductPriceRecord => ({
      id: crypto.randomUUID(),
      productId: r.productId,
      marketId: r.marketId,
      unitPrice: r.unitPrice,
      date: r.date,
      createdAt: new Date().toISOString(),
    }))
    this.records.push(...created)
    return created
  }
}
