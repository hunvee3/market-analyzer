# Data Model: Purchase Mode

**Branch**: `002-purchase-mode` | **Date**: 2026-04-02
**Depends on**: `001-grocery-list-manager` (GroceryList, GroceryItem, Category)

## Unit Type (shared value)

Predefined unit options shared between grocery items and purchase items.

```typescript
type UnitType = 'kg' | 'g' | 'L' | 'mL' | 'units';

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
	{ value: 'kg', label: 'kg' },
	{ value: 'g', label: 'g' },
	{ value: 'L', label: 'L' },
	{ value: 'mL', label: 'mL' },
	{ value: 'units', label: 'units' },
];
```

---

## Modified Entity: GroceryItem (from feature 001)

⚠ **DATA MODEL IMPACT**: Adds `amount` field and constrains `unit` to `UnitType`.

```typescript
interface GroceryItem {
	id: string; // UUID v4 — unchanged
	name: string; // unchanged
	amount: number; // NEW — positive decimal, defaults to 1. Represents quantity.
	unit: UnitType; // CHANGED — was free-text string, now constrained to UnitType
	categoryId: string; // unchanged
	position: number; // unchanged
}
```

**Validation rules**:

- `amount`: required, must be > 0, accepts decimal values (e.g., 1.5, 0.25)
- `unit`: required, must be one of the `UnitType` values

**Migration**: Existing localStorage data without `amount` gets `amount: 1`. Existing `unit` strings are mapped: exact matches to `UnitType` values are kept; unrecognized values default to `'units'`.

---

## New Entities

### Market

A store or supermarket where purchases are made. Shared across all users.

```typescript
interface MarketAddress {
	street: string; // non-empty after trim
	city: string; // non-empty after trim
	state: string; // non-empty after trim (state/province)
	zip: string; // non-empty after trim (zip/postal code)
}

interface Market {
	id: string; // UUID v4 — generated at creation
	name: string; // non-empty after trim
	address: MarketAddress;
	createdAt: string; // ISO 8601 UTC
}
```

**Validation rules**:

- `name`: required, non-empty after `.trim()`
- `address.street`: required, non-empty after `.trim()`
- `address.city`: required, non-empty after `.trim()`
- `address.state`: required, non-empty after `.trim()`
- `address.zip`: required, non-empty after `.trim()`

**Duplicate detection**:

- Name: fuzzy search via Fuse.js shows close matches as user types (FR-007)
- Address: normalized field comparison — if `zip` + `city` + `street` match (case-insensitive, trimmed), the existing market is loaded automatically (FR-009)

---

### Product

A real product that can be purchased. Shared across all users.

```typescript
interface Product {
	id: string; // UUID v4 — generated at creation
	name: string; // non-empty after trim
	barcode: string; // non-empty after trim — free-text (EAN-13, UPC-A, etc.)
	createdAt: string; // ISO 8601 UTC
}
```

**Validation rules**:

- `name`: required, non-empty after `.trim()`
- `barcode`: required, non-empty after `.trim()` — no format validation beyond non-empty (per Assumptions)

**Duplicate detection** (sequential two-step — FR-022, FR-023):

1. User enters name → system shows fuzzy matches (Fuse.js). If user selects one, creation cancelled.
2. User enters barcode → system checks exact match. If found, creation blocked and matched product used.

---

### ProductPriceRecord

Historical record of a product's unit price at a specific market on a specific date.

```typescript
interface ProductPriceRecord {
	id: string; // UUID v4
	productId: string; // references Product.id
	marketId: string; // references Market.id
	unitPrice: number; // positive decimal — price per single unit in ARS
	date: string; // ISO 8601 date (YYYY-MM-DD) — the purchase date
	createdAt: string; // ISO 8601 UTC
}
```

**Validation rules**:

- `unitPrice`: required, must be > 0
- `productId`: required, must reference an existing Product
- `marketId`: required, must reference an existing Market

**Query pattern**: "Last price for product X" = most recent `ProductPriceRecord` for `productId === X`, ordered by `date` descending, taking the first result.

---

### Purchase

A record of buying products from a grocery list at a specific market on a specific date.

```typescript
interface Purchase {
	id: string; // UUID v4 — generated at creation
	groceryListId: string; // references GroceryList.id
	marketId: string; // references Market.id
	date: string; // ISO 8601 date (YYYY-MM-DD) — auto-set to current day, not user-editable
	items: PurchaseItem[]; // at least one item required for save
	createdAt: string; // ISO 8601 UTC
}
```

**Validation rules**:

- `groceryListId`: required, must reference an existing GroceryList
- `marketId`: required, must reference an existing Market
- `items`: required, minimum length 1 (FR-030)
- `date`: auto-set to today (format-only via `date-fns`)

---

### PurchaseItem

Links a grocery list item to a real product with quantity and unit price.

```typescript
interface PurchaseItem {
	id: string; // UUID v4
	groceryItemId: string; // references GroceryItem.id from the source grocery list
	productId: string; // references Product.id
	quantity: number; // positive decimal — prefilled from GroceryItem.amount
	unit: UnitType; // prefilled from GroceryItem.unit
	unitPrice: number; // positive decimal — price per unit in ARS, entered by user
	lineTotal: number; // derived: quantity × unitPrice (computed, not stored)
}
```

**Validation rules**:

- `quantity`: required, must be > 0 (FR-019)
- `unitPrice`: required, must be > 0 (FR-019)
- `productId`: required, must reference an existing Product
- `groceryItemId`: required, must reference a GroceryItem in the source grocery list

**Note**: `lineTotal` is computed (`quantity * unitPrice`) and not persisted. The purchase total is the sum of all `lineTotal` values across items.

---

## Entity Relationship Summary

```text
GroceryList (001) ──<owns>──── GroceryItem (001, modified)
     │
     │ groceryListId
     ▼
  Purchase ──<at>──── Market
     │                  │
     │ items            │ marketId
     ▼                  ▼
PurchaseItem        ProductPriceRecord
     │                  │
     │ productId        │ productId
     ▼                  ▼
  Product ◄─────────────┘
```

- A **GroceryList** can have many **Purchases** (reusable across markets/days)
- A **Purchase** belongs to exactly one **GroceryList** and one **Market**
- A **Purchase** has many **PurchaseItems** (min 1 for save)
- A **PurchaseItem** links one **GroceryItem** to one **Product**
- A **Product** has many **ProductPriceRecords** (one per market per date)
- A **Market** has many **ProductPriceRecords**
- **Markets** and **Products** are shared (global) entities
