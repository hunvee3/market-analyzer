import type { Purchase } from '@domain/purchase/Purchase'
import type { UnitType } from '@domain/shared/UnitType'

export interface SavePurchaseInput {
  groceryListId: string
  marketId: string
  date: string
  items: Array<{
    groceryItemId: string
    productId: string
    quantity: number
    unit: UnitType
    unitPrice: number
  }>
}

export interface PurchaseRepository {
  create(input: SavePurchaseInput): Promise<Purchase>
}
