import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'
import type { CreateMarketInput, CreateMarketResult } from '@application/purchase/use-cases/use-case-types'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

export class CreateMarketUseCase {
  constructor(private readonly marketRepository: MarketRepository) {}

  async execute(input: CreateMarketInput): Promise<CreateMarketResult> {
    const name = input.name.trim()
    if (!name) {
      throw new ValidationError('name', 'required', 'Market name is required')
    }

    const { street, city, state, zip } = input.address
    if (!street.trim()) {
      throw new ValidationError('street', 'required', 'Street is required')
    }
    if (!city.trim()) {
      throw new ValidationError('city', 'required', 'City is required')
    }
    if (!state.trim()) {
      throw new ValidationError('state', 'required', 'State is required')
    }
    if (!zip.trim()) {
      throw new ValidationError('zip', 'required', 'Zip is required')
    }

    const duplicates = await this.marketRepository.findByAddress(input.address)
    if (duplicates.length > 0) {
      return { type: 'duplicate_address', existingMarket: duplicates[0] }
    }

    const market = await this.marketRepository.create({
      name,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
      },
    })

    return { type: 'created', market }
  }
}
