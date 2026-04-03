/**
 * PORT: PurchaseRepository
 *
 * Defines the contract for purchase persistence operations.
 * Implementations: MockPurchaseRepository (mock-first), future API adapter.
 */

import type { Purchase } from '@domain/purchase/Purchase'
import type { UnitType } from '@domain/purchase/UnitType'

export interface SavePurchaseInput {
  groceryListId: string
  marketId: string
  date: string // ISO 8601 date (YYYY-MM-DD)
  items: Array<{
    groceryItemId: string
    productId: string
    quantity: number
    unit: UnitType
    unitPrice: number
  }>
}

export interface PurchaseRepository {
  /** Persist a new purchase and return the created entity with generated IDs. */
  create(input: SavePurchaseInput): Promise<Purchase>
}
