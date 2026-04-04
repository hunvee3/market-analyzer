---
description: 'Task list for Grocery List Manager'
---

# Tasks: Grocery List Manager

**Input**: Design documents from `/specs/001-grocery-list-manager/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

> **Constitution note**: State management uses **Jotai** throughout (Zustand is prohibited
> per constitution v1.1.0). All store files define Jotai atoms. Do not install Zustand.

> **Styling note**: UI uses **Tailwind CSS v3** + **Headless UI** (Dialog, Combobox, Disclosure).
> MUI, styled-components, and Emotion are prohibited per constitution v1.3.0.
> Design is **dark-first**: `bg-gray-950`/`bg-gray-900` surfaces, `bg-gray-800` cards,
> `indigo-500`/`violet-500` accents, `text-gray-100` body. Use `rounded-xl`, `shadow-lg`,
> `transition-colors duration-200` throughout. Externalise class strings to `.styles.ts` when
> a component has multiple logical groups.

> **Validated patterns** (confirmed during implementation — follow these):
>
> - `GroceryListModal` is always `fullScreen`. No breakpoint switching.
> - `ItemSubForm` renders inside a `<Dialog maxWidth="sm">` — NOT inline in the list modal.
> - `categoriesAtom` is the only source of truth for categories inside `GroceryListModal`. No local copy.
> - `onConfirm` signature is `(item: NewItemInput, categoryName: string)` — pass name directly to avoid stale atom reads in the parent.
> - Category field Confirm-enabling: enabled on any non-empty text, resolved on submit.
> - `tests/setup.ts` MUST include `window.HTMLElement.prototype.scrollIntoView = () => {}` for jsdom compatibility.

> **TDD**: Mandatory per constitution (NON-NEGOTIABLE). Test tasks are included in each
> user story phase. Write the test, confirm it fails, then implement, then confirm it passes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Exact file paths included in every task

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the Vite PWA project with all dependencies and tooling.

- [x] T Initialize Vite + React + TypeScript project in `frontend/` with dependencies: react@18, tailwindcss@3, @headlessui/react, @heroicons/react, clsx, tailwind-merge, date-fns@3, jotai, vite-plugin-pwa — run `npm create vite@latest frontend -- --template react-ts` then install all listed packages; initialize Tailwind (`npx tailwindcss init -p`) and configure `content` paths and `darkMode: 'class'` in `tailwind.config.js`; add `@tailwind base/components/utilities` directives to `frontend/src/index.css`
- [x] T [P] Configure TypeScript strict mode and path aliases (`@domain`, `@application`, `@infrastructure`, `@presentation`, `@store`, `@di`) in `frontend/tsconfig.json` and `frontend/tsconfig.app.json`
- [x] T [P] Configure Vitest with jsdom environment and React Testing Library setup in `frontend/vite.config.ts` — install `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` as devDependencies; add `setupFiles` pointing to `frontend/tests/setup.ts`
- [x] T [P] Create Vitest setup file at `frontend/tests/setup.ts` that imports `@testing-library/jest-dom/vitest`
- [x] T [P] Configure ESLint with `eslint-plugin-react` and `eslint-plugin-react-hooks` rules in `frontend/.eslintrc.cjs`; add `npm run lint` script to `frontend/package.json`
- [x] T Configure `vite-plugin-pwa` in `frontend/vite.config.ts` with service worker, `frontend/public/manifest.json` (name: "Smart Basket", short_name: "Smart Basket", theme_color: `#030712` — Tailwind `gray-950`), and placeholder icons in `frontend/public/icons/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain entities, port interfaces, infrastructure adapters, DI container, and
shared presentation infrastructure — MUST be complete before any user story begins.

**⚠ CRITICAL**: No user story work can begin until this phase is complete.

### Domain Entities

