import type { Category } from '@domain/grocery-list/Category'

export interface CategoryRepository {
  getAll(): Promise<Category[]>
  findByNormalizedName(normalizedName: string): Promise<Category | null>
  create(name: string): Promise<Category>
}
