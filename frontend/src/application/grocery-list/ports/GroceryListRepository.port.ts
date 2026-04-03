import type { GroceryList } from '@domain/grocery-list/GroceryList'

export interface GroceryListRepository {
  getAll(): Promise<GroceryList[]>
  getById(id: string): Promise<GroceryList | null>
  create(input: { name: string; items: Array<{ name: string; unit: string; categoryId: string }> }): Promise<GroceryList>
  update(id: string, input: { name: string; items: Array<{ name: string; unit: string; categoryId: string }> }): Promise<GroceryList>
  delete(id: string): Promise<void>
}