- [x] T [P] Define `GroceryList` entity and `GroceryItem` entity types in `frontend/src/domain/grocery-list/GroceryList.ts` — export `GroceryList` interface (`id`, `name`, `createdAt`, `updatedAt`, `items: GroceryItem[]`) and `GroceryItem` interface (`id`, `name`, `unit`, `categoryId`, `position`)
- [x] T [P] Define `Category` entity type in `frontend/src/domain/grocery-list/Category.ts` — export `Category` interface (`id`, `name`, `normalizedName`, `createdAt`)

### Application Layer — Port Interfaces

- [x] T Define `GroceryListRepository` port interface in `frontend/src/application/grocery-list/ports/GroceryListRepository.port.ts` — methods: `getAll(): Promise<GroceryList[]>`, `getById(id): Promise<GroceryList | null>`, `create(...)`, `update(id, ...)`, `delete(id)` (exact signatures from data-model.md)
- [x] T [P] Define `CategoryRepository` port interface in `frontend/src/application/grocery-list/ports/CategoryRepository.port.ts` — methods: `getAll()`, `findByNormalizedName(normalizedName)`, `create(name)`
- [x] T [P] Define shared use-case input/output types and error classes in `frontend/src/application/grocery-list/use-cases/use-case-types.ts` — copy from `specs/001-grocery-list-manager/contracts/use-case-types.ts` (`NewItemInput`, `CreateGroceryListInput`, `UpdateGroceryListInput`, `DeleteGroceryListInput`, `CreateOrReuseCategoryInput`, `ValidationError`, `NotFoundError`)

### Infrastructure Layer — LocalStorage Adapters

- [x] T Implement `LocalStorageGroceryListRepository` in `frontend/src/infrastructure/grocery-list/LocalStorageGroceryListRepository.ts` — reads/writes `smart-basket:v1:grocery-lists` as `GroceryList[]`; on parse error logs via `console.error` and returns `[]`; `create` generates UUID v4 with `crypto.randomUUID()` and sets `createdAt`/`updatedAt`; `update` sets new `updatedAt`
- [x] T [P] Implement `LocalStorageCategoryRepository` in `frontend/src/infrastructure/grocery-list/LocalStorageCategoryRepository.ts` — reads/writes `smart-basket:v1:categories`; `create(name)` sets `normalizedName = name.trim().toLowerCase()`; on parse error returns `[]`

### Dependency Injection

- [x] T Wire DI composition root in `frontend/src/di/container.ts` — instantiate `LocalStorageGroceryListRepository` and `LocalStorageCategoryRepository`, export typed singleton instances for use by all use cases; export `groceryListRepository` and `categoryRepository`

### Shared Presentation Infrastructure

- [x] T Create Tailwind dark-mode provider in `frontend/src/presentation/theme/AppThemeProvider.tsx` — maintains `isDark: boolean` state (default `true`), toggles the `dark` class on `<html>` via `document.documentElement.classList`, exports `ColorModeContext` with `{ isDark, toggleColorMode }`; add Inter font import to `frontend/index.html`; apply base dark background to `<body>` via `index.css` (`bg-gray-950 text-gray-100`)
- [x] T [P] Create `SnackbarContext` for global non-validation error notifications in `frontend/src/presentation/context/SnackbarContext.tsx` — export `SnackbarProvider` and `useSnackbar` hook with `showError(message: string)` method; implement snackbar UI as a fixed bottom-right toast using Tailwind classes (`bg-gray-800 text-red-400 rounded-xl shadow-lg transition-all`)
- [x] T Create Jotai atom definitions for grocery list state in `frontend/src/store/groceryList.store.ts` — define atoms: `groceryListsAtom` (`GroceryList[]`), `searchQueryAtom` (`string`), `filteredListsAtom` (derived: filters by search query case-insensitively), `isLoadingAtom`, `activeListAtom` (currently open in modal)
- [x] T [P] Create Jotai atom definitions for category state in `frontend/src/store/category.store.ts` — define atoms: `categoriesAtom` (`Category[]`), `isCategoryLoadingAtom`
- [x] T Bootstrap application entry point — `frontend/src/main.tsx` wraps `<App />` with `AppThemeProvider` and `SnackbarProvider`; create minimal `frontend/src/App.tsx` rendering `DashboardPage`; ensure `frontend/index.html` includes correct root element and Inter font import

