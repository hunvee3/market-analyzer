# Quickstart: Purchase Mode

**Branch**: `002-purchase-mode` | **Date**: 2026-04-02

## Prerequisites

- Feature `001-grocery-list-manager` fully implemented and functional
- Node.js 18+ installed
- `frontend/` dependencies installed (`npm install`)

## New Dependency

```bash
cd frontend
npm install fuse.js
```

**Fuse.js** is used for client-side fuzzy search on product names and market names (see [research.md](research.md) R1).

## Key Files to Create

### Domain Layer (`frontend/src/domain/`)

| File                             | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| `shared/UnitType.ts`             | `UnitType` union type and `UNIT_OPTIONS` array |
| `purchase/Market.ts`             | `Market`, `MarketAddress` interfaces           |
| `purchase/Product.ts`            | `Product` interface                            |
| `purchase/ProductPriceRecord.ts` | `ProductPriceRecord` interface                 |
| `purchase/Purchase.ts`           | `Purchase`, `PurchaseItem` interfaces          |

### Application Layer (`frontend/src/application/purchase/`)

| File                                           | Purpose                                            |
| ---------------------------------------------- | -------------------------------------------------- |
| `ports/MarketRepository.port.ts`               | Market persistence port                            |
| `ports/ProductRepository.port.ts`              | Product persistence port                           |
| `ports/PurchaseRepository.port.ts`             | Purchase persistence port                          |
| `ports/ProductPriceRecordRepository.port.ts`   | Price history port                                 |
| `use-cases/use-case-types.ts`                  | Input/output types for all use cases               |
| `use-cases/SearchMarkets.usecase.ts`           | Fuzzy search markets by name                       |
| `use-cases/CreateMarket.usecase.ts`            | Create market with address duplicate detection     |
| `use-cases/SearchProducts.usecase.ts`          | Search products by name (fuzzy) or barcode (exact) |
| `use-cases/CreateProduct.usecase.ts`           | Two-step product creation with duplicate checks    |
| `use-cases/GetLastProductPrice.usecase.ts`     | Get last price record for a product                |
| `use-cases/SavePurchase.usecase.ts`            | Save purchase + create price records               |
| `use-cases/AssignProduct.usecase.ts`           | Assign product to grocery item in purchase         |
| `use-cases/UpdateProductAssignment.usecase.ts` | Update existing product assignment                 |

### Infrastructure Layer (`frontend/src/infrastructure/purchase/`)

| File                                  | Purpose                        |
| ------------------------------------- | ------------------------------ |
| `MockMarketRepository.ts`             | In-memory market storage       |
| `MockProductRepository.ts`            | In-memory product storage      |
| `MockPurchaseRepository.ts`           | In-memory purchase storage     |
| `MockProductPriceRecordRepository.ts` | In-memory price record storage |

### Presentation Layer (`frontend/src/presentation/`)

| File                                  | Purpose                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| `utils/formatPrice.ts`                | Argentine Peso formatting utility ($0.00)                   |
| `components/MarketSelectionDialog/`   | Modal: market search + select/create                        |
| `components/MarketCreationForm/`      | Market form with name suggestions + address duplicate check |
| `components/PurchaseView/`            | Full-screen purchase mode (fixed inset-0)                   |
| `components/ProductAssignmentDialog/` | Dialog: product search + assignment form                    |
| `components/ProductCreationForm/`     | Two-step: name → barcode with duplicate checks              |
| `components/PurchaseSummaryBar/`      | Running total display                                       |

### State (`frontend/src/store/`)

| File                | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `purchase.store.ts` | Purchase session atoms (active purchase, items, totals) |
| `market.store.ts`   | Market list atoms                                       |
| `product.store.ts`  | Product list atoms                                      |

### DI Container (`frontend/src/di/container.ts`)

Register new mock repositories alongside existing grocery-list repositories.

## Key Modifications to Existing Files

| File                                                               | Change                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `domain/grocery-list/GroceryList.ts`                               | Add `amount: number` to `GroceryItem`, constrain `unit` to `UnitType` |
| `presentation/components/ItemSubForm/`                             | Replace unit text input with select; add amount number input          |
| `presentation/components/GroceryListCard/`                         | Wire `onPurchase` to open MarketSelectionDialog                       |
| `presentation/pages/DashboardPage/`                                | Implement `handlePurchase` to enter Purchase Mode                     |
| `infrastructure/grocery-list/LocalStorageGroceryListRepository.ts` | Migrate stored data (add `amount: 1`, map `unit` to `UnitType`)       |
| `di/container.ts`                                                  | Export new repository instances                                       |

## Development Workflow

1. **GroceryItem migration** — Update domain model, port, use-case types, infrastructure, and ItemSubForm first (breaking change to feature 001)
2. **Domain entities** — Define Market, Product, Purchase, PurchaseItem, ProductPriceRecord, UnitType
3. **Ports + Use cases** — Define repository ports, then implement use cases with TDD
4. **Mock repositories** — Implement in-memory storage for all ports
5. **State atoms** — Define Jotai atoms for purchase session state
6. **UI components** — Build bottom-up: MarketSelectionDialog → PurchaseView → ProductAssignmentDialog → PurchaseSummaryBar
7. **Integration** — Wire DashboardPage → MarketSelectionDialog → PurchaseView flow

## Running Tests

```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Useful commands

```bash
npm run dev           # Start dev server
npm run lint          # Lint check
npm run build         # Production build
```
