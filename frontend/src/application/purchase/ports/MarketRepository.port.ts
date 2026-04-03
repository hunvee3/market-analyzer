import type { Market } from '@domain/purchase/Market'

export interface MarketRepository {
  getAll(): Promise<Market[]>
  getById(id: string): Promise<Market | null>
  findByAddress(address: {
    street: string
    city: string
    state: string
    zip: string
  }): Promise<Market[]>
  create(input: {
    name: string
    address: { street: string; city: string; state: string; zip: string }
  }): Promise<Market>
}
