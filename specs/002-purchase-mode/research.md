# Research: Purchase Mode

**Branch**: `002-purchase-mode` | **Date**: 2026-04-02

## R1: Fuzzy/Close Match Search Strategy

**Context**: The spec requires close-match (fuzzy) search for product names (FR-014) and market names (FR-003, FR-007). The strategy is implementation-defined per the Assumptions section.

**Decision**: Use **Fuse.js** for all client-side fuzzy search (products and markets).

**Rationale**:

- Smallest bundle (~7 KB minified), zero dependencies
- Simple API — create an index, call `.search(query)`
- Sufficient for mock-first phase where all data is in-memory
- When the backend arrives, search moves server-side (PostgreSQL trigram or full-text search) and the frontend simply calls an API endpoint — making the client-side library disposable
- Using a single library for both product and market search avoids unnecessary complexity

**Alternatives considered**:

- **FlexSearch** (~40 KB): More performant at scale but over-engineered for mock-first phase. Steeper configuration.
- **MiniSearch** (~60 KB): Better BM25 ranking but larger bundle. Not needed when datasets are small and temporary.
- **Manual substring filter**: Too simplistic — misses typos and partial matches that fuzzy search handles.

**Configuration**:

- Threshold: 0.4 (moderate tolerance for typos)
- Keys: `['name']` for both products and markets
- Max results: 20
- Debounce: 300ms on search input (standard for search-as-you-type UX)

---

## R2: Structured Address Matching for Market Duplicate Detection

**Context**: FR-009 requires that when creating a market, the system compares structured address fields against existing markets to prevent duplicates. The matching strategy is implementation-defined per Assumptions.

**Decision**: Normalized field-by-field exact comparison with case-insensitive, whitespace-trimmed matching.

**Rationale**:

- Structured fields (street, city, state/province, zip) enable direct comparison — no free-text parsing needed
- Normalize each field: lowercase, trim whitespace, collapse multiple spaces
- Match logic: if **zip** AND **city** AND **street** all match after normalization, treat as duplicate
- This catches obvious duplicates (same address typed differently: " Main St " vs "main st") without false positives from fuzzy matching on short fields
- Simple to implement, test, and reason about
- When backend arrives, this moves to a database query with normalized columns

**Alternatives considered**:

- **Levenshtein distance per field with weighted scoring**: More tolerant of typos but introduces false positives on short address fields (e.g., "5th" vs "6th"). Overkill for v1.
- **External geocoding API**: Out of scope per spec (no map-based detection).

---

## R3: GroceryItem Data Model Migration

**Context**: The spec's ⚠ DATA MODEL IMPACT note states that `GroceryItem` must gain a numeric `amount` field and the existing free-text `unit` string must become a select with predefined options.

**Decision**: Add `amount: number` field to `GroceryItem` and constrain `unit` to a predefined enum-like set of values.

**Rationale**:

- Current `GroceryItem`: `{ id, name, unit: string, categoryId, position }`
- New `GroceryItem`: `{ id, name, amount: number, unit: UnitType, categoryId, position }`
- `UnitType` defined as a union type: `'kg' | 'g' | 'L' | 'mL' | 'units'`
- The `amount` defaults to 1 when not specified (backward compatibility)
- Existing localStorage data migration: items without `amount` get `amount: 1`; existing `unit` strings are mapped to the closest `UnitType` value or default to `'units'`
- This change affects feature 001 components (ItemSubForm, GroceryListModal) — the `unit` text input becomes a `<select>` / Headless UI Listbox, and an `amount` number input is added

**Alternatives considered**:

- **Keep unit as free-text, add amount only**: Violates spec requirement for predefined unit select.
- **Create a new PurchaseItem-only model with amount/unit**: Duplicates the concept and diverges from the spec's intent that grocery items carry quantity information.

---

## R4: Mock Repository Strategy (Mock-First)