**Checkpoint**: Foundation ready — domain, ports, adapters, DI, and shared providers complete. User story work can begin.

---

## Phase 3: User Story 1 — Browse and Manage Grocery Lists (Priority: P1) 🎯 MVP

**Goal**: Functional dashboard showing all lists sorted by creation date, real-time search filter,
delete with confirmation, and Purchase (log only). Empty state when no lists exist.

**Independent Test**: Seed localStorage with pre-existing lists; verify display order, search
filtering, and delete confirmation all work without creating or editing any list.

### Tests for User Story 1 (TDD — write first, confirm failing, then implement)

- [x] T [P] [US1] Write unit test for `GetAllGroceryLists` use case in `frontend/tests/unit/application/GetAllGroceryLists.test.ts` — Given the repository returns lists in random order, When the use case executes, Then returns them sorted by `updatedAt` descending; mock `GroceryListRepository` with `vi.fn()`
- [x] T [P] [US1] Write unit test for `DeleteGroceryList` use case in `frontend/tests/unit/application/DeleteGroceryList.test.ts` — Given a valid list `id`, When the use case executes, Then calls `repository.delete(id)` exactly once; Given a non-existent id, When executed, Then throws `NotFoundError`; mock repository with `vi.fn()`
- [x] T [P] [US1] Write component test for `GroceryListCard` in `frontend/tests/unit/presentation/GroceryListCard.test.tsx` — Given a `GroceryList` prop, When rendered, Then displays list name and formatted creation date; Given Delete clicked and confirmed, Then calls `onDelete` callback; Given Purchase clicked, Then calls `onPurchase` callback
- [x] T [P] [US1] Write component test for `DashboardPage` in `frontend/tests/unit/presentation/DashboardPage.test.tsx` — Given lists loaded, When search query typed, Then only matching lists are shown in real time; Given no lists, Then empty state message visible; Given delete confirmed, Then list removed from view

### Implementation for User Story 1

