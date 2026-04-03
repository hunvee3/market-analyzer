import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import { ValidationError, NotFoundError } from './use-case-types'
import type { UpdateGroceryListInput } from './use-case-types'

export class UpdateGroceryListUseCase {
  constructor(private readonly repository: GroceryListRepository) {}

  async execute(input: UpdateGroceryListInput): Promise<GroceryList> {
    const existing = await this.repository.getById(input.id)
    if (!existing) throw new NotFoundError(input.id)
    if (!input.name.trim()) {
      throw new ValidationError('name', 'required', 'List name is required')
    }
    if (input.items.length === 0) {
      throw new ValidationError('items', 'minLength', 'At least one item is required')
    }
    return this.repository.update(input.id, { name: input.name.trim(), items: input.items })
  }
}
