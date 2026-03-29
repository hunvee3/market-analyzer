import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import { ValidationError } from './use-case-types'
import type { CreateGroceryListInput } from './use-case-types'

export class CreateGroceryListUseCase {
  constructor(private readonly repository: GroceryListRepository) {}

  async execute(input: CreateGroceryListInput): Promise<GroceryList> {
    if (!input.name.trim()) {
      throw new ValidationError('name', 'required', 'List name is required')
    }
    if (input.items.length === 0) {
      throw new ValidationError('items', 'minLength', 'At least one item is required')
    }
    return this.repository.create({ name: input.name.trim(), items: input.items })
  }
}