- [x] T [US1] Implement `GetAllGroceryLists` use case in `frontend/src/application/grocery-list/use-cases/GetAllGroceryLists.usecase.ts` — calls `groceryListRepository.getAll()`, returns result sorted by `updatedAt` descending using `date-fns` `compareDesc` (newly created and recently edited lists both appear first)
- [x] T [P] [US1] Implement `DeleteGroceryList` use case in `frontend/src/application/grocery-list/use-cases/DeleteGroceryList.usecase.ts` — calls `getById(id)`, throws `NotFoundError` if null, then calls `repository.delete(id)`
- [x] T [US1] Create `GroceryListCard` component in `frontend/src/presentation/components/GroceryListCard/GroceryListCard.tsx` — displays list name and `createdAt` formatted as `"dd MMM yyyy"` via `date-fns` `format`; action buttons: Purchase (logs `console.log`), Edit (calls `onEdit`), Delete (opens a Headless UI `Dialog` confirmation before calling `onDelete`); card styled as `bg-gray-800 rounded-xl shadow-lg p-4 transition-colors hover:bg-gray-750`; export class-name constants to `GroceryListCard.styles.ts`
- [x] T [P] [US1] Create `SearchBar` component in `frontend/src/presentation/components/SearchBar/SearchBar.tsx` — `<input>` with debounce-free controlled value; styled `bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`; no styles file; accessible `aria-label="Search grocery lists"`
- [x] T [US1] Create `DashboardPage` in `frontend/src/presentation/pages/DashboardPage/DashboardPage.tsx` — on mount: load all lists via `GetAllGroceryLists` use case and populate `groceryListsAtom`; render `SearchBar` reading `searchQueryAtom`, render filtered list from `filteredListsAtom` as `GroceryListCard` grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`); render empty state (text + "Create New List" button) when filtered list is empty; "Create New List" button always visible at top, styled `bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 font-medium transition-colors`; export class-name constants to `DashboardPage.styles.ts`; snackbar on load failure via `useSnackbar`

**Checkpoint**: User Story 1 fully functional — dashboard, search, delete, purchase log all working independently.

---

## Phase 4: User Story 2 — Create a New Grocery List (Priority: P2)

**Goal**: Modal form to create a list from scratch with name, item management (add/edit/remove),
category pick or create on the fly, item grouping by category, unsaved-changes safeguard.

**Independent Test**: Create a list with items across multiple categories, save, verify it appears
at top of dashboard — without needing the edit flow.

### Tests for User Story 2 (TDD — write first, confirm failing, then implement)

- [x] T [P] [US2] Write unit test for `GetAllCategories` use case in `frontend/tests/unit/application/GetAllCategories.test.ts` — Given repository returns categories, When executed, Then returns them as-is; mock repository with `vi.fn()`
- [x] T [P] [US2] Write unit test for `CreateOrReuseCategory` use case in `frontend/tests/unit/application/CreateOrReuseCategory.test.ts` — Given `" Dairy "` input and existing category `"dairy"` (normalized), When executed, Then returns existing category without creating a new one; Given no match, When executed, Then calls `repository.create(name)` and returns new category; mock repository with `vi.fn()`
- [x] T [P] [US2] Write unit test for `CreateGroceryList` use case in `frontend/tests/unit/application/CreateGroceryList.test.ts` — Given valid name + items, When executed, Then calls `repository.create` with correct shape and returns new list; Given empty name, When executed, Then throws `ValidationError`; Given empty items array, When executed, Then throws `ValidationError`
- [x] T [P] [US2] Write component test for `ItemSubForm` in `frontend/tests/unit/presentation/ItemSubForm.test.tsx` — Given empty name field, When rendered, Then confirm button is disabled; Given all fields pre-filled via `initialValues`, When confirm clicked, Then calls `onConfirm(item, categoryName)`. Use `createStore()` and seed `categoriesAtom` before rendering to avoid empty atom. Note: jsdom does not implement `scrollIntoView` — `window.HTMLElement.prototype.scrollIntoView = () => {}` MUST be in `tests/setup.ts`
- [x] T [P] [US2] Write component test for `GroceryListModal` in create mode in `frontend/tests/unit/presentation/GroceryListModal.create.test.tsx` — Given name entered and modal close attempted, When close triggered, Then `UnsavedChangesDialog` appears; Given "Exit Without Saving" selected, Then modal closes; Given "Save and Exit" selected, Then save is triggered and modal closes

### Implementation for User Story 2

- [x] T [US2] Implement `GetAllCategories` use case in `frontend/src/application/grocery-list/use-cases/GetAllCategories.usecase.ts` — delegates to `categoryRepository.getAll()`
- [x] T [P] [US2] Implement `CreateOrReuseCategory` use case in `frontend/src/application/grocery-list/use-cases/CreateOrReuseCategory.usecase.ts` — normalizes input (`name.trim().toLowerCase()`), calls `repository.findByNormalizedName`, returns existing if found, otherwise calls `repository.create(name.trim())`
- [x] T [US2] Implement `CreateGroceryList` use case in `frontend/src/application/grocery-list/use-cases/CreateGroceryList.usecase.ts` — validates `name` non-empty after trim (throws `ValidationError`), validates `items.length >= 1` (throws `ValidationError`), calls `repository.create`; on success updates `groceryListsAtom` by prepending new list
- [x] T [US2] Create `CategoryAutocomplete` component in `frontend/src/presentation/components/CategoryAutocomplete/CategoryAutocomplete.tsx` — Headless UI `Combobox` backed by `categoriesAtom`; allows free-text input for new category names; dropdown options styled `bg-gray-800 rounded-xl shadow-lg border border-gray-700`; active option highlighted `bg-indigo-600/20 text-indigo-300`; on selection/creation calls `CreateOrReuseCategory` use case and updates `categoriesAtom`; no styles file; `aria-label="Category"`
- [x] T [US2] Create `ItemSubForm` component in `frontend/src/presentation/components/ItemSubForm/ItemSubForm.tsx` and `ItemSubForm.styles.ts` — form for adding/editing a single item rendered inside a Headless UI Dialog (no extra Paper wrapper, no scrollIntoView); fields: name (`<input autoFocus>`), unit (`<input>`), category (`CategoryAutocomplete`); all inputs styled `bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-colors w-full`; Confirm button (`type="submit"`) disabled when name or unit empty OR category text is empty; button styled `bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-5 py-2 transition-colors`; wrapped in `<form onSubmit>` for Enter-key submission; calls `onConfirm(item, categoryName)` — two args; export class strings to `ItemSubForm.styles.ts`
- [x] T [US2] Create `UnsavedChangesDialog` component in `frontend/src/presentation/components/UnsavedChangesDialog/UnsavedChangesDialog.tsx` — Headless UI `Dialog` with two actions: "Save and Exit" (calls `onSaveAndExit`) and "Exit Without Saving" (calls `onExitWithoutSaving`); panel styled `bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6 max-w-sm w-full`; backdrop click closes dialog without either action (modal remains open); no styles file
- [x] T [US2] Create `GroceryListModal` component in `frontend/src/presentation/components/GroceryListModal/GroceryListModal.tsx` and `GroceryListModal.styles.ts` — accepts optional `initialList?: GroceryList` (null = create mode); always full-screen (Headless UI `Dialog` with a `fixed inset-0 bg-gray-950 z-50 flex flex-col` panel); name `<input>` at top styled as `bg-transparent border-b border-gray-700 text-2xl font-semibold text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors w-full pb-2`; categories loaded from `useAtom(categoriesAtom)` — NO local category state; items section shows items grouped by category with `useMemo`; each category group is collapsible (Headless UI `Disclosure`) via default-open state, header shows item count + `ChevronDownIcon` from Heroicons; items within a group spaced with `flex flex-col gap-2`; "+ Add item" button always visible; clicking it or the edit icon sets `addingItem=true` and opens a separate Headless UI `Dialog` (max-width `sm`) containing `ItemSubForm`; `onConfirm={(item, categoryName) => handleItemConfirm(item, categoryName)}` — two-arg contract; Save button: validates name non-empty + items ≥ 1 (inline errors), calls `CreateGroceryList` or `UpdateGroceryList` use case; on save failure shows snackbar and keeps modal open; unsaved-changes detection — triggers `UnsavedChangesDialog` on close attempt; export class strings to `GroceryListModal.styles.ts`
- [x] T [US2] Wire create flow into `DashboardPage` — "Create New List" button sets `activeListAtom` to null and opens `GroceryListModal` in create mode; on successful save: update `groceryListsAtom` to prepend new list (already done by use case atom update), close modal

**Checkpoint**: User Story 2 fully functional — create list end-to-end with item management, category creation, and unsaved-changes guard.

---

## Phase 5: User Story 3 — Edit an Existing Grocery List (Priority: P3)

**Goal**: Edit modal opens pre-populated with existing list data; same item/category management
as create; same unsaved-changes safeguard; saved changes reflected immediately on dashboard.

**Independent Test**: Open existing list in edit mode, modify name and items, save, verify all
changes reflected on dashboard without page reload.

### Tests for User Story 3 (TDD — write first, confirm failing, then implement)

- [x] T [P] [US3] Write unit test for `UpdateGroceryList` use case in `frontend/tests/unit/application/UpdateGroceryList.test.ts` — Given valid `id` + name + items, When executed, Then calls `repository.update(id, ...)` and returns updated list with new `updatedAt`; Given non-existent `id`, When executed, Then throws `NotFoundError`; Given empty name, When executed, Then throws `ValidationError`
- [x] T [P] [US3] Write component test for `GroceryListModal` in edit mode in `frontend/tests/unit/presentation/GroceryListModal.edit.test.tsx` — Given `initialList` with name and items, When modal opens, Then name field pre-populated with list name and items rendered grouped by category; Given changes made then Save clicked, Then calls `UpdateGroceryList` use case with updated data

### Implementation for User Story 3

- [x] T [US3] Implement `UpdateGroceryList` use case in `frontend/src/application/grocery-list/use-cases/UpdateGroceryList.usecase.ts` — calls `repository.getById(id)`, throws `NotFoundError` if null; validates name non-empty + items ≥ 1 (throws `ValidationError`); calls `repository.update(id, ...)` which sets new `updatedAt`; updates `groceryListsAtom` replacing the matching entry
- [x] T [US3] Extend `GroceryListModal` to fully support edit mode — when `initialList` is provided: pre-populate name field with `initialList.name`; pre-populate items list from `initialList.items` (grouped by category at render); on Save call `UpdateGroceryList` use case instead of `CreateGroceryList`; all other behaviour (unsaved-changes guard, validation, error snackbar) identical to create mode — update `frontend/src/presentation/components/GroceryListModal/GroceryListModal.tsx`
- [x] T [US3] Wire edit flow into `DashboardPage` — Edit button on `GroceryListCard` sets `activeListAtom` to the target list and opens `GroceryListModal` in edit mode (pass `initialList={activeList}`); on successful save: update `groceryListsAtom` replacing the matching entry (already done by use case atom update), close modal — update `frontend/src/presentation/pages/DashboardPage/DashboardPage.tsx`

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: WCAG 2.1 AA compliance, PWA validation, and end-to-end scenario verification.

- [x] T Prepare Git Flow branches per constitution — create `develop` branch from `main` (`git checkout main && git checkout -b develop`), then rename the current feature branch to `feature/001-grocery-list-manager` (`git branch -m 001-grocery-list-manager feature/001-grocery-list-manager`); update any upstream tracking reference
- [x] T [P] Audit all components for WCAG 2.1 AA compliance — verify semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>` where applicable), ARIA attributes (`aria-label`, `aria-describedby`, `aria-live` on search results), keyboard navigation (all interactive elements reachable via Tab, modals trap focus, Escape closes dialogs); update any non-compliant component
- [x] T [P] Validate PWA manifest completeness and service worker offline behaviour — verify `frontend/public/manifest.json` has all required fields, icons are present in `frontend/public/icons/`, service worker registers without errors in browser DevTools Application panel
- [x] T Run `npm test && npm run lint` from `frontend/` and resolve all failures
- [x] T Run all quickstart.md validation scenarios end-to-end in a browser and confirm all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; [P] tasks run in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
    - Domain entities (T007–T008) can run in parallel
    - Ports (T009–T011) depend on domain entities
    - Adapters (T012–T013) depend on ports
    - DI container (T014) depends on adapters
    - Presentation infra (T015–T019) can run in parallel with T012–T014
