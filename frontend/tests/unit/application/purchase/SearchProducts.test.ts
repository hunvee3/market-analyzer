import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchProductsUseCase } from '@application/purchase/use-cases/SearchProducts.usecase'
import type { ProductRepository } from '@application/purchase/ports/ProductRepository.port'
import type { Product } from '@domain/purchase/Product'

const mockProducts: Product[] = [
  { id: 'p-1', name: 'Whole Milk', barcode: '123456789', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p-2', name: 'Skim Milk', barcode: '987654321', createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'p-3', name: 'White Bread', barcode: '111222333', createdAt: '2026-01-03T00:00:00.000Z' },
]

describe('SearchProductsUseCase', () => {
  let repo: ProductRepository
  let useCase: SearchProductsUseCase

  beforeEach(() => {
    repo = {
      getAll: vi.fn().mockResolvedValue(mockProducts),
      getById: vi.fn(),
      findByBarcode: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    }
    useCase = new SearchProductsUseCase(repo)
  })

  it('Given name strategy with empty query, When executed, Then returns all products', async () => {
    const result = await useCase.execute({ query: '', strategy: 'name' })
    expect(result).toHaveLength(3)
  })

  it('Given name strategy with matching query, When executed, Then returns fuzzy matches', async () => {
    const result = await useCase.execute({ query: 'Milk', strategy: 'name' })
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.map((p) => p.name)).toEqual(expect.arrayContaining(['Whole Milk', 'Skim Milk']))
  })

  it('Given barcode strategy with exact match, When executed, Then returns matching product', async () => {
    vi.mocked(repo.findByBarcode).mockResolvedValue(mockProducts[0])
    const result = await useCase.execute({ query: '123456789', strategy: 'barcode' })
    expect(result).toHaveLength(1)
    expect(result[0].barcode).toBe('123456789')
  })

  it('Given barcode strategy with no match, When executed, Then returns empty array', async () => {
    vi.mocked(repo.findByBarcode).mockResolvedValue(null)
    const result = await useCase.execute({ query: '000000000', strategy: 'barcode' })
    expect(result).toHaveLength(0)
  })
})
