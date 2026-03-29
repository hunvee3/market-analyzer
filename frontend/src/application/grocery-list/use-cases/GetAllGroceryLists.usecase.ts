import { compareDesc, parseISO } from 'date-fns'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'

export class GetAllGroceryListsUseCase {
  constructor(private readonly repository: GroceryListRepository) {}

  async execute(): Promise<GroceryList[]> {
    const lists = await this.repository.getAll()
    return [...lists].sort((a, b) => compareDesc(parseISO(a.updatedAt), parseISO(b.updatedAt)))
  }
}
