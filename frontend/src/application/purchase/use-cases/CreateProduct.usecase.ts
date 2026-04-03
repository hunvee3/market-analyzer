import type { ProductRepository } from '@application/purchase/ports/ProductRepository.port'
import type { CreateProductInput, CreateProductResult } from '@application/purchase/use-cases/use-case-types'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<CreateProductResult> {
    const name = input.name.trim()
    if (!name) {
      throw new ValidationError('name', 'required', 'Name is required')
    }

    const barcode = input.barcode.trim()
    if (!barcode) {
      throw new ValidationError('barcode', 'required', 'Barcode is required')
    }

    const existing = await this.productRepository.findByBarcode(barcode)
    if (existing) {
      return { type: 'duplicate_barcode', existingProduct: existing }
    }

    const product = await this.productRepository.create({ name, barcode })
    return { type: 'created', product }
  }
}
