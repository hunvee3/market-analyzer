import type { Category } from '@domain/grocery-list/Category'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'

export class CreateOrReuseCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute({ name }: { name: string }): Promise<Category> {
    const normalized = name.trim().toLowerCase()
    const existing = await this.repository.findByNormalizedName(normalized)
    if (existing) return existing
    return this.repository.create(name.trim())
  }
}
