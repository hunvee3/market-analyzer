import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetLastProductPriceUseCase } from '@application/purchase/use-cases/GetLastProductPrice.usecase'
import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'
import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'

describe('GetLastProductPriceUseCase', () => {
  let repo: ProductPriceRecordRepository
  let useCase: GetLastProductPriceUseCase

  beforeEach(() => {
    repo = {
      getLastPriceForProduct: vi.fn(),
      createBatch: vi.fn(),
    }
    useCase = new GetLastProductPriceUseCase(repo)
  })

  it('Given product with price history, When executed, Then returns last price record', async () => {
    const record: ProductPriceRecord = {
      id: 'pr-1',
      productId: 'p-1',
      marketId: 'm-1',
      unitPrice: 250.5,
      date: '2026-03-01',
      createdAt: '2026-03-01T00:00:00.000Z',
    }
    vi.mocked(repo.getLastPriceForProduct).mockResolvedValue(record)

    const result = await useCase.execute({ productId: 'p-1' })
    expect(result).toEqual(record)
    expect(repo.getLastPriceForProduct).toHaveBeenCalledWith('p-1')
  })

  it('Given product with no history, When executed, Then returns null', async () => {
    vi.mocked(repo.getLastPriceForProduct).mockResolvedValue(null)

    const result = await useCase.execute({ productId: 'p-1' })
    expect(result).toBeNull()
  })
})
