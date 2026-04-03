import { describe, it, expect, beforeEach } from 'vitest'
import { AssignProductUseCase } from '@application/purchase/use-cases/AssignProduct.usecase'
import type { AssignProductInput } from '@application/purchase/use-cases/use-case-types'

describe('AssignProductUseCase', () => {
  let useCase: AssignProductUseCase

  beforeEach(() => {
    useCase = new AssignProductUseCase()
  })

  it('Given valid input, When executed, Then returns PurchaseItem', async () => {
    const input: AssignProductInput = {
      groceryItemId: 'item-1',
      productId: 'prod-1',
      quantity: 2,
      unit: 'L',
      unitPrice: 150,
    }
    const result = await useCase.execute(input)
    expect(result).toEqual(expect.objectContaining({
      groceryItemId: 'item-1',
      productId: 'prod-1',
      quantity: 2,
      unit: 'L',
      unitPrice: 150,
    }))
    expect(result.id).toBeTruthy()
  })

  it('Given quantity <= 0, When executed, Then throws ValidationError', async () => {
    const input: AssignProductInput = {
      groceryItemId: 'item-1',
      productId: 'prod-1',
      quantity: 0,
      unit: 'kg',
      unitPrice: 100,
    }
    await expect(useCase.execute(input)).rejects.toThrow('quantity')
  })

  it('Given unitPrice <= 0, When executed, Then throws ValidationError', async () => {
    const input: AssignProductInput = {
      groceryItemId: 'item-1',
      productId: 'prod-1',
      quantity: 1,
      unit: 'kg',
      unitPrice: -5,
    }
    await expect(useCase.execute(input)).rejects.toThrow('unitPrice')
  })
})
