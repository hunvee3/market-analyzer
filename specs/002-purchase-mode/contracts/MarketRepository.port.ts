/**
 * PORT: MarketRepository
 *
 * Defines the contract for market persistence operations.
 * Implementations: MockMarketRepository (mock-first), future API adapter.
 */

import type { Market } from '@domain/purchase/Market'

export interface MarketRepository {
  /** Return all markets. Used for search indexing. */
  getAll(): Promise<Market[]>

  /** Find a market by its ID. Returns null if not found. */
  getById(id: string): Promise<Market | null>

  /**
   * Find markets whose normalized address fields (zip + city + street)
   * match the given address. Used for duplicate detection during creation.
   */
  findByAddress(address: {
    street: string
    city: string
    state: string
    zip: string
  }): Promise<Market[]>

  /** Persist a new market and return the created entity. */
  create(input: {
    name: string
    address: { street: string; city: string; state: string; zip: string }
  }): Promise<Market>
}
