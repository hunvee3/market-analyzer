# Tasks: Purchase Mode

**Input**: Design documents from `/specs/002-purchase-mode/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included — Constitution II mandates TDD for all use cases and non-style components.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story (US1–US6) this task belongs to
- All paths relative to `frontend/src/` unless otherwise noted

---

## Phase 1: Setup

**Purpose**: Install dependencies and create shared domain types used across all stories.

- [x] T001 Install fuse.js dependency in frontend/package.json
- [x] T002 [P] Create UnitType union and UNIT_OPTIONS array in frontend/src/domain/shared/UnitType.ts
- [x] T003 [P] Create formatPrice utility function in frontend/src/presentation/utils/formatPrice.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: GroceryItem data model migration (breaking change to feature 001) and new domain entities that multiple stories share. MUST complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests

- [x] T004 [P] Write tests for GroceryItem migration in LocalStorageGroceryListRepository in frontend/tests/unit/infrastructure/LocalStorageGroceryListRepository.migration.test.ts
- [x] T005 [P] Write tests for updated CreateGroceryList use case (amount + UnitType) in frontend/tests/unit/application/CreateGroceryList.test.ts
- [x] T006 [P] Write tests for updated UpdateGroceryList use case (amount + UnitType) in frontend/tests/unit/application/UpdateGroceryList.test.ts
- [x] T007 [P] Write tests for formatPrice utility in frontend/tests/unit/presentation/formatPrice.test.ts

### Implementation

- [x] T008 Update GroceryItem interface: add `amount: number`, change `unit` to UnitType in frontend/src/domain/grocery-list/GroceryList.ts
- [x] T009 Update NewItemInput in frontend/src/application/grocery-list/use-cases/use-case-types.ts to include `amount: number` and constrain `unit` to UnitType
- [x] T010 Update GroceryListRepository port: add `amount` to create/update input types in frontend/src/application/grocery-list/ports/GroceryListRepository.port.ts
- [x] T011 Update LocalStorageGroceryListRepository: add migration logic (amount defaults to 1, unit mapped to UnitType) in frontend/src/infrastructure/grocery-list/LocalStorageGroceryListRepository.ts
- [x] T012 Update CreateGroceryList and UpdateGroceryList use cases to validate amount > 0 and unit ∈ UnitType in frontend/src/application/grocery-list/use-cases/
- [x] T013 [P] Create Market and MarketAddress interfaces in frontend/src/domain/purchase/Market.ts
- [x] T014 [P] Create Product interface in frontend/src/domain/purchase/Product.ts
- [x] T015 [P] Create ProductPriceRecord interface in frontend/src/domain/purchase/ProductPriceRecord.ts
- [x] T016 [P] Create Purchase and PurchaseItem interfaces in frontend/src/domain/purchase/Purchase.ts
- [x] T017 [P] Create MarketRepository port in frontend/src/application/purchase/ports/MarketRepository.port.ts
- [x] T018 [P] Create ProductRepository port in frontend/src/application/purchase/ports/ProductRepository.port.ts
- [x] T019 [P] Create PurchaseRepository port in frontend/src/application/purchase/ports/PurchaseRepository.port.ts
- [x] T020 [P] Create ProductPriceRecordRepository port in frontend/src/application/purchase/ports/ProductPriceRecordRepository.port.ts
- [x] T021 [P] Create purchase use-case-types.ts with all input/output types in frontend/src/application/purchase/use-cases/use-case-types.ts
- [x] T022 [P] Implement MockMarketRepository (in-memory Map storage) in frontend/src/infrastructure/purchase/MockMarketRepository.ts
- [x] T023 [P] Implement MockProductRepository (in-memory Map storage) in frontend/src/infrastructure/purchase/MockProductRepository.ts
- [x] T024 [P] Implement MockPurchaseRepository (in-memory Map storage) in frontend/src/infrastructure/purchase/MockPurchaseRepository.ts
- [x] T025 [P] Implement MockProductPriceRecordRepository (in-memory Map storage) in frontend/src/infrastructure/purchase/MockProductPriceRecordRepository.ts
- [x] T026 Register all new mock repositories in DI container in frontend/src/di/container.ts

### Presentation (feature 001 update)

- [x] T027 Write tests for updated ItemSubForm (amount input + unit select) in frontend/tests/unit/presentation/ItemSubForm.test.tsx
- [x] T028 Update ItemSubForm: replace unit text input with Headless UI Listbox for UnitType, add amount number input in frontend/src/presentation/components/ItemSubForm/
- [x] T029 Update GroceryListModal to pass amount in item data in frontend/src/presentation/components/GroceryListModal/GroceryListModal.tsx
- [x] T030 Update existing GroceryListModal create/edit tests for amount + UnitType in frontend/tests/unit/presentation/GroceryListModal.create.test.tsx and GroceryListModal.edit.test.tsx

**Checkpoint**: GroceryItem migration complete. Feature 001 still works. All new domain entities and ports defined. Mock repositories ready.

---

## Phase 3: User Story 1 — Enter Purchase Mode and Select a Market (Priority: P1) 🎯 MVP

**Goal**: User clicks Purchase on a grocery list card → market selection dialog opens → user searches/selects a market → full-screen Purchase Mode activates showing items by category.

**Independent Test**: Seed a grocery list + markets, click Purchase, verify market dialog opens, search filters markets, selecting a market opens PurchaseView with items grouped by category.

### Tests for User Story 1

- [x] T031 [P] [US1] Write tests for SearchMarkets use case in frontend/tests/unit/application/purchase/SearchMarkets.test.ts
- [x] T032 [P] [US1] Write tests for MarketSelectionDialog component in frontend/tests/unit/presentation/MarketSelectionDialog.test.tsx
- [x] T033 [P] [US1] Write tests for PurchaseView component (items grouped by category, assign product button, market name display-only with no edit action per FR-025d) in frontend/tests/unit/presentation/PurchaseView.test.tsx

### Implementation for User Story 1

- [x] T034 [US1] Implement SearchMarkets use case (Fuse.js fuzzy search, 300ms debounce config) in frontend/src/application/purchase/use-cases/SearchMarkets.usecase.ts
- [x] T035 [P] [US1] Create purchase store atoms (activePurchaseAtom, purchaseItemsAtom, purchaseTotalAtom, purchaseHasChangesAtom) in frontend/src/store/purchase.store.ts
- [x] T036 [P] [US1] Create market store atoms (marketsAtom, marketSearchQueryAtom) in frontend/src/store/market.store.ts
- [x] T037 [US1] Create MarketSelectionDialog component (Headless UI Dialog, search input with debounce, market list, empty state with "Create New Market" option) including MarketSelectionDialog.styles.ts in frontend/src/presentation/components/MarketSelectionDialog/
- [x] T038 [US1] Create PurchaseView component (full-screen Dialog fixed inset-0, header with market name, grocery items grouped by category, "Assign Product" button per item) including PurchaseView.styles.ts in frontend/src/presentation/components/PurchaseView/
- [x] T039 [US1] Create PurchaseSummaryBar component (running total display in $0.00 format, Save and Exit buttons) including PurchaseSummaryBar.styles.ts in frontend/src/presentation/components/PurchaseSummaryBar/
- [x] T040 [US1] Wire DashboardPage handlePurchase: open MarketSelectionDialog, on market select → open PurchaseView in frontend/src/presentation/pages/DashboardPage/DashboardPage.tsx

**Checkpoint**: User Story 1 functional — Purchase button opens market dialog, search works, selecting a market opens full-screen purchase view with items by category.

---

## Phase 4: User Story 2 — Assign Products to Grocery List Items (Priority: P2)

**Goal**: In Purchase Mode, user clicks "Assign Product" on an item → product search dialog (name fuzzy / barcode exact) → selects product → quantity prefilled, enters price → historical price shown → confirms → purchase list updates with product info and running total.

**Independent Test**: Activate Purchase Mode with seeded list + market + products with price history, assign a product, verify prefill, price entry, historical price display, total calculation.

### Tests for User Story 2

- [x] T041 [P] [US2] Write tests for SearchProducts use case (name fuzzy + barcode exact strategies) in frontend/tests/unit/application/purchase/SearchProducts.test.ts
- [x] T042 [P] [US2] Write tests for GetLastProductPrice use case in frontend/tests/unit/application/purchase/GetLastProductPrice.test.ts
- [x] T043 [P] [US2] Write tests for ProductAssignmentDialog component in frontend/tests/unit/presentation/ProductAssignmentDialog.test.tsx
- [x] T073 [P] [US2] Write tests for AssignProduct use case (validates quantity > 0, unitPrice > 0, creates PurchaseItem) in frontend/tests/unit/application/purchase/AssignProduct.test.ts

### Implementation for User Story 2

- [x] T044 [US2] Implement SearchProducts use case (Fuse.js for name, findByBarcode for barcode) in frontend/src/application/purchase/use-cases/SearchProducts.usecase.ts
- [x] T045 [US2] Implement GetLastProductPrice use case in frontend/src/application/purchase/use-cases/GetLastProductPrice.usecase.ts
- [x] T074 [US2] Implement AssignProduct use case (validate inputs, create PurchaseItem, delegate to port) in frontend/src/application/purchase/use-cases/AssignProduct.usecase.ts
- [x] T046 [P] [US2] Create product store atoms (productsAtom, productSearchQueryAtom) in frontend/src/store/product.store.ts
- [x] T047 [US2] Create ProductAssignmentDialog component (Headless UI Dialog over PurchaseView, product search by name/barcode toggle, product results list, quantity/unit/price form with prefill from GroceryItem, historical price display with question-mark icon disclaimer toggle, validation for quantity > 0 and price > 0, confirm button) including ProductAssignmentDialog.styles.ts in frontend/src/presentation/components/ProductAssignmentDialog/
- [x] T048 [US2] Integrate ProductAssignmentDialog with PurchaseView: clicking "Assign Product" opens dialog, on confirm → call AssignProduct use case → update purchaseItemsAtom, recalculate total in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T049 [US2] Update PurchaseView to display assigned items (product name, quantity, unit, unit price in $0.00, line total) and "Modify" action in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx

**Checkpoint**: User Story 2 functional — products searchable by name/barcode, assignment form works with prefill + historical price, purchase list shows assigned items with running total.

---

## Phase 5: User Story 5 — Complete or Cancel a Purchase (Priority: P2)

**Goal**: User saves a purchase (stores all assignments + creates price records) or exits Purchase Mode with unsaved-changes confirmation. beforeunload protection.

**Independent Test**: Complete a purchase (assign ≥ 1 product), save → verify persistence + exit to dashboard. Also: attempt exit with unsaved changes → confirm dialog appears. Exit with no assignments → no dialog.

### Tests for User Story 5

- [x] T050 [P] [US5] Write tests for SavePurchase use case (validates ≥ 1 item, creates purchase + price records) in frontend/tests/unit/application/purchase/SavePurchase.test.ts
- [x] T051 [P] [US5] Write tests for exit confirmation behavior in PurchaseView (dialog shown when hasChanges, no dialog when empty) in frontend/tests/unit/presentation/PurchaseView.exit.test.tsx

### Implementation for User Story 5

- [x] T052 [US5] Implement SavePurchase use case (validate ≥ 1 item, auto-set date to today via date-fns, call PurchaseRepository.create + ProductPriceRecordRepository.createBatch) in frontend/src/application/purchase/use-cases/SavePurchase.usecase.ts
- [x] T053 [US5] Add Save Purchase button in PurchaseSummaryBar: calls SavePurchase use case, blocks if no items, shows snackbar on failure (FR-036), exits Purchase Mode on success in frontend/src/presentation/components/PurchaseSummaryBar/PurchaseSummaryBar.tsx
- [x] T054 [US5] Add exit confirmation dialog in PurchaseView: Headless UI Dialog, shown when purchaseHasChangesAtom is true, confirm discards + exits, cancel stays, no dialog when no assignments in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T055 [US5] Add beforeunload event listener in PurchaseView for browser back/close while Purchase Mode active with unsaved changes in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx

**Checkpoint**: User Story 5 functional — purchase saves correctly, exit confirmation works, beforeunload protects unsaved data.

---

## Phase 6: User Story 3 — Create a New Market (Priority: P3)

**Goal**: From market selection dialog, user creates a new market with name + structured address. Name suggestions (fuzzy) shown during typing. Address duplicate detection auto-loads matching market.

**Independent Test**: Open market creation form, type name → see suggestions, fill address → duplicate detection, create market → appears in search results.

### Tests for User Story 3

- [x] T056 [P] [US3] Write tests for CreateMarket use case (validation, name fuzzy suggestions, address duplicate detection) in frontend/tests/unit/application/purchase/CreateMarket.test.ts
- [x] T057 [P] [US3] Write tests for MarketCreationForm component in frontend/tests/unit/presentation/MarketCreationForm.test.tsx

### Implementation for User Story 3

- [x] T058 [US3] Implement CreateMarket use case (validate all fields non-empty, call MarketRepository.findByAddress for duplicate detection, return CreateMarketResult discriminated union) in frontend/src/application/purchase/use-cases/CreateMarket.usecase.ts
- [x] T059 [US3] Create MarketCreationForm component (name field with Fuse.js suggestions via SearchMarkets use case, structured address fields: street/city/state/zip, address duplicate detection on blur, suggestion selection cancels creation, validation errors, submit creates market) including MarketCreationForm.styles.ts in frontend/src/presentation/components/MarketCreationForm/
- [x] T060 [US3] Integrate MarketCreationForm into MarketSelectionDialog: "Create New Market" button opens form, created/matched market returned to selection flow in frontend/src/presentation/components/MarketSelectionDialog/MarketSelectionDialog.tsx

**Checkpoint**: User Story 3 functional — markets created with duplicate prevention, immediately available in search.

---

## Phase 7: User Story 4 — Product Lookup and Creation (Priority: P3)

**Goal**: From product assignment dialog, user creates a new product via two-step flow: name (with fuzzy suggestions) → barcode (with exact duplicate check). Products shared across users.

**Independent Test**: Open product creation, enter name → see suggestions, enter barcode → duplicate check, create product → available in lookups.

### Tests for User Story 4

- [x] T061 [P] [US4] Write tests for CreateProduct use case (two-step: name suggestions, barcode duplicate check, validation) in frontend/tests/unit/application/purchase/CreateProduct.test.ts
- [x] T062 [P] [US4] Write tests for ProductCreationForm component in frontend/tests/unit/presentation/ProductCreationForm.test.tsx

### Implementation for User Story 4

- [x] T063 [US4] Implement CreateProduct use case (validate name + barcode non-empty, call ProductRepository.findByBarcode, return CreateProductResult discriminated union) in frontend/src/application/purchase/use-cases/CreateProduct.usecase.ts
- [x] T064 [US4] Create ProductCreationForm component (step 1: name input with Fuse.js suggestions via SearchProducts, step 2: barcode input with exact duplicate check, suggestion selection cancels creation, validation errors, submit creates product) including ProductCreationForm.styles.ts in frontend/src/presentation/components/ProductCreationForm/
- [x] T065 [US4] Integrate ProductCreationForm into ProductAssignmentDialog: "Create New Product" button opens form, created/matched product returned to assignment flow in frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx

**Checkpoint**: User Story 4 functional — products created with two-step duplicate prevention, immediately available in search.

---

## Phase 8: User Story 6 — Edit Product Assignment in a Purchase (Priority: P3)

**Goal**: In Purchase Mode, user modifies an existing product assignment — opens product lookup pre-filled with current assignment, selects different product, updates quantity/price. Totals update immediately.

**Independent Test**: Assign a product, click Modify, change to different product with new price, verify assignment and total update correctly.

### Tests for User Story 6

- [x] T066 [P] [US6] Write tests for UpdateProductAssignment behavior in PurchaseView in frontend/tests/unit/presentation/PurchaseView.editAssignment.test.tsx
- [x] T075 [P] [US6] Write tests for UpdateProductAssignment use case (validates inputs, updates existing PurchaseItem) in frontend/tests/unit/application/purchase/UpdateProductAssignment.test.ts

### Implementation for User Story 6

- [x] T076 [US6] Implement UpdateProductAssignment use case (validate inputs, update PurchaseItem via port) in frontend/src/application/purchase/use-cases/UpdateProductAssignment.usecase.ts
- [x] T067 [US6] Update ProductAssignmentDialog to accept optional existing assignment for pre-fill (edit mode) in frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx
- [x] T068 [US6] Wire "Modify" button in PurchaseView to open ProductAssignmentDialog in edit mode, on confirm → call UpdateProductAssignment use case → update purchaseItemsAtom and recalculate total in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx

**Checkpoint**: User Story 6 functional — product assignments editable, totals update in real time.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, integration validation, and cleanup across all stories.

- [x] T069 Verify WCAG 2.1 AA compliance across all new dialogs (focus trapping, ARIA labels, keyboard navigation) in all new components under frontend/src/presentation/components/
- [x] T070 Write integration test for full purchase flow (dashboard → market selection → purchase view → assign product → save) in frontend/tests/unit/presentation/PurchaseFlow.integration.test.tsx
- [x] T071 Run full test suite and fix any regressions in existing feature 001 tests caused by GroceryItem migration
- [x] T072 Run quickstart.md validation: verify all listed files exist and application builds successfully

---

## Phase 10: Manual Testing Corrections

**Purpose**: Fix 4 UX issues identified during manual testing of the completed feature.

### Correction 1: Product Creation in Separate Modal (FR-025c)

- [x] T077 Wrap ProductCreationForm in its own Headless UI Dialog (z-[70]) inside ProductAssignmentDialog so it renders as a separate modal instead of inline in frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx

### Correction 2: Display Unit Type in Assignment Form (FR-016)

- [x] T078 Add read-only unit type label next to the quantity field in ProductAssignmentDialog assignment form, prefilled from the grocery list item's unit, in frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx

### Correction 3: Redesign Assigned Item Display (FR-028)

- [x] T079 Extend ProductAssignmentDialog onConfirm callback to include productName in the returned data in frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx
- [x] T080 Add productName tracking (productNameMap state) in PurchaseView and pass productName from assignment confirmations in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T081 Redesign assigned item row in PurchaseView: show product name, "X units out of Y units" comparative format, unit price, total — no math symbols. Update PurchaseView.styles.ts as needed in frontend/src/presentation/components/PurchaseView/

### Correction 4: Mismatch Detection and Save Confirmation (FR-039–FR-041)

- [x] T082 Add mismatch detection logic in PurchaseView: identify unassigned items and quantity differences between grocery list and purchase in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T083 Create MismatchWarningDialog inline in PurchaseView: lists missing assignments and quantity discrepancies, "Go Back" and "Save Anyway" actions in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T084 Create SaveConfirmationDialog inline in PurchaseView: warns purchase cannot be edited after saving, "Cancel" and "Save" actions in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T085 Wire save flow in PurchaseView: on Save click → run mismatch detection → show MismatchWarningDialog or SaveConfirmationDialog → delegate to onSave prop in frontend/src/presentation/components/PurchaseView/PurchaseView.tsx
- [x] T086 Update existing tests
- [x] T087 Improve assigned item card layout: multi-row structure with item name + action on top, product name on second row, quantity/price info on third row with proper spacing in frontend/src/presentation/components/PurchaseView/ to account for new productName in onConfirm callback and new save confirmation flow in frontend/tests/unit/presentation/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — entry point for all purchase flows
- **US2 (Phase 4)**: Depends on Phase 3 (PurchaseView must exist)
- **US5 (Phase 5)**: Depends on Phase 4 (needs assigned items to save)
- **US3 (Phase 6)**: Depends on Phase 3 (integrates into MarketSelectionDialog)
- **US4 (Phase 7)**: Depends on Phase 4 (integrates into ProductAssignmentDialog)
- **US6 (Phase 8)**: Depends on Phase 4 (needs existing assignments to edit)
- **Polish (Phase 9)**: Depends on all desired user stories complete

### User Story Dependencies

```text
Phase 1 (Setup)
  └─► Phase 2 (Foundational) ── BLOCKS ALL ──┐
                                               ├─► US1 (P1: Purchase Mode + Market Selection)
                                               │     ├─► US2 (P2: Product Assignment)
                                               │     │     ├─► US5 (P2: Save/Cancel Purchase)
                                               │     │     ├─► US4 (P3: Product Creation)
                                               │     │     └─► US6 (P3: Edit Assignment)
                                               │     └─► US3 (P3: Market Creation)
                                               └─► Phase 9 (Polish)
