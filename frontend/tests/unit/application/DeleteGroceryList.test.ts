import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteGroceryListUseCase } from '@application/grocery-list/use-cases/DeleteGroceryList.usecase'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import { NotFoundError } from '@application/grocery-list/use-cases/use-case-types'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

const makeList = (id: string): GroceryList => ({
  id,
  name: `List ${id}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  items: [],
})

describe('DeleteGroceryListUseCase', () => {
  let repository: GroceryListRepository
  let useCase: DeleteGroceryListUseCase

  beforeEach(() => {
    repository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    useCase = new DeleteGroceryListUseCase(repository)
  })

  it('Given a valid list id, When executed, Then calls repository.delete(id) exactly once', async () => {
    vi.mocked(repository.getById).mockResolvedValue(makeList('list-1'))
    vi.mocked(repository.delete).mockResolvedValue(undefined)

    await useCase.execute({ id: 'list-1' })

    expect(repository.delete).toHaveBeenCalledOnce()
    expect(repository.delete).toHaveBeenCalledWith('list-1')
  })

  it('Given a non-existent id, When executed, Then throws NotFoundError', async () => {
    vi.mocked(repository.getById).mockResolvedValue(null)

    await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow(NotFoundError)
  })
})
