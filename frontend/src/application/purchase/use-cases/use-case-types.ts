import type { UnitType } from '@domain/shared/UnitType'
import type { Market } from '@domain/purchase/Market'
import type { Product } from '@domain/purchase/Product'

// SearchMarkets
export interface SearchMarketsInput {
  query: string
}

// CreateMarket
export interface CreateMarketInput {
  name: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export type CreateMarketResult =
  | { type: 'created'; market: Market }
  | { type: 'duplicate_address'; existingMarket: Market }

// SearchProducts
export interface SearchProductsInput {
  query: string
  strategy: 'name' | 'barcode'
}

// CreateProduct
export interface CreateProductInput {
  name: string
  barcode: string
}

export type CreateProductResult =
  | { type: 'created'; product: Product }
  | { type: 'duplicate_barcode'; existingProduct: Product }

// AssignProduct
export interface AssignProductInput {
  groceryItemId: string
  productId: string
  quantity: number
  unit: UnitType
  unitPrice: number
}

// UpdateProductAssignment
export interface UpdateProductAssignmentInput {
  purchaseItemId: string
  productId: string
  quantity: number
  unit: UnitType
  unitPrice: number
}

// GetLastProductPrice
export interface GetLastProductPriceInput {
  productId: string
}

// SavePurchase
export interface SavePurchaseInput {
  groceryListId: string
  marketId: string
  items: Array<{
    groceryItemId: string
    productId: string
    quantity: number
    unit: UnitType
    unitPrice: number
  }>
}
