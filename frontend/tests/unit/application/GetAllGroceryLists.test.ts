import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAllGroceryListsUseCase } from '@application/grocery-list/use-cases/GetAllGroceryLists.usecase'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

const makeList = (id: string, updatedAt: string): GroceryList => ({
  id,
  name: `List ${id}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt,
  items: [],
})

describe('GetAllGroceryListsUseCase', () => {
  let repository: GroceryListRepository
  let useCase: GetAllGroceryListsUseCase

  beforeEach(() => {
    repository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    useCase = new GetAllGroceryListsUseCase(repository)
  })

  it('Given repository returns lists in random order, When executed, Then returns them sorted by updatedAt descending', async () => {
    const listA = makeList('a', '2026-01-01T00:00:00.000Z')
    const listB = makeList('b', '2026-03-01T00:00:00.000Z')
    const listC = makeList('c', '2026-02-01T00:00:00.000Z')
    vi.mocked(repository.getAll).mockResolvedValue([listA, listB, listC])

    const result = await useCase.execute()

    expect(result[0].id).toBe('b')
    expect(result[1].id).toBe('c')
    expect(result[2].id).toBe('a')
  })

  it('Given repository returns empty array, When executed, Then returns empty array', async () => {
    vi.mocked(repository.getAll).mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toEqual([])
  })
})
