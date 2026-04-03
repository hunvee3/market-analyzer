import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateGroceryListUseCase } from '@application/grocery-list/use-cases/CreateGroceryList.usecase'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

const mockCreatedList: GroceryList = {
  id: 'list-1',
  name: 'My List',
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  items: [{ id: 'item-1', name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1', position: 0 }],
}

describe('CreateGroceryListUseCase', () => {
  let repository: GroceryListRepository
  let useCase: CreateGroceryListUseCase

  beforeEach(() => {
    repository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    useCase = new CreateGroceryListUseCase(repository)
  })

  it('Given valid name + items, When executed, Then calls repository.create with correct shape and returns new list', async () => {
    vi.mocked(repository.create).mockResolvedValue(mockCreatedList)

    const result = await useCase.execute({
      name: 'My List',
      items: [{ name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1' }],
    })

    expect(repository.create).toHaveBeenCalledWith({
      name: 'My List',
      items: [{ name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1' }],
    })
    expect(result).toEqual(mockCreatedList)
  })

  it('Given empty name, When executed, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({ name: '   ', items: [{ name: 'Milk', amount: 1, unit: 'L', categoryId: 'cat-1' }] }),
    ).rejects.toThrow(ValidationError)
  })

  it('Given empty items array, When executed, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({ name: 'My List', items: [] }),
    ).rejects.toThrow(ValidationError)
  })

  it('Given item with amount <= 0, When executed, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({ name: 'My List', items: [{ name: 'Milk', amount: 0, unit: 'L', categoryId: 'cat-1' }] }),
    ).rejects.toThrow(ValidationError)

    await expect(
      useCase.execute({ name: 'My List', items: [{ name: 'Milk', amount: -1, unit: 'L', categoryId: 'cat-1' }] }),
    ).rejects.toThrow(ValidationError)
  })

  it('Given item with invalid unit, When executed, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({ name: 'My List', items: [{ name: 'Milk', amount: 1, unit: 'gallons' as never, categoryId: 'cat-1' }] }),
    ).rejects.toThrow(ValidationError)
  })
})
