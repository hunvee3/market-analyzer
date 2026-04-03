import { atom } from 'jotai'
import type { Market } from '@domain/purchase/Market'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { PurchaseItem } from '@domain/purchase/Purchase'

export interface ActivePurchase {
  groceryList: GroceryList
  market: Market
}

export const activePurchaseAtom = atom<ActivePurchase | null>(null)
export const purchaseItemsAtom = atom<PurchaseItem[]>([])
export const purchaseTotalAtom = atom((get) => {
  const items = get(purchaseItemsAtom)
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
})
export const purchaseHasChangesAtom = atom((get) => {
  const items = get(purchaseItemsAtom)
  return items.length > 0
})
