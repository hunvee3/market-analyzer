import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateGroceryListUseCase } from '@application/grocery-list/use-cases/UpdateGroceryList.usecase'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import { ValidationError, NotFoundError } from '@application/grocery-list/use-cases/use-case-types'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

const makeList = (id: string): GroceryList => ({
  id,
  name: 'Original Name',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  items: [],
})

describe('UpdateGroceryListUseCase', () => {
  let repository: GroceryListRepository
  let useCase: UpdateGroceryListUseCase

  beforeEach(() => {
    repository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    useCase = new UpdateGroceryListUseCase(repository)
  })

  it('Given valid id + name + items, When executed, Then calls repository.update and returns updated list', async () => {
    const existing = makeList('list-1')
    const updated: GroceryList = {
      ...existing,
      name: 'Updated Name',
      updatedAt: '2026-03-27T00:00:00.000Z',
      items: [{ id: 'item-1', name: 'Milk', unit: 'L', categoryId: 'cat-1', position: 0 }],
    }
    vi.mocked(repository.getById).mockResolvedValue(existing)
    vi.mocked(repository.update).mockResolvedValue(updated)

    const result = await useCase.execute({
      id: 'list-1',
      name: 'Updated Name',
      items: [{ name: 'Milk', unit: 'L', categoryId: 'cat-1' }],
    })

    expect(repository.update).toHaveBeenCalledWith('list-1', {
      name: 'Updated Name',
      items: [{ name: 'Milk', unit: 'L', categoryId: 'cat-1' }],
    })
    expect(result).toEqual(updated)
  })

  it('Given non-existent id, When executed, Then throws NotFoundError', async () => {
    vi.mocked(repository.getById).mockResolvedValue(null)

    await expect(
      useCase.execute({ id: 'bad-id', name: 'Name', items: [{ name: 'Milk', unit: 'L', categoryId: 'cat-1' }] }),
    ).rejects.toThrow(NotFoundError)
  })

  it('Given empty name, When executed, Then throws ValidationError', async () => {
    vi.mocked(repository.getById).mockResolvedValue(makeList('list-1'))

    await expect(
      useCase.execute({ id: 'list-1', name: '   ', items: [{ name: 'Milk', unit: 'L', categoryId: 'cat-1' }] }),
    ).rejects.toThrow(ValidationError)
  })
})
