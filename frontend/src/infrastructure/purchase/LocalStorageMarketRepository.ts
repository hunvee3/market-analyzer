import { v4 as uuidv4 } from 'uuid'
import type { Market } from '@domain/purchase/Market'
import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'

const STORAGE_KEY = 'smart-basket:v1:markets'

export class LocalStorageMarketRepository implements MarketRepository {
  private readAll(): Market[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as Market[]
    } catch (err) {
      console.error('Failed to parse markets from localStorage:', err)
      return []
    }
  }

  private writeAll(markets: Market[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markets))
  }

  async getAll(): Promise<Market[]> {
    return this.readAll()
  }

  async getById(id: string): Promise<Market | null> {
    return this.readAll().find((m) => m.id === id) ?? null
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

    return this.readAll().filter((m) => {
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
    const markets = this.readAll()
    const market: Market = {
      id: uuidv4(),
      name: input.name,
      address: input.address,
      createdAt: new Date().toISOString(),
    }
    markets.push(market)
    this.writeAll(markets)
    return market
  }
}
