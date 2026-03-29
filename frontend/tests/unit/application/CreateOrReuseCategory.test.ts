import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateOrReuseCategoryUseCase } from '@application/grocery-list/use-cases/CreateOrReuseCategory.usecase'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'
import type { Category } from '@domain/grocery-list/Category'

const existingDairy: Category = {
  id: 'cat-1',
  name: 'Dairy',
  normalizedName: 'dairy',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('CreateOrReuseCategoryUseCase', () => {
  let repository: CategoryRepository
  let useCase: CreateOrReuseCategoryUseCase

  beforeEach(() => {
    repository = {
      getAll: vi.fn(),
      findByNormalizedName: vi.fn(),
      create: vi.fn(),
    }
    useCase = new CreateOrReuseCategoryUseCase(repository)
  })

  it('Given " Dairy " input and existing category "dairy", When executed, Then returns existing category without creating a new one', async () => {
    vi.mocked(repository.findByNormalizedName).mockResolvedValue(existingDairy)

    const result = await useCase.execute({ name: ' Dairy ' })

    expect(result).toEqual(existingDairy)
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('Given no matching category, When executed, Then calls repository.create and returns new category', async () => {
    const newCategory: Category = {
      id: 'cat-2',
      name: 'Produce',
      normalizedName: 'produce',
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    vi.mocked(repository.findByNormalizedName).mockResolvedValue(null)
    vi.mocked(repository.create).mockResolvedValue(newCategory)

    const result = await useCase.execute({ name: 'Produce' })

    expect(repository.create).toHaveBeenCalledWith('Produce')
    expect(result).toEqual(newCategory)
  })
})
