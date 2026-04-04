import { v4 as uuidv4 } from 'uuid'
import type { Market } from '@domain/purchase/Market'
import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'

export class MockMarketRepository implements MarketRepository {
  private markets = new Map<string, Market>()

  async getAll(): Promise<Market[]> {
    return Array.from(this.markets.values())
  }

  async getById(id: string): Promise<Market | null> {
    return this.markets.get(id) ?? null
  }

  async findByAddress(address: {
    street: string
    city: string
    state: string
    zip: string
  }): Promise<Market[]> {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
    const nZip = normalize(address.zip)
    const nCity = normalize(address.city)
    const nStreet = normalize(address.street)

    return Array.from(this.markets.values()).filter((m) => {
      return (
        normalize(m.address.zip) === nZip &&
        normalize(m.address.city) === nCity &&
        normalize(m.address.street) === nStreet
      )
    })
  }

  async create(input: {
    name: string
    address: { street: string; city: string; state: string; zip: string }
  }): Promise<Market> {
    const market: Market = {
      id: uuidv4(),
      name: input.name,
      address: input.address,
      createdAt: new Date().toISOString(),
    }
    this.markets.set(market.id, market)
    return market
  }
}