**Context**: Constitution IV mandates "When a backend endpoint does not yet exist, a realistic API mock MUST be created." No backend exists for Markets, Products, Purchases, or ProductPriceRecords.

**Decision**: Implement in-memory mock repositories that mirror the port interfaces, using `Map<string, Entity>` for storage. No network simulation or artificial delays.

**Rationale**:

- Matches the existing pattern from feature 001 (LocalStorageGroceryListRepository, LocalStorageCategoryRepository use localStorage as a simple persistence layer)
- For shared entities (Markets, Products), use in-memory `Map` storage with optional localStorage persistence for dev convenience
- Mock repositories implement the same port interfaces that the future backend adapters will implement — swapping is a DI container change only
- No artificial latency or network simulation needed for v1 — keeps tests fast and deterministic
- Seed data can be provided for development/testing via a factory function

**Alternatives considered**:

- **MSW (Mock Service Worker)**: Intercepts HTTP requests — useful when frontend is already calling REST endpoints. But since no HTTP client or API layer exists yet, this adds unnecessary indirection. Better suited when backend API contracts are finalized and HTTP calls are wired.
- **JSON files as fixtures**: Less flexible than in-memory maps. Harder to test create/update operations.

---

## R5: Purchase Mode State Management

**Context**: Purchase Mode involves complex transient state: selected market, list of grocery items with optional product assignments, running totals, unsaved changes tracking.

**Decision**: Use Jotai atoms for Purchase Mode state, following the existing pattern from feature 001.

**Rationale**:

- Constitution mandates Jotai for global/shared state
- Purchase state atoms: `activePurchaseAtom` (market + grocery list ref), `purchaseItemsAtom` (item assignments with products/prices), `purchaseTotalAtom` (derived — sum of line totals), `purchaseHasChangesAtom` (derived — tracks if any products assigned)
- Derived atoms handle real-time total calculation (SC-003: < 200ms update) automatically via Jotai's dependency graph
- Session-scoped: atoms reset when Purchase Mode closes (no persistence of in-progress purchases)

**Alternatives considered**:

- **React Context + useReducer**: Would work but deviates from constitution-mandated Jotai. Also less ergonomic for derived state.
- **Component-local useState**: Viable for small state but Purchase Mode spans multiple components (PurchaseView, ProductAssignmentDialog, PurchaseSummaryBar) that share state.

---

## R6: Currency Formatting

**Context**: All monetary values must use Argentine Peso format: `$` symbol, 2 decimal places, dot separator (e.g., `$1250.00`). Currency is global — not stored per-record.

**Decision**: Create a `formatPrice(amount: number): string` utility function.

**Rationale**:

- Simple template: `` `$${amount.toFixed(2)}` ``
- No Intl.NumberFormat needed — the spec explicitly defines the format as `$0.00` with dot separator, not locale-dependent
- Centralized in a single utility for consistency
- Used in PurchaseView, ProductAssignmentDialog, PurchaseSummaryBar

**Alternatives considered**:

- **Intl.NumberFormat with 'es-AR' locale**: Produces `$ 1.250,00` (dot as thousands separator, comma as decimal) which contradicts the spec's `$1250.00` format with dot as decimal separator.

---

## R7: Full-Screen View Pattern

**Context**: FR-025a states Purchase Mode renders as full-screen (fixed inset-0), same pattern as GroceryListModal from feature 001.

**Decision**: Reuse the same Headless UI `Dialog` + `fixed inset-0` pattern from GroceryListModal.

**Rationale**:

- GroceryListModal already implements this exact pattern — full viewport Dialog with Transition
- Purchase Mode uses the same approach: `<Dialog>` with `className="fixed inset-0 z-40"` containing the purchase content
- Product assignment and market selection dialogs layer on top at higher z-index (z-50)
- Exit confirmation dialog layers above that

**Alternatives considered**:

- **React Router page navigation**: Would require routing setup that doesn't exist. The Dialog pattern is already proven in the codebase and matches the spec's description.
