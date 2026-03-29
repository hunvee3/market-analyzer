import type { GroceryList, GroceryItem } from '@domain/grocery-list/GroceryList'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'

const STORAGE_KEY = 'smart-basket:v1:grocery-lists'

export class LocalStorageGroceryListRepository implements GroceryListRepository {
  private readAll(): GroceryList[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as GroceryList[]
    } catch (err) {
      console.error('Failed to parse grocery lists from localStorage:', err)
      return []
    }
  }

  private writeAll(lists: GroceryList[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  }

  async getAll(): Promise<GroceryList[]> {
    return this.readAll()
  }

  async getById(id: string): Promise<GroceryList | null> {
    const lists = this.readAll()
    return lists.find((l) => l.id === id) ?? null
  }

  async create(input: { name: string; items: Array<{ name: string; unit: string; categoryId: string }> }): Promise<GroceryList> {
    const lists = this.readAll()
    const now = new Date().toISOString()
    const newList: GroceryList = {
      id: crypto.randomUUID(),
      name: input.name,
      createdAt: now,
      updatedAt: now,
      items: input.items.map((item, index): GroceryItem => ({
        id: crypto.randomUUID(),
        name: item.name,
        unit: item.unit,
        categoryId: item.categoryId,
        position: index,
      })),
    }
    lists.push(newList)
    this.writeAll(lists)
    return newList
  }

  async update(
    id: string,
    input: { name: string; items: Array<{ name: string; unit: string; categoryId: string }> },
  ): Promise<GroceryList> {
    const lists = this.readAll()
    const index = lists.findIndex((l) => l.id === id)
    if (index === -1) throw new Error(`GroceryList with id "${id}" not found`)
    const existing = lists[index]
    const updated: GroceryList = {
      ...existing,
      name: input.name,
      updatedAt: new Date().toISOString(),
      items: input.items.map((item, pos): GroceryItem => ({
        id: crypto.randomUUID(),
        name: item.name,
        unit: item.unit,
        categoryId: item.categoryId,
        position: pos,
      })),
    }
    lists[index] = updated
    this.writeAll(lists)
    return updated
  }

  async delete(id: string): Promise<void> {
    const lists = this.readAll()
    const filtered = lists.filter((l) => l.id !== id)
    this.writeAll(filtered)
  }
}
