import Fuse from 'fuse.js'
import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'
import type { SearchMarketsInput } from '@application/purchase/use-cases/use-case-types'
import type { Market } from '@domain/purchase/Market'

export class SearchMarketsUseCase {
  constructor(private readonly marketRepository: MarketRepository) {}

  async execute(input: SearchMarketsInput): Promise<Market[]> {
    const all = await this.marketRepository.getAll()
    const query = input.query.trim()
    if (!query) return all

    const fuse = new Fuse(all, {
      keys: ['name'],
      threshold: 0.4,
    })

    return fuse.search(query, { limit: 20 }).map((r) => r.item)
  }
}
