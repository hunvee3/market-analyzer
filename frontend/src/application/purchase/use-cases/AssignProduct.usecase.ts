import { v4 as uuidv4 } from 'uuid'
import type { AssignProductInput } from '@application/purchase/use-cases/use-case-types'
import type { PurchaseItem } from '@domain/purchase/Purchase'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

export class AssignProductUseCase {
  async execute(input: AssignProductInput): Promise<PurchaseItem> {
    if (input.quantity <= 0) {
      throw new ValidationError('quantity', 'positive', 'quantity must be greater than 0')
    }
    if (input.unitPrice <= 0) {
      throw new ValidationError('unitPrice', 'positive', 'unitPrice must be greater than 0')
    }

    return {
      id: uuidv4(),
      groceryItemId: input.groceryItemId,
      productId: input.productId,
      quantity: input.quantity,
      unit: input.unit,
      unitPrice: input.unitPrice,
    }
  }
}
