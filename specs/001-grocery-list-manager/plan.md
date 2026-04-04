# Implementation Plan: Grocery List Manager

**Branch**: `001-grocery-list-manager` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-grocery-list-manager/spec.md`

## Summary

Build the Grocery List Manager feature as a frontend-only PWA using React + TypeScript.
The feature covers a dashboard to browse, search, and delete lists, plus create/edit modals
with item and category management. No backend is present in this phase; a localStorage-backed
adapter fulfils the `GroceryListRepository` and `CategoryRepository` ports, making it trivially
swappable when the Fastify backend is built. Styling uses Tailwind CSS v3 with a dark-first
design (gray-950/900 surfaces, indigo/violet accents, smooth rounded corners and transitions);
Headless UI provides accessible Dialog, Combobox, and Disclosure primitives; a `ColorModeContext`
toggle allows switching to light mode as an opt-in.

## Technical Context

**Language/Version**: TypeScript 5.x / Node 22+
**Primary Dependencies**: React 18, Tailwind CSS v3, @headlessui/react, @heroicons/react,
clsx, tailwind-merge, date-fns v3, Jotai, Vitest + React Testing Library, vite-plugin-pwa
**Storage**: localStorage (mock adapter only — session-persistent, temporary)
**Testing**: Vitest + React Testing Library; all unit tests mock port dependencies
**Target Platform**: PWA — Chrome, Firefox, Safari (desktop + mobile); minimum viewport 320px
**Project Type**: PWA frontend application (frontend-only phase)
**Performance Goals**: Search filter response <300ms; item additions reflected instantly;
save round-trip feedback within 500ms (localStorage is synchronous)
**Constraints**: No backend; WCAG 2.1 AA; offline-capable via service worker + localStorage;
categories shared across all lists for the session user
**Scale/Scope**: Single authenticated user per session; no pagination for v1

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Hexagonal Architecture**: Domain / application / infrastructure layers defined for
      frontend. Use cases exist for every operation (GetAllGroceryLists, CreateGroceryList,
      UpdateGroceryList, DeleteGroceryList, GetAllCategories, CreateOrReuseCategory).
      Mock adapter in infrastructure — swappable without touching domain or application layers.
- [x] **TDD**: Vitest + RTL. All unit tests mock port dependencies via vi.fn(). Test
      descriptions follow Given/When/Then. Tests written and confirmed failing first.
- [x] **Error Handling**: Snackbar for API/network errors. Inline field-level errors for
      validation. No custom error shapes outside defined contracts.
- [x] **Frontend Stack**: React 18 + TypeScript + Tailwind CSS v3 + Headless UI + Heroicons + clsx/tailwind-merge + date-fns v3 + **Jotai** (state management — Zustand is prohibited
      per constitution v1.1.0). Dark-first design, class-name constant styling rule enforced.
      Mock API via localStorage adapter per constitution mock-first rule.
- [-] **Backend Stack**: Not applicable for this phase (frontend only).
- [x] **Branching**: Feature branch to be renamed `feature/001-grocery-list-manager` per Git
      Flow naming convention (see T047); `develop` branch to be created before first PR merge.

_Post-design re-check: All gates still pass. See research.md for technology decisions._

## Project Structure

### Documentation (this feature)

```text
specs/001-grocery-list-manager/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output — port interfaces + use-case signatures
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── domain/
│   │   └── grocery-list/
│   │       ├── GroceryList.ts               # GroceryList entity & types
│   │       ├── GroceryItem.ts               # GroceryItem entity & types
│   │       └── Category.ts                  # Category entity & types
│   │
│   ├── application/
│   │   └── grocery-list/
│   │       ├── ports/
│   │       │   ├── GroceryListRepository.port.ts
│   │       │   └── CategoryRepository.port.ts
│   │       └── use-cases/
│   │           ├── GetAllGroceryLists.usecase.ts
│   │           ├── CreateGroceryList.usecase.ts
│   │           ├── UpdateGroceryList.usecase.ts
│   │           ├── DeleteGroceryList.usecase.ts
│   │           ├── GetAllCategories.usecase.ts
│   │           └── CreateOrReuseCategory.usecase.ts
│   │
│   ├── infrastructure/
│   │   └── grocery-list/
│   │       ├── LocalStorageGroceryListRepository.ts
│   │       └── LocalStorageCategoryRepository.ts
│   │
│   ├── presentation/
│   │   ├── theme/
│   │   │   └── AppThemeProvider.tsx         # dark class toggle + ColorModeContext
│   │   ├── context/
│   │   │   └── SnackbarContext.tsx          # Global snackbar for non-validation errors
│   │   ├── pages/
│   │   │   └── DashboardPage/
│   │   │       ├── DashboardPage.tsx
│   │   │       └── DashboardPage.styles.ts
│   │   └── components/
│   │       ├── GroceryListCard/
│   │       │   ├── GroceryListCard.tsx
│   │       │   └── GroceryListCard.styles.ts
│   │       ├── GroceryListModal/
│   │       │   ├── GroceryListModal.tsx
│   │       │   └── GroceryListModal.styles.ts
│   │       ├── ItemSubForm/
│   │       │   ├── ItemSubForm.tsx
│   │       │   └── ItemSubForm.styles.ts
│   │       ├── CategoryAutocomplete/
│   │       │   └── CategoryAutocomplete.tsx  # <3 style props — no styles file
│   │       ├── SearchBar/
│   │       │   └── SearchBar.tsx             # <3 style props — no styles file
│   │       └── UnsavedChangesDialog/
│   │           └── UnsavedChangesDialog.tsx  # Headless UI Dialog — no styles file
│   │
│   ├── store/
│   │   ├── groceryList.store.ts             # Jotai atoms (wires use cases to UI)
│   │   └── category.store.ts
│   │
│   ├── di/
│   │   └── container.ts                     # Composition root — wires ports to adapters
│   │
│   └── main.tsx
│
├── tests/
│   └── unit/
│       ├── domain/
│       ├── application/
│       └── presentation/
│
├── public/
│   ├── manifest.json
│   └── icons/
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Frontend-only layout under `frontend/`. The `backend/` directory will
be added in a future phase without modifying the frontend structure. Hexagonal layers are
explicit directories — no collapsing of domain/application/infrastructure into a flat structure.

