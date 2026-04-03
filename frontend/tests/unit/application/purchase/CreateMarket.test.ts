import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMarketUseCase } from '@application/purchase/use-cases/CreateMarket.usecase'
import { MockMarketRepository } from '@infrastructure/purchase/MockMarketRepository'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

describe('CreateMarketUseCase', () => {
  let marketRepository: MockMarketRepository
  let useCase: CreateMarketUseCase

  beforeEach(() => {
    marketRepository = new MockMarketRepository()
    useCase = new CreateMarketUseCase(marketRepository)
  })

  it('Given valid input with no address duplicate, When execute, Then creates market', async () => {
    const result = await useCase.execute({
      name: 'Fresh Mart',
      address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
    })

    expect(result.type).toBe('created')
    if (result.type === 'created') {
      expect(result.market.name).toBe('Fresh Mart')
      expect(result.market.address.street).toBe('123 Main St')
      expect(result.market.id).toBeTruthy()
    }
  })

  it('Given address matches existing market, When execute, Then returns duplicate_address', async () => {
    await marketRepository.create({
      name: 'Existing Store',
      address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
    })

    const result = await useCase.execute({
      name: 'New Store',
      address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
    })

    expect(result.type).toBe('duplicate_address')
    if (result.type === 'duplicate_address') {
      expect(result.existingMarket.name).toBe('Existing Store')
    }
  })

  it('Given empty name, When execute, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({
        name: '',
        address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
      }),
    ).rejects.toThrow(ValidationError)
  })

  it('Given empty address field, When execute, Then throws ValidationError', async () => {
    await expect(
      useCase.execute({
        name: 'Fresh Mart',
        address: { street: '', city: 'Springfield', state: 'IL', zip: '62701' },
      }),
    ).rejects.toThrow(ValidationError)
  })
})
