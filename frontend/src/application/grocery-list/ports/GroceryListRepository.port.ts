import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { UnitType } from '@domain/shared/UnitType'

export interface GroceryListRepository {
  getAll(): Promise<GroceryList[]>
  getById(id: string): Promise<GroceryList | null>
  create(input: { name: string; items: Array<{ name: string; amount: number; unit: UnitType; categoryId: string }> }): Promise<GroceryList>
  update(id: string, input: { name: string; items: Array<{ name: string; amount: number; unit: UnitType; categoryId: string }> }): Promise<GroceryList>
  delete(id: string): Promise<void>
}
