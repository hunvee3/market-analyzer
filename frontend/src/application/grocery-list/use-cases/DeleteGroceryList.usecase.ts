import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import { NotFoundError } from './use-case-types'

export class DeleteGroceryListUseCase {
  constructor(private readonly repository: GroceryListRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const list = await this.repository.getById(id)
    if (!list) throw new NotFoundError(id)
    await this.repository.delete(id)
  }
}
