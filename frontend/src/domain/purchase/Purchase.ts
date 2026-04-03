import type { UnitType } from '@domain/shared/UnitType'

export interface PurchaseItem {
  id: string
  groceryItemId: string
  productId: string
  quantity: number
  unit: UnitType
  unitPrice: number
}

export interface Purchase {
  id: string
  groceryListId: string
  marketId: string
  date: string
  items: PurchaseItem[]
  createdAt: string
}