## Key Technical Decisions

These decisions were made and validated during implementation. Future features extending
this codebase MUST follow these patterns.

### GroceryListModal is always full-screen

The Headless UI `Dialog` panel uses `fixed inset-0 bg-gray-950 z-50 flex flex-col`
unconditionally — not just on mobile breakpoints. This was confirmed as the desired UX.

### ItemSubForm opens as a Dialog, not inline

The item add/edit form renders inside a separate Headless UI `Dialog` (max-width `sm`,
not full-screen) layered above the list modal. The `ItemSubForm` component itself contains
no extra wrapper or `scrollIntoView` logic. `addingItem` state in `GroceryListModal`
controls both the dialog's `open` prop and which title to show ("Add Item" / "Edit Item").

### categoriesAtom is the single source of truth for categories

`GroceryListModal` reads categories directly from `useAtom(categoriesAtom)` — there is
no local `categoriesLocal` state. `CategoryAutocomplete` and `ItemSubForm` both write new
categories to `categoriesAtom` via `useSetAtom`. This eliminates divergence between
local and global state when categories are created on the fly.

### onConfirm(item, categoryName) — two-arg contract

`ItemSubForm.onConfirm` passes `(NewItemInput, categoryName: string)` rather than just
`(NewItemInput)`. The parent `GroceryListModal` uses the `categoryName` directly
(no atom lookup) to avoid a race condition where `setCategories(atom)` is called but
the parent renders before the atom update propagates.

### Category confirmation deferred to submit

The Confirm button in the item dialog is enabled as soon as the category field contains
any non-empty text — it is NOT gated on the user pressing Enter in the Autocomplete
dropdown. `handleConfirm` in `ItemSubForm` calls `createOrReuseCategoryUseCase` with the
raw typed text if no `Category` object is selected. Changing typed text clears the
currently selected `Category` state to force re-resolution on next submit.

### Category sections are collapsible

`GroceryListModal` uses Headless UI `Disclosure` for each category group, defaulting to
open. The disclosure button shows item count + `ChevronDownIcon` (rotated on open via
`rotate-180` class). Edit/delete icon buttons call `e.stopPropagation()` to avoid
triggering the disclosure toggle.

### Item separation within category groups

Items inside a Disclosure panel are wrapped in a `<div className="flex flex-col gap-2">`
for visual spacing.

### jsdom scrollIntoView polyfill required in tests

jsdom does not implement `Element.prototype.scrollIntoView`. The `frontend/tests/setup.ts`
file MUST include:

```ts
window.HTMLElement.prototype.scrollIntoView = () => {};
```

Any component that calls `scrollIntoView` in a `useEffect` will throw in jsdom without this.

## Bugfix: Responsive "Create New List" Button

**Purpose**: On mobile the full-text "Create New List" button takes too much space in the header. Replace with a compact plus-icon button on mobile (< 640px); keep full text on desktop (≥ 640px).

**Approach**: Render two elements — an icon button with `sm:hidden` and the text button with `hidden sm:inline-flex`. Both share the same `onClick` handler. Uses `PlusIcon` from `@heroicons/react/20/solid`.

**Files**: `DashboardPage.styles.ts`, `DashboardPage.tsx`

## Bugfix: CategoryAutocomplete loses typed text on blur (BF002)

**Purpose**: On blur, Headless UI's `Combobox` resets input text via `displayValue`.
When `value` is `null` (user typed a new category name without selecting from dropdown),
`displayValue` returns `''`, clearing the visible input. On mobile, tapping the Confirm
button triggers blur before click, which clears `categoryInputText` in `ItemSubForm`,
disabling the button before the tap event completes.

**Approach**: Replace `displayValue` on `ComboboxInput` with a controlled `value` prop
that uses the parent-provided `inputValue` / internal `query` state. This makes the input
fully controlled and prevents the Combobox from resetting the text on blur.

**Files**: `CategoryAutocomplete.tsx`

**Related requirement**: FR-016 — category resolved on Confirm click, not on blur.

## Bugfix: Confirm button unresponsive on mobile after category input blur (BF003)

**Purpose**: On mobile Chrome, tapping the Confirm button in the Add Item form does
nothing — the button flashes disabled and the item is never created. Caused by
Headless UI Combobox v2.2.9 calling `onChange(null)` on blur when the combobox is open
and `value` is `null` (free-text typed), combined with the Combobox's `useOutsideClick`
`touchend` handler and internal `useWatch` DOM manipulation on close.

**Approach**: Multi-layered defense:

1. Null guard in `handleSelect` — prevents crash on `null.name`.
2. `onPointerDown` with `preventDefault` on Confirm button — prevents focus from
   leaving the category input, stopping the Combobox blur cascade entirely.
3. `categoryInputTextRef` in `ItemSubForm` — ref-backed fallback for category text
   so that even if a render cycle clears state, the ref preserves the last typed text.

**Files**: `CategoryAutocomplete.tsx`, `ItemSubForm.tsx`

**Related requirement**: FR-016 — category resolved on Confirm click, not on blur.

## Complexity Tracking

> No constitution violations to justify. All architectural decisions are compliant.
