import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'
import type { GetLastProductPriceInput } from '@application/purchase/use-cases/use-case-types'
import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'

export class GetLastProductPriceUseCase {
  constructor(private readonly priceRecordRepository: ProductPriceRecordRepository) {}

  async execute(input: GetLastProductPriceInput): Promise<ProductPriceRecord | null> {
    return this.priceRecordRepository.getLastPriceForProduct(input.productId)
  }
}
