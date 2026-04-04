import { v4 as uuidv4 } from 'uuid'
import type { Category } from '@domain/grocery-list/Category'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'

const STORAGE_KEY = 'smart-basket:v1:categories'

export class LocalStorageCategoryRepository implements CategoryRepository {
  private readAll(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as Category[]
    } catch (err) {
      console.error('Failed to parse categories from localStorage:', err)
      return []
    }
  }

  private writeAll(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  }

  async getAll(): Promise<Category[]> {
    return this.readAll()
  }

  async findByNormalizedName(normalizedName: string): Promise<Category | null> {
    const categories = this.readAll()
    return categories.find((c) => c.normalizedName === normalizedName) ?? null
  }

  async create(name: string): Promise<Category> {
    const categories = this.readAll()
    const newCategory: Category = {
      id: uuidv4(),
      name: name.trim(),
      normalizedName: name.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    }
    categories.push(newCategory)
    this.writeAll(categories)
    return newCategory
  }
}
