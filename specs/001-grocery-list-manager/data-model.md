# Data Model: Grocery List Manager

**Branch**: `001-grocery-list-manager` | **Date**: 2026-03-27

## Entities

### GroceryList

Represents a named collection of items intended for a shopping trip.

```typescript
interface GroceryList {
  id: string;          // UUID v4 — generated at creation
  name: string;        // non-empty after trim; duplicates across lists allowed
  createdAt: string;   // ISO 8601 UTC — set at creation; displayed on card
  updatedAt: string;   // ISO 8601 UTC — updated on every save; used for dashboard sort order
  items: GroceryItem[];// ordered array; insertion order preserved
}
```

**Validation rules**:
- `name`: required, non-empty after `.trim()`
- `items`: minimum length 1 — saving a list with zero items MUST be blocked

---

### GroceryItem

A single product entry within a list. Ordered by insertion within its category section.

```typescript
interface GroceryItem {
  id: string;          // UUID v4 — generated at creation
  name: string;        // non-empty after trim
  unit: string;        // non-empty after trim; free-text (e.g. "kg", "L", "units")
  categoryId: string;  // FK → Category.id; must reference an existing Category
  position: number;    // 0-based insertion index within the list (global, not per-category)
}
```

**Validation rules**:
- `name`: required, non-empty after `.trim()`
- `unit`: required, non-empty after `.trim()`
- `categoryId`: required, must resolve to an existing Category
- `position`: assigned sequentially at insertion; not user-modifiable in this feature

---

### Category

A named grouping label shared across all lists for the session user.

```typescript
interface Category {
  id: string;           // UUID v4
  name: string;         // original-casing display name (e.g. "Dairy")
  normalizedName: string; // name.trim().toLowerCase() — used for dedup matching
  createdAt: string;    // ISO 8601 UTC
}
```

**Validation rules**:
- `name`: required, non-empty after trim
- `normalizedName`: derived from `name` — `name.trim().toLowerCase()`
- **Uniqueness**: `normalizedName` MUST be unique per user session. Before creating a new
  Category, the system checks for an existing entry whose `normalizedName` matches
  `input.trim().toLowerCase()`. If found, the existing Category is reused.

---

## Relationships

```
GroceryList 1 ──< GroceryItem (items[])
GroceryItem >── 1 Category (categoryId)
Category 1 ──< GroceryItem (across all lists)
```

- A `GroceryList` owns its `GroceryItem[]` — items are embedded in the list (not shared).
- A `Category` is referenced by many `GroceryItem` records across all lists.
- Deleting a `GroceryList` removes its items. Categories are NOT deleted with the list.

---

## Derived View: Items Grouped by Category

The modal renders items grouped by category. This is a derived view — the underlying
`GroceryList.items` array retains insertion order. Grouping is computed at render time:

```
GroupedItems = items
  .reduce(groupByCategory)           // Map<categoryId, GroceryItem[]>
  .sortGroupsByFirstItemPosition()   // Groups appear in order of their first item
```

No separate persistence structure is needed — the sort is deterministic from the flat array.

---

## LocalStorage Schema

All data serialized as JSON. Keys are versioned to allow future migrations.

| Key | Type | Contents |
|---|---|---|
| `smart-basket:v1:grocery-lists` | `GroceryList[]` | All lists for the session user |
| `smart-basket:v1:categories` | `Category[]` | All categories for the session user |

**Serialization notes**:
- `createdAt` / `updatedAt` stored as ISO 8601 strings. Parsed back via `parseISO` from `date-fns`.
- Entire array is read, modified, and written back atomically per operation (no partial writes).
- On read failure / parse error: adapter returns empty arrays and logs the error via console.error.
  Data is treated as absent, not corrupted — the user can start fresh.

---

## Port Interfaces (Application Layer)

### GroceryListRepository

```typescript
interface GroceryListRepository {
  getAll(): Promise<GroceryList[]>;
  getById(id: string): Promise<GroceryList | null>;
  create(list: Omit<GroceryList, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroceryList>;
  update(id: string, list: Omit<GroceryList, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroceryList>;
  delete(id: string): Promise<void>;
}
```

### CategoryRepository

```typescript
interface CategoryRepository {
  getAll(): Promise<Category[]>;
  findByNormalizedName(normalizedName: string): Promise<Category | null>;
  create(name: string): Promise<Category>;
}
```

---

## Use Case Input/Output Types

| Use Case | Input | Output |
|---|---|---|
| `GetAllGroceryLists` | — | `GroceryList[]` sorted by `updatedAt` desc |
| `CreateGroceryList` | `{ name: string; items: NewItemInput[] }` | `GroceryList` |
| `UpdateGroceryList` | `{ id: string; name: string; items: NewItemInput[] }` | `GroceryList` |
| `DeleteGroceryList` | `{ id: string }` | `void` |
| `GetAllCategories` | — | `Category[]` |
| `CreateOrReuseCategory` | `{ name: string }` | `Category` (new or existing) |

```typescript
interface NewItemInput {
  name: string;
  unit: string;
  categoryId: string;
}
```
