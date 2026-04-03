import { format } from 'date-fns'
import type { PurchaseRepository } from '@application/purchase/ports/PurchaseRepository.port'
import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'
import type { SavePurchaseInput } from '@application/purchase/use-cases/use-case-types'
import type { Purchase } from '@domain/purchase/Purchase'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

export class SavePurchaseUseCase {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly priceRecordRepository: ProductPriceRecordRepository,
  ) {}

  async execute(input: SavePurchaseInput): Promise<Purchase> {
    if (input.items.length === 0) {
      throw new ValidationError('items', 'minLength', 'items must have at least 1 item')
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    const purchase = await this.purchaseRepository.create({
      groceryListId: input.groceryListId,
      marketId: input.marketId,
      date: today,
      items: input.items,
    })

    // Create price records for all items
    const priceRecords = input.items.map((item) => ({
      productId: item.productId,
      marketId: input.marketId,
      unitPrice: item.unitPrice,
      date: today,
    }))

    await this.priceRecordRepository.createBatch(priceRecords)

    return purchase
  }
}
