import type { Purchase, PurchaseItem } from '@domain/purchase/Purchase'
import type { PurchaseRepository, SavePurchaseInput } from '@application/purchase/ports/PurchaseRepository.port'

export class MockPurchaseRepository implements PurchaseRepository {
  private purchases = new Map<string, Purchase>()

  async create(input: SavePurchaseInput): Promise<Purchase> {
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      groceryListId: input.groceryListId,
      marketId: input.marketId,
      date: input.date,
      items: input.items.map((item): PurchaseItem => ({
        id: crypto.randomUUID(),
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
