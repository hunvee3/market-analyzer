import { describe, it, expect } from 'vitest'
import { UpdateProductAssignmentUseCase } from '@application/purchase/use-cases/UpdateProductAssignment.usecase'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

describe('UpdateProductAssignmentUseCase', () => {
  const useCase = new UpdateProductAssignmentUseCase()

  it('Given valid input, When execute, Then returns updated PurchaseItem', async () => {
    const result = await useCase.execute({
      purchaseItemId: 'pi-1',
      productId: 'prod-2',
      quantity: 3,
      unit: 'kg',
      unitPrice: 250,
    })

    expect(result.id).toBe('pi-1')
    expect(result.productId).toBe('prod-2')
    expect(result.quantity).toBe(3)
    expect(result.unit).toBe('kg')
    expect(result.unitPrice).toBe(250)
  })

  it('Given quantity <= 0, When execute, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({
        purchaseItemId: 'pi-1',
        productId: 'prod-2',
        quantity: 0,
        unit: 'kg',
        unitPrice: 250,
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('Given unitPrice <= 0, When execute, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({
        purchaseItemId: 'pi-1',
        productId: 'prod-2',
        quantity: 3,
        unit: 'kg',
        unitPrice: -1,
      }),
    ).rejects.toThrow(ValidationError)
  })
})
