export interface GroceryItem {
  id: string
  name: string
  unit: string
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
