import type { PurchaseItem } from '@domain/purchase/Purchase'
import type { UpdateProductAssignmentInput } from '@application/purchase/use-cases/use-case-types'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

export class UpdateProductAssignmentUseCase {
  async execute(input: UpdateProductAssignmentInput): Promise<PurchaseItem> {
    if (input.quantity <= 0) {
      throw new ValidationError('quantity', 'positive', 'Quantity must be greater than 0')
    }
    if (input.unitPrice <= 0) {
      throw new ValidationError('unitPrice', 'positive', 'Unit price must be greater than 0')
    }

    return {
      id: input.purchaseItemId,
      groceryItemId: '', // Preserved by caller — not updated here
      productId: input.productId,
      quantity: input.quantity,
      unit: input.unit,
      unitPrice: input.unitPrice,
    }
  }
}