```

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (Constitution II)
2. Use cases before presentation components
3. Store atoms before components that consume them
4. Core component before integrations with parent components

### Parallel Opportunities

**Phase 2** (after T008–T012 serial migration):

- T013–T016 (domain entities) — all [P], different files
- T017–T020 (ports) — all [P], different files
- T022–T025 (mock repos) — all [P], different files

**Phase 3** (US1):

- T031–T033 (tests) — all [P], different files
- T035–T036 (store atoms) — all [P], different files

**Phase 4** (US2):

- T041–T043 (tests) — all [P], different files

**Phases 6+7** (US3 + US4):

- Can run in parallel since they integrate into different parent components (MarketSelectionDialog vs ProductAssignmentDialog)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (GroceryItem migration + domain/ports/mocks)
3. Complete Phase 3: User Story 1 (Purchase Mode + Market Selection)
4. **STOP and VALIDATE**: Test US1 independently — Purchase button → market dialog → purchase view

### Incremental Delivery

1. Setup + Foundational → Foundation ready (feature 001 still works)
2. Add US1 → Test → MVP demo (purchase mode entry!)
3. Add US2 → Test → Product assignment works
4. Add US5 → Test → Full purchase flow end-to-end
5. Add US3, US4, US6 → Test → Complete feature with creation + editing
6. Polish → Accessibility + integration validation

### Suggested MVP Scope

**US1 alone** is the minimal demonstrable increment — shows Purchase Mode activating with market selection and items displayed by category.

---

## Notes

- All monetary values use Argentine Peso format: `$0.00` (formatPrice utility)
- Fuse.js threshold: 0.4, keys: `['name']`, debounce: 300ms
- Address duplicate detection: normalized zip + city + street comparison
- Product creation: two-step sequential (name suggestions → barcode duplicate check)
- Constitution II (TDD): Write test → confirm fail → implement → confirm pass → refactor
- All dialogs: Headless UI `Dialog` with Tailwind dark-first styling
- PurchaseView: `fixed inset-0 z-40`; dialogs on top: `z-50`
- All mock repositories use `uuid` v4 (`uuidv4()`) for ID generation — `crypto.randomUUID()` unavailable on some mobile contexts (see BF003 in feature 001 specs)
