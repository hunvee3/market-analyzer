# Implementation Plan: Purchase Mode

**Branch**: `002-purchase-mode` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-purchase-mode/spec.md`
**Depends on**: `001-grocery-list-manager`

## Summary

Purchase Mode allows users to register real purchases based on existing grocery lists. The user enters Purchase Mode from a grocery list card, selects a market (or creates one), then assigns real products (with quantity and unit price) to grocery list items. The system tracks historical prices and calculates running totals. This is the first feature requiring a backend (shared Markets, Products, ProductPriceRecords) — the frontend will use API mocks until the backend is built, per constitution mandate.

## Technical Context

**Language/Version**: TypeScript ~5.7 (frontend and backend)
**Primary Dependencies**: React 18, Tailwind CSS v3, Headless UI, Jotai, date-fns, uuid (frontend); Fastify, Lucid ORM (backend — new, not yet created)
**Storage**: localStorage (feature 001 — existing); PostgreSQL (constitution-mandated for backend — new)
**Testing**: Vitest + React Testing Library (frontend); Jest + Supertest (backend)
**Target Platform**: PWA — all modern browsers, all viewport sizes
**Project Type**: Web application (frontend PWA + backend API)
**Constraints**: WCAG 2.1 AA, dark-first design, Argentine Peso currency ($0.00 format), offline-capable (PWA)
**Scale/Scope**: Multi-user shared resources (Markets, Products); single-user purchases; ~6 new UI views/dialogs; 5 new domain entities; data model change to existing GroceryItem

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #   | Principle                      | Status     | Notes                                                                                                                                                                                                                                                                          |
| --- | ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I   | Hexagonal Architecture         | ✅ PASS    | New entities follow domain/application/infrastructure split. New ports for Market, Product, Purchase, ProductPriceRecord repositories. Domain layer has zero framework dependencies. Application layer uses ports only. Infrastructure provides mock adapters.                 |
| II  | Test-First Development         | ✅ PASS    | TDD cycle enforced. All use-cases and components will have tests. Mocks for all external dependencies. AAA pattern with Given/When/Then descriptions.                                                                                                                          |
| III | Error Handling & Observability | ✅ PASS    | Validation errors use existing `ValidationError` class pattern. Save failures show snackbar notifications (FR-036). Field-level validation for quantity, price, market, and product creation forms.                                                                            |
| IV  | Frontend Tech Stack            | ✅ PASS    | Tailwind CSS + Headless UI for dialogs/comboboxes, Jotai for purchase state atoms, date-fns for date formatting, clsx + tailwind-merge for class composition. Dark-first design. Heroicons for icons. Fuse.js added for fuzzy search (new dependency — lightweight, zero-dep). |
| V   | Backend Tech Stack             | ⚠ DEFERRED | No backend exists yet. Constitution mandates Fastify + PostgreSQL + Lucid ORM. Frontend will use mock-first approach per constitution IV ("Mock-first" rule). Backend scaffolding is out of scope for this feature's frontend implementation.                                  |
| —   | Branching Strategy             | ✅ PASS    | Feature branch from develop.                                                                                                                                                                                                                                                   |

**Gate result**: PASS — No violations. Backend deferral is explicitly supported by the Mock-first rule in the constitution.

### Post-Design Re-evaluation

All Phase 1 artifacts verified against constitution:

- **Hexagonal**: data-model.md defines pure domain entities; contracts/ define port interfaces; mock repositories go in infrastructure. No cross-layer violations.
- **TDD**: All use cases (SearchMarkets, CreateMarket, SearchProducts, CreateProduct, SavePurchase, etc.) testable via mocked ports. Components testable via React Testing Library.
- **Error handling**: `ValidationError` reused from feature 001. `CreateMarketResult` and `CreateProductResult` use discriminated unions for duplicate detection flows (no silent failures).
- **Frontend stack**: Fuse.js is the only new dependency. All dialogs use Headless UI (`Dialog`, `Combobox`). Styling uses Tailwind class constants. State managed via Jotai atoms.
- **Accessibility**: All interactive components use Headless UI primitives (Dialog, Combobox) which provide focus trapping, ARIA roles, and keyboard navigation out of the box.

## Project Structure

### Documentation (this feature)

```text
specs/002-purchase-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/src/
├── domain/
│   ├── shared/                     # NEW
│   │   └── UnitType.ts             # UnitType union + UNIT_OPTIONS array
│   ├── grocery-list/
│   │   ├── GroceryList.ts          # MODIFIED — GroceryItem gains amount: number, unit becomes select enum
│   │   └── Category.ts
│   └── purchase/                   # NEW
│       ├── Purchase.ts             # Purchase, PurchaseItem entities
│       ├── Market.ts               # Market entity
│       ├── Product.ts              # Product entity
│       └── ProductPriceRecord.ts   # ProductPriceRecord entity
├── application/
│   ├── grocery-list/               # Existing — ports/use-cases may need minor updates for unit enum
│   └── purchase/                   # NEW
│       ├── ports/
│       │   ├── MarketRepository.port.ts
│       │   ├── ProductRepository.port.ts
│       │   ├── PurchaseRepository.port.ts
│       │   └── ProductPriceRecordRepository.port.ts
│       └── use-cases/
│           ├── use-case-types.ts
│           ├── AssignProduct.usecase.ts
│           ├── UpdateProductAssignment.usecase.ts
│           ├── SearchMarkets.usecase.ts
│           ├── CreateMarket.usecase.ts
│           ├── SearchProducts.usecase.ts
│           ├── CreateProduct.usecase.ts
│           ├── GetLastProductPrice.usecase.ts
│           └── SavePurchase.usecase.ts
├── infrastructure/
│   └── purchase/                   # NEW — mock implementations
│       ├── MockMarketRepository.ts
│       ├── MockProductRepository.ts
│       ├── MockPurchaseRepository.ts
│       └── MockProductPriceRecordRepository.ts
├── presentation/
│   ├── utils/
│   │   └── formatPrice.ts          # NEW — Argentine Peso formatting ($0.00)
│   ├── components/
│   │   ├── MarketSelectionDialog/  # NEW — market search + create
│   │   ├── PurchaseView/           # NEW — full-screen purchase mode
│   │   ├── ProductAssignmentDialog/# NEW — product lookup + assignment form
│   │   ├── ProductCreationForm/    # NEW — two-step product creation
│   │   ├── MarketCreationForm/     # NEW — market creation with duplicate detection
│   │   └── PurchaseSummaryBar/     # NEW — running total display
│   └── pages/
│       └── DashboardPage/          # MODIFIED — handlePurchase wired up
├── store/
│   ├── purchase.store.ts           # NEW — purchase state atoms
│   ├── market.store.ts             # NEW — market state atoms
│   └── product.store.ts            # NEW — product state atoms
└── di/
    └── container.ts                # MODIFIED — register new repositories
