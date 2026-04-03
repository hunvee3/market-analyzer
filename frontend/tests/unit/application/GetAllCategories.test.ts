import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAllCategoriesUseCase } from '@application/grocery-list/use-cases/GetAllCategories.usecase'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'
import type { Category } from '@domain/grocery-list/Category'

const makeCategory = (id: string): Category => ({
  id,
  name: `Category ${id}`,
  normalizedName: `category ${id}`,
  createdAt: '2026-01-01T00:00:00.000Z',
})

describe('GetAllCategoriesUseCase', () => {
  let repository: CategoryRepository
  let useCase: GetAllCategoriesUseCase

  beforeEach(() => {
    repository = {
      getAll: vi.fn(),
      findByNormalizedName: vi.fn(),
      create: vi.fn(),
    }
    useCase = new GetAllCategoriesUseCase(repository)
  })

  it('Given repository returns categories, When executed, Then returns them as-is', async () => {
    const categories = [makeCategory('a'), makeCategory('b')]
    vi.mocked(repository.getAll).mockResolvedValue(categories)

    const result = await useCase.execute()

    expect(result).toEqual(categories)
  })
})
