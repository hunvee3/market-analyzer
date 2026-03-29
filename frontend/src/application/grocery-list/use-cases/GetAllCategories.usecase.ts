import type { Category } from '@domain/grocery-list/Category'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'

export class GetAllCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.repository.getAll()
  }
}
