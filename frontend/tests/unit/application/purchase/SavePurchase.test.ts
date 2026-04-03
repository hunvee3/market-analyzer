import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SavePurchaseUseCase } from '@application/purchase/use-cases/SavePurchase.usecase'
import type { PurchaseRepository } from '@application/purchase/ports/PurchaseRepository.port'
import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'

describe('SavePurchaseUseCase', () => {
  let purchaseRepo: PurchaseRepository
  let priceRecordRepo: ProductPriceRecordRepository
  let useCase: SavePurchaseUseCase

  beforeEach(() => {
    purchaseRepo = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: 'purchase-1',
        groceryListId: input.groceryListId,
        marketId: input.marketId,
        date: input.date,
        items: input.items.map((item: Record<string, unknown>, i: number) => ({ id: `pi-${i}`, ...item })),
        createdAt: new Date().toISOString(),
      })) as unknown as PurchaseRepository['create'],
    }
    priceRecordRepo = {
      getLastPriceForProduct: vi.fn(),
      createBatch: vi.fn().mockResolvedValue([]),
    }
    useCase = new SavePurchaseUseCase(purchaseRepo, priceRecordRepo)
  })

  it('Given valid input with items, When executed, Then creates purchase and price records', async () => {
    const result = await useCase.execute({
      groceryListId: 'list-1',
      marketId: 'm-1',
      items: [
        { groceryItemId: 'item-1', productId: 'prod-1', quantity: 2, unit: 'L', unitPrice: 150 },
      ],
    })

    expect(purchaseRepo.create).toHaveBeenCalled()
    expect(priceRecordRepo.createBatch).toHaveBeenCalled()
    expect(result).toBeDefined()
    expect(result.groceryListId).toBe('list-1')
  })

  it('Given empty items array, When executed, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({
        groceryListId: 'list-1',
        marketId: 'm-1',
        items: [],
      }),
    ).rejects.toThrow('items')
  })
})