- **User Story 1 (Phase 3)**: Depends on Phase 2 — no dependency on US2 or US3
- **User Story 2 (Phase 4)**: Depends on Phase 2 — no dependency on US1 or US3
- **User Story 3 (Phase 5)**: Depends on Phase 2 AND US2 (reuses `GroceryListModal`)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2
- **US2 (P2)**: Independent after Phase 2
- **US3 (P3)**: Depends on US2 (`GroceryListModal` must exist before extending it)

### Within Each User Story

- Tests (T020–T023, T029–T033, T042–T043) MUST be written and fail before implementation
- Use cases before components that depend on them
- Shared components before page-level wiring
- Page wiring last within each story

### Parallel Opportunities

- All Phase 1 tasks marked [P] run in parallel (different config files)
- Domain entities T007–T008 run in parallel
- Ports T009–T010 run in parallel
- Adapters T012–T013 run in parallel
- Presentation infra T015–T016, T017–T018 run in parallel
- All test tasks within a story phase run in parallel (different test files)
- US1 and US2 can be worked on in parallel (different team members) after Phase 2

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests in parallel (all different files, no dependencies):
Task T020: GetAllGroceryLists.test.ts
Task T021: DeleteGroceryList.test.ts
Task T022: GroceryListCard.test.tsx
Task T023: DashboardPage.test.tsx

