import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchMarketsUseCase } from '@application/purchase/use-cases/SearchMarkets.usecase'
import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'
import type { Market } from '@domain/purchase/Market'

const mockMarkets: Market[] = [
  {
    id: 'm-1',
    name: 'Carrefour',
    address: { street: '123 Main St', city: 'Buenos Aires', state: 'CABA', zip: '1000' },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'm-2',
    name: 'Coto',
    address: { street: '456 Oak Ave', city: 'Buenos Aires', state: 'CABA', zip: '1001' },
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'm-3',
    name: 'Disco',
    address: { street: '789 Elm Rd', city: 'Córdoba', state: 'Córdoba', zip: '5000' },
    createdAt: '2026-01-03T00:00:00.000Z',
  },
]

describe('SearchMarketsUseCase', () => {
  let repo: MarketRepository
  let useCase: SearchMarketsUseCase

  beforeEach(() => {
    repo = {
      getAll: vi.fn().mockResolvedValue(mockMarkets),
      getById: vi.fn(),
      findByAddress: vi.fn(),
      create: vi.fn(),
    }
    useCase = new SearchMarketsUseCase(repo)
  })

  it('Given empty query, When executed, Then returns all markets', async () => {
    const result = await useCase.execute({ query: '' })
    expect(result).toHaveLength(3)
  })

  it('Given exact name query, When executed, Then returns matching market', async () => {
    const result = await useCase.execute({ query: 'Carrefour' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Carrefour')
  })

  it('Given partial/fuzzy query, When executed, Then returns close matches', async () => {
    const result = await useCase.execute({ query: 'Carre' })
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].name).toBe('Carrefour')
  })

  it('Given non-matching query, When executed, Then returns empty array', async () => {
    const result = await useCase.execute({ query: 'xyznonexistent' })
    expect(result).toHaveLength(0)
  })
})
