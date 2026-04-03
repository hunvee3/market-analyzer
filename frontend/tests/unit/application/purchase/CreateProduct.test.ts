import { describe, it, expect, beforeEach } from 'vitest'
import { CreateProductUseCase } from '@application/purchase/use-cases/CreateProduct.usecase'
import { MockProductRepository } from '@infrastructure/purchase/MockProductRepository'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

describe('CreateProductUseCase', () => {
  let productRepository: MockProductRepository
  let useCase: CreateProductUseCase

  beforeEach(() => {
    productRepository = new MockProductRepository()
    useCase = new CreateProductUseCase(productRepository)
  })

  it('Given valid input with no barcode duplicate, When execute, Then creates product', async () => {
    const result = await useCase.execute({ name: 'Organic Milk', barcode: '1234567890' })

    expect(result.type).toBe('created')
    if (result.type === 'created') {
      expect(result.product.name).toBe('Organic Milk')
      expect(result.product.barcode).toBe('1234567890')
      expect(result.product.id).toBeTruthy()
    }
  })

  it('Given barcode matches existing product, When execute, Then returns duplicate_barcode', async () => {
    await productRepository.create({ name: 'Existing Milk', barcode: '1234567890' })

    const result = await useCase.execute({ name: 'New Milk', barcode: '1234567890' })

    expect(result.type).toBe('duplicate_barcode')
    if (result.type === 'duplicate_barcode') {
      expect(result.existingProduct.name).toBe('Existing Milk')
    }
  })

  it('Given empty name, When execute, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({ name: '', barcode: '1234567890' }),
    ).rejects.toThrow(ValidationError)
  })

  it('Given empty barcode, When execute, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({ name: 'Milk', barcode: '' }),
    ).rejects.toThrow(ValidationError)
  })
})