# Confirm all tests FAIL before implementing anything.

# Implement use cases in parallel (different files):
Task T024: GetAllGroceryLists.usecase.ts
Task T025: DeleteGroceryList.usecase.ts

# Then components sequentially (DashboardPage depends on GroceryListCard):
Task T026: GroceryListCard.tsx + styles
Task T027: SearchBar.tsx (parallel with T026)
Task T028: DashboardPage.tsx (depends on T026, T027)
```

---

## Parallel Example: User Story 2

```bash
# Write all US2 tests in parallel:
Task T029: GetAllCategories.test.ts
Task T030: CreateOrReuseCategory.test.ts
Task T031: CreateGroceryList.test.ts
Task T032: ItemSubForm.test.tsx
Task T033: GroceryListModal.create.test.tsx

# Confirm all tests FAIL.

# Implement use cases in parallel:
Task T034: GetAllCategories.usecase.ts
Task T035: CreateOrReuseCategory.usecase.ts
Task T036: CreateGroceryList.usecase.ts  (depends on T034, T035 conceptually but separate file)

# Components: CategoryAutocomplete → ItemSubForm → UnsavedChangesDialog (parallel) → GroceryListModal → DashboardPage wiring
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (dashboard, search, delete)
4. **STOP and VALIDATE**: Seed localStorage manually, test all US1 scenarios
5. Demo/deploy if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1: Browse & Delete → Validate → Demo (MVP: read-only dashboard)
3. US2: Create → Validate → Demo (full create flow)
4. US3: Edit → Validate → Demo (complete CRUD)
5. Polish → Production-ready

