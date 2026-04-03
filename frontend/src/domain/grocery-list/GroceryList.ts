import type { UnitType } from '@domain/shared/UnitType'

export interface GroceryItem {
  id: string
  name: string
  amount: number
  unit: UnitType
  categoryId: string
  position: number
}

export interface GroceryList {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  items: GroceryItem[]
}
