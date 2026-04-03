/**
 * SHARED INPUT/OUTPUT TYPES — Purchase Mode
 *
 * Canonical types used across purchase use-case signatures and port contracts.
 * These live at the application layer boundary — no framework or
 * infrastructure imports permitted here.
 */

import type { UnitType } from '@domain/shared/UnitType'
import type { Market } from '@domain/purchase/Market'
import type { Product } from '@domain/purchase/Product'
import type { Purchase } from '@domain/purchase/Purchase'
import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'

// ---------------------------------------------------------------------------
// Use Case: SearchMarkets
// ---------------------------------------------------------------------------

// Input: query string (market name, partial match)
// Output: Market[] — fuzzy matches sorted by relevance

export interface SearchMarketsInput {
  query: string // search term for market name
}

// ---------------------------------------------------------------------------
// Use Case: CreateMarket
// ---------------------------------------------------------------------------

export interface CreateMarketInput {
  name: string    // non-empty after trim
  address: {
    street: string  // non-empty after trim
    city: string    // non-empty after trim
    state: string   // non-empty after trim
    zip: string     // non-empty after trim
  }
}

export type CreateMarketResult =
  | { type: 'created'; market: Market }
  | { type: 'duplicate_address'; existingMarket: Market }

// ---------------------------------------------------------------------------
// Use Case: SearchProducts
// ---------------------------------------------------------------------------

export interface SearchProductsInput {
  query: string             // search term
  strategy: 'name' | 'barcode' // 'name' = fuzzy, 'barcode' = exact
}

// ---------------------------------------------------------------------------
// Use Case: CreateProduct
// ---------------------------------------------------------------------------

export interface CreateProductInput {
  name: string    // non-empty after trim
  barcode: string // non-empty after trim
}

export type CreateProductResult =
  | { type: 'created'; product: Product }
  | { type: 'duplicate_barcode'; existingProduct: Product }

// ---------------------------------------------------------------------------
// Use Case: AssignProduct
// ---------------------------------------------------------------------------

export interface AssignProductInput {
  groceryItemId: string
  productId: string
  quantity: number    // must be > 0
  unit: UnitType
  unitPrice: number   // must be > 0
}

// ---------------------------------------------------------------------------
// Use Case: UpdateProductAssignment
// ---------------------------------------------------------------------------

export interface UpdateProductAssignmentInput {
  purchaseItemId: string  // ID of the existing PurchaseItem to update
  productId: string
  quantity: number    // must be > 0
  unit: UnitType
  unitPrice: number   // must be > 0
}

// ---------------------------------------------------------------------------
// Use Case: GetLastProductPrice
// ---------------------------------------------------------------------------

export interface GetLastProductPriceInput {
  productId: string
}

// Output: ProductPriceRecord | null

// ---------------------------------------------------------------------------
// Use Case: SavePurchase
// ---------------------------------------------------------------------------

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

// Output: Purchase

// ---------------------------------------------------------------------------
// Re-exported error types (shared with feature 001)
// ---------------------------------------------------------------------------

export { ValidationError, NotFoundError } from '@application/grocery-list/use-cases/use-case-types'