```

**Structure Decision**: Extends the existing frontend hexagonal architecture. New `purchase` domain/application/infrastructure modules follow the same pattern as `grocery-list`. Mock repositories implement ports until backend exists.

## Phase 10: Manual Testing Corrections

**Purpose**: Address 4 UX issues identified during manual testing of the completed implementation.

### Correction 1: Product Creation in Separate Modal (FR-025c)

- ProductCreationForm currently renders inline inside ProductAssignmentDialog
- **Fix**: Wrap ProductCreationForm in its own Headless UI Dialog (z-[70]) when triggered from the assignment dialog
- **Files**: `ProductAssignmentDialog.tsx`

### Correction 2: Display Unit Type in Assignment Form (FR-016)

- Assignment form shows Quantity and Unit Price but does not display the unit type from the grocery list item
- **Fix**: Add a read-only unit type label next to the quantity input field
- **Files**: `ProductAssignmentDialog.tsx`

### Correction 3: Redesign Assigned Item Display (FR-028)

- Current display uses math symbols (× and =) and doesn't show product name
- **Fix**: Show product name, comparative format ("X units out of Y units"), unit price, total — no math symbols
- **Files**: `PurchaseView.tsx`, `PurchaseView.styles.ts`, `ProductAssignmentDialog.tsx` (return productName in onConfirm)
- **Iteration 2**: Multi-row card layout — item name + action button on top row, product name on second row, quantity + price info on third row with proper spacing and visual separation

### Correction 4: Mismatch Detection and Save Confirmation (FR-039–FR-041)

- Save currently has no pre-save validation or confirmation
- **Fix**: Before save, detect unassigned items and quantity mismatches. Show MismatchWarningDialog or SaveConfirmationDialog
- **Files**: `PurchaseView.tsx`, `PurchaseView.styles.ts` (new dialog styles), `DashboardPage.tsx` (save flow update)

## Complexity Tracking

No constitution violations to justify.

## Cross-Feature Bugfix: UUID Generation (BF003)

All mock repositories and LocalStorage adapters use `uuid` library v4 (`uuidv4()`)
instead of `crypto.randomUUID()` for ID generation. `crypto.randomUUID()` is
unavailable in some mobile browser contexts. The `uuid` dependency is a temporary
polyfill — when the backend is built, ID generation will move server-side and the
library can be removed. See `specs/001-grocery-list-manager/plan.md` BF003 for details.