### Parallel Team Strategy

With two developers after Phase 2 completes:

- Developer A: US1 (dashboard)
- Developer B: US2 (create modal, item management)
- Developer B continues: US3 (extends GroceryListModal from US2)

---

## Notes

- [P] = different files, no incomplete-task dependencies
- TDD cycle per constitution: Write test → Confirm FAIL → Implement → Confirm PASS → Refactor
- Jotai atoms are the single source of truth for UI state; use cases update atoms directly
- `GroceryListModal` is the most complex component — it is built in US2 and extended (not rewritten) in US3
- Validation errors MUST be inline on fields; snackbar is ONLY for API/network errors (per constitution + FR-023)
- `filteredListsAtom` is a Jotai derived atom (read-only, computed from `groceryListsAtom` + `searchQueryAtom`)
- Stop at each checkpoint to validate the story independently before moving to next priority

---

## Bugfix: Responsive "Create New List" Button

- [x] T-BF001 Render plus-icon button (`sm:hidden`) on mobile and full-text button (`hidden sm:inline-flex`) on desktop in DashboardPage header (FR-004 updated)

## Bugfix: CategoryAutocomplete loses typed text on blur (BF002)

- [x] T-BF002 Fix `CategoryAutocomplete` to preserve typed free-text on blur by replacing `displayValue` with a controlled `value` prop on `ComboboxInput` — prevents Headless UI Combobox from clearing the input when `value` is `null` (new category typed but not yet selected). Fixes mobile tap-to-confirm being blocked because blur event cleared `categoryInputText` before the click event fired on the Confirm button. See `specs/001-grocery-list-manager/bugfixes/BF002-category-autocomplete-blur.md`. Files: `frontend/src/presentation/components/CategoryAutocomplete/CategoryAutocomplete.tsx` (FR-016)
