import { v4 as uuidv4 } from 'uuid'
import type { Purchase, PurchaseItem } from '@domain/purchase/Purchase'
import type { PurchaseRepository, SavePurchaseInput } from '@application/purchase/ports/PurchaseRepository.port'

export class MockPurchaseRepository implements PurchaseRepository {
  private purchases = new Map<string, Purchase>()

  async create(input: SavePurchaseInput): Promise<Purchase> {
    const purchase: Purchase = {
      id: uuidv4(),
      groceryListId: input.groceryListId,
      marketId: input.marketId,
      date: input.date,
      items: input.items.map((item): PurchaseItem => ({
        id: uuidv4(),
        groceryItemId: item.groceryItemId,
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
      })),
      createdAt: new Date().toISOString(),
    }
    this.purchases.set(purchase.id, purchase)
    return purchase
  }
}
