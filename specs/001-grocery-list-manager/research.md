# Research: Grocery List Manager

**Branch**: `001-grocery-list-manager` | **Date**: 2026-03-27

## 1. State Management

**Decision**: Zustand v4

**Rationale**: Zustand provides a minimal, boilerplate-free store that integrates cleanly
with hexagonal architecture — use cases are invoked directly inside store actions, keeping
the presentation layer thin. It avoids the provider-tree complexity of React Context for
cross-cutting state (modal open/close, search query, optimistic updates) and is significantly
lighter than Redux Toolkit for a single-feature scope.

**Alternatives considered**:
- *Redux Toolkit*: Excellent for large apps but introduces slice/action/selector ceremony
  that is disproportionate for this feature's scope.
- *React Context + useReducer*: Viable but becomes painful with multiple interdependent
  state slices (lists + categories + modal state + snackbar). Leads to prop drilling or
  nested providers.
- *Jotai*: Atomic model works well but has less community momentum than Zustand for
  React + TypeScript projects.

---

## 2. MUI Dark Mode Theming

**Decision**: MUI `createTheme` with two theme objects (light/dark), stored in
`AppThemeProvider`. User preference persisted in `localStorage` under key
`smart-basket:color-scheme`. System preference detected via `prefers-color-scheme`
media query on first load. Toggle exposed via React Context.

**Palette**:

| Token | Light | Dark |
|---|---|---|
| `primary.main` | `#0D9488` (Teal 600) | `#2DD4BF` (Teal 400) |
| `background.default` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) |
| `background.paper` | `#FFFFFF` | `#1E293B` (Slate 800) |
| `text.primary` | `#0F172A` (Slate 900) | `#F1F5F9` (Slate 100) |
| `text.secondary` | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) |
| `error.main` | `#EF4444` | `#F87171` |
| `divider` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` |

**Typography**: Inter (Google Fonts via `@fontsource/inter`). Scale uses MUI defaults
with `fontFamily: "'Inter', sans-serif"`. Border radius: `12px` on cards, `16px` on modals.

**Rationale**: Teal primary reads as modern and clean without feeling generic (avoids the
overused indigo/purple trend). Slate-based neutrals are richer than pure grey and pair well
with teal. The contrast ratios meet WCAG 2.1 AA at all specified text sizes.

**Alternatives considered**:
- MUI v6 CSS variables mode: More elegant for dark mode but requires MUI v6 which is still
  in release candidate phase. Deferred to avoid instability.
- Separate theme files per mode: Leads to duplication; a single `createTheme` factory
  parameterised by mode is cleaner.

---

## 3. LocalStorage Mock Adapter

**Decision**: `LocalStorageGroceryListRepository` and `LocalStorageCategoryRepository`
implement their respective port interfaces. Data is serialized to JSON under versioned
keys. Adapter simulates async behaviour by wrapping operations in `Promise.resolve()` —
this ensures the use cases and store behave identically whether the adapter is localStorage
or a real HTTP client.

**Storage keys**:
- `smart-basket:v1:grocery-lists` — JSON array of serialized `GroceryList` objects
- `smart-basket:v1:categories` — JSON array of serialized `Category` objects

**Version prefix** (`v1`): allows future migrations without corrupting existing data.
When the real backend adapter ships, `container.ts` swaps the import — zero changes
to domain, application, or presentation layers.

**Rationale**: The hexagonal pattern makes the localStorage adapter a first-class citizen,
not a hack. By simulating async and implementing the full port contract, the adapter is
indistinguishable from an HTTP adapter from the application layer's perspective.

**Alternatives considered**:
- In-memory store with no persistence: Does not satisfy the spec requirement for
  session-persistent data (data survives page refresh).
- IndexedDB: More robust but adds async complexity (IDB is inherently async with
  complex transaction API). Overkill for a temporary mock with a small data set.

---

## 4. PWA Setup

**Decision**: Vite + `vite-plugin-pwa` with Workbox `GenerateSW` strategy.

**Manifest**: name "Smart Basket", short_name "SmartBasket", theme_color `#0D9488`,
background_color `#0F172A`, display `standalone`, orientation `portrait`.

**Service Worker**: Cache-first for static assets; network-first for dynamic data
(not applicable in this phase since all data is localStorage, but pattern established
for backend phase).

**Rationale**: `vite-plugin-pwa` is the de-facto standard for Vite-based PWAs.
`GenerateSW` handles precaching automatically without requiring manual service worker
maintenance.

---

## 5. Category Autocomplete

**Decision**: MUI `Autocomplete` component with `freeSolo` prop. Custom
`filterOptions` uses `createFilterOptions` with a case-insensitive, whitespace-trimmed
normalizer function. When the user confirms a value that has no exact match (normalized),
`CreateOrReuseCategory` use case is invoked — it performs the same dedup check server-side
(in the adapter) as a safety net.

**Rationale**: `Autocomplete` with `freeSolo` is purpose-built for "select existing or
create new" patterns. The normalizer lives in a pure utility function, independently
testable, and reused in both the UI filter and the use case.

---

## 6. Testing Stack

**Decision**: Vitest + React Testing Library + `@testing-library/user-event` v14 +
`@testing-library/jest-dom`.

**Rationale**: Vitest is the natural choice for Vite projects — no separate config, shared
TS config, fast HMR-aware test execution. RTL enforces testing-from-the-user-perspective
discipline. `user-event` v14 provides realistic browser-event simulation over `fireEvent`.

**Port mocking strategy**: All port interfaces are mocked via `vi.fn()` in unit tests.
No localStorage is touched in unit tests. Integration tests (future) may use a real
localStorage adapter.
