# Tasks: Barcode Lookup for Purchase Mode

**Branch**: `003-barcode-lookup` | **Date**: 2026-04-10 | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3+US4)
                                          ↑
                                   US1 is blocking:
                               scanner + port + adapter
                               must exist before fallback
                               and desktop/toggle work
```

- **US1** (Scan on Mobile) is the core deliverable — blocks US2, US3, US4.
- **US2** (Permission Fallback) depends on the `lookupMode` state introduced in US1.
- **US3** (Desktop Default) and **US4** (Mode Toggle) share US1 infrastructure; can be implemented in parallel.
- Foundation tasks (polyfills, dependency install) must precede all user story phases.

## Parallel Execution

- T003, T004, T005 can run in parallel (independent new files).
- T007–T009 (scanner component tests + implementation) are TDD pairs — each test then implement.
- T013–T014, T015–T016 (US2 tests + implementation) can run after T010–T012.
- T017 (desktop test) and T018 (toggle test) can run in parallel.
- T021a (timeout test) must precede T021b (timeout implementation); both can start after T011.
- T022a (port contract update) → T022b (mid-session test) → T022 (mid-session implementation) must run in that order.

---

## Phase 1: Setup

- [x] T001 Install `@ericblade/quagga2` dependency in `frontend/package.json`
- [x] T002 Add `navigator.mediaDevices` and `navigator.permissions.query` polyfill stubs to `frontend/tests/setup.ts`

---

## Phase 2: Foundation (port + adapter + utility — blocking all user stories)

- [x] T003 [P] Create `BarcodeDecoderPort` interface in `frontend/src/application/purchase/ports/BarcodeDecoder.port.ts` from [contracts/BarcodeDecoder.port.ts](contracts/BarcodeDecoder.port.ts)
- [x] T004 [P] Create `detectMobileDevice` utility in `frontend/src/presentation/utils/detectMobileDevice.ts` returning `navigator.maxTouchPoints > 0`
- [x] T005 [P] Write test: `frontend/tests/unit/presentation/utils/detectMobileDevice.test.ts` — Given `maxTouchPoints > 0` returns true; Given `maxTouchPoints === 0` returns false
- [x] T006 Write test: `frontend/tests/unit/infrastructure/purchase/Quagga2BarcodeDecoder.test.ts` — Given init succeeds, Quagga.start() called; Given init fails, onError called; stop() calls Quagga.stop()
- [x] T007 Create `Quagga2BarcodeDecoder` in `frontend/src/infrastructure/purchase/Quagga2BarcodeDecoder.ts` implementing `BarcodeDecoderPort` using `@ericblade/quagga2` with readers `['ean_reader', 'upc_reader', 'upc_e_reader', 'ean_8_reader']`
- [x] T008 Register `barcodeDecoder = new Quagga2BarcodeDecoder()` export in `frontend/src/di/container.ts`

---

## Phase 3: User Story 1 — Scan Barcode to Find a Product on Mobile (P1)

**Goal**: Mobile user opens lookup modal → scan view active by default → barcode detected → product pre-selected automatically.

**Independent Test**: Open the `ProductAssignmentDialog` on a mobile device (or with `navigator.maxTouchPoints = 2`); grant camera permission; point at a product barcode — product should be pre-selected without typing.

- [x] T009 [US1] Write test: `frontend/tests/unit/presentation/components/BarcodeScannerView.test.tsx` — Given mount, loading state shown; Given decoder starts, camera preview rendered; Given barcode detected, `onDetected` called once with code; Given unmount, `session.stop()` called
- [x] T010 [US1] Create `BarcodeScannerView.styles.ts` in `frontend/src/presentation/components/BarcodeScannerView/BarcodeScannerView.styles.ts` with Tailwind class constants: `scanContainer`, `scanPreviewTarget`, `scanLoadingState`, `scanTypeInsteadBtn`
- [x] T011 [P] [US1] Create `BarcodeScannerView.tsx` in `frontend/src/presentation/components/BarcodeScannerView/BarcodeScannerView.tsx` — mounts decoder into a `<div ref>`, shows loading spinner while initialising, emits `onDetected(code)` on first detection (uses `hasDetected` ref to prevent duplicates), calls `session.stop()` after detection, cleans up on unmount
- [x] T012 [US1] Write test: `frontend/tests/unit/presentation/components/ProductAssignmentDialogScan.test.tsx` — Given mobile + permission `granted`, dialog opens in scan view; Given barcode detected and product found, product is pre-selected; Given barcode detected and no product found, switches to manual with "No product found" message and no barcode pre-fill; Given mobile + permission `'prompt'`, scan view opens and `BarcodeScannerView` mounts without pre-emptive fallback (native permission dialog handled by quagga2)
- [x] T013 [US1] Extend `ProductAssignmentDialog.tsx` (`frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx`): add `lookupMode: LookupMode` and `fallbackReason: FallbackReason | null` state; add `initLookupMode` async function in `open` useEffect that calls `detectMobileDevice()` and `navigator.permissions.query`; render `<BarcodeScannerView>` when `lookupMode === 'scan'` and no product selected; handle barcode detected by calling `searchProductsUseCase` with `strategy: 'barcode'`; on product found, call `handleSelectProduct`; on no match, set `lookupMode = 'manual'` and `scanNoMatch = true`
- [x] T014 [US1] Add scan-view Tailwind class constants to `frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.styles.ts`: `scanViewWrapper`, `scanFallbackBanner`, `scanNoMatchBanner`, `scanToggleBtn`

---

## Phase 4: User Story 2 — Fallback to Manual Input When Camera Permission Is Denied (P2)

**Goal**: Mobile user with denied camera permission (or no camera hardware) sees manual input by default with inline explanation.

**Independent Test**: Mock `navigator.permissions.query` returning `{ state: 'denied' }`; open dialog on mobile — should open in manual view with permission message (no camera UI shown).

- [x] T015 [US2] Write test: `ProductAssignmentDialogScan.test.tsx` additions — Given mobile + permission `denied`, dialog opens in manual view with `permission_denied` fallback message; Given mobile + `NotAllowedError` from scanner, falls back to manual with message; Given mobile + `NotFoundError`, falls back to manual with same message as permission denied; Given `timeout` emitted by scanner, manual view shown with timeout message
- [x] T016 [US2] Extend `ProductAssignmentDialog.tsx`: in `initLookupMode`, set `lookupMode = 'manual'` and `fallbackReason = 'permission_denied'` when permission state is `'denied'`; wire `BarcodeScannerView.onFallback` to set `lookupMode = 'manual'` and `fallbackReason = reason`; render fallback message banner in manual view when `fallbackReason` is set, using `role="alert"` — messages: `permission_denied` → "Camera access is unavailable. Enable it in device settings to scan barcodes."; `no_camera` / `error` → "Camera could not be accessed. Enter the barcode manually."; `timeout` → "Camera took too long to start. Enter the barcode manually."; `mid_session_error` → banner with text "Camera was interrupted." plus a "Try again" button that calls `setLookupMode('scan')` to re-enter scan mode

---

## Phase 5: User Story 3 + User Story 4 — Desktop Default & Mode Toggle (P3 + P4)

**Goal (US3)**: Desktop users see manual input by default with no camera UI or permission prompt.
**Goal (US4)**: Mobile users can switch between scan and manual views at any time; camera releases on switch.

**Independent Test US3**: Mock `navigator.maxTouchPoints = 0`; open dialog — no camera UI, no permission query.
**Independent Test US4**: Open dialog on mobile with permission; switch between scan and manual views; confirm camera stops on switch to manual.

- [x] T017 [P] [US3] Write test: `ProductAssignmentDialogScan.test.tsx` additions — Given desktop (`maxTouchPoints = 0`), dialog opens in manual view; `navigator.permissions.query` is never called; no `BarcodeScannerView` rendered
- [x] T018 [P] [US4] Write test: `ProductAssignmentDialogScan.test.tsx` additions — Given scan view active on mobile, clicking "Type instead" switches to manual; Given manual view on mobile + permission not `denied`, "Scan instead" button visible and clicking it shows scan view; Given `permission_denied` fallback, "Scan instead" button is NOT shown
- [x] T020 [US4] Add mode toggle controls to `ProductAssignmentDialog.tsx`: "Type instead" button in scan view (always visible) → `setLookupMode('manual')`; "Scan instead" button in manual view (mobile only, hidden when `fallbackReason === 'permission_denied'` or `'no_camera'`) → `setLookupMode('scan')`; on switch to manual, `BarcodeScannerView` unmounts (camera released via cleanup effect in T011); on switch back to scan, reset `fallbackReason` and `scanNoMatch`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T021a [P] Write test: `BarcodeScannerView.test.tsx` addition — Given 8 seconds pass without barcode detection, When timeout fires, Then `session.stop()` is called and `onFallback('timeout')` is emitted
- [x] T021b [P] Add timeout logic to `BarcodeScannerView.tsx`: start 8-second `setTimeout` on mount; if `hasDetected` ref is still `false` when it fires, call `session.stop()` and `props.onFallback('timeout')`; clear timeout in cleanup
- [x] T022a [P] Update `BarcodeDecoderPort` in `frontend/src/application/purchase/ports/BarcodeDecoder.port.ts` and `specs/003-barcode-lookup/contracts/BarcodeDecoder.port.ts`: add optional `onStreamError?: (error: Error) => void` callback to `BarcodeDecoderStartOptions` — called when the camera stream is interrupted _after_ a successful start (distinct from `onError` which covers init failures only)
- [x] T022b [P] Write test: `BarcodeScannerView.test.tsx` addition — Given decoder emits `onStreamError` after successful start, When mid-session error received, Then `onFallback('mid_session_error')` is called and `session.stop()` is called
- [x] T022 [P] Implement mid-session error in `BarcodeScannerView.tsx` and `Quagga2BarcodeDecoder.ts`: in `Quagga2BarcodeDecoder`, detect stream interruption and call the `onStreamError` callback; in `BarcodeScannerView`, handle `onStreamError` by calling `props.onFallback('mid_session_error')`
- [x] T023 Add ARIA accessibility attributes to `BarcodeScannerView.tsx`: label camera preview container with `aria-label="Camera barcode scanner"`; announce loading state via `aria-live="polite"`; ensure "Type instead" button is keyboard-focusable
- [x] T024 Verify all new Tailwind classes in `BarcodeScannerView.styles.ts` and `ProductAssignmentDialog.styles.ts` use dark-first palette (`bg-gray-900`, `bg-gray-800`, `text-gray-100`, `indigo-500` accents, `rounded-xl`, `shadow-lg`, `transition-colors duration-200`)
- [x] T025 Run full test suite `cd frontend && npm run test` and confirm all existing tests still pass (no regressions in `ProductAssignmentDialog` existing tests; explicitly verify `CreateProduct` duplicate-barcode tests still pass — FR-016 regression check)

---

## Summary

| Metric                               | Count |
| ------------------------------------ | ----- |
| Total tasks                          | 27    |
| Phase 1 — Setup                      | 2     |
| Phase 2 — Foundation                 | 6     |
| Phase 3 — US1 (Scan on Mobile)       | 6     |
| Phase 4 — US2 (Permission Fallback)  | 2     |
| Phase 5 — US3+US4 (Desktop + Toggle) | 3     |
| Phase 6 — Polish                     | 8     |
| Parallelizable tasks [P]             | 14    |

---

## Phase 7: UX Redesign Corrections (post-implementation)

> These tasks correct bugs and redesign the barcode lookup UX based on user feedback.
> See BF-003 through BF-005 in the bugfix folder for context.

- [x] COR-001 Fix market persistence: create `LocalStorageMarketRepository` at `frontend/src/infrastructure/purchase/LocalStorageMarketRepository.ts` (same pattern as `LocalStorageGroceryListRepository`); update `frontend/src/di/container.ts` to use it instead of `MockMarketRepository`
- [x] COR-002 Remove "Type instead" button from `BarcodeScannerView.tsx` and remove `scanTypeInsteadBtn` from `BarcodeScannerView.styles.ts`
- [x] COR-003 Add `initialBarcode?: string` prop to `ProductCreationForm.tsx`; use it as the initial value for the barcode `useState` field
- [x] COR-004 Redesign `ProductAssignmentDialog.tsx`: remove `lookupMode`/`fallbackReason`/`scanNoMatch`/`isMobile` states; add `cameraError` and `cameraDetected` states; embed `BarcodeScannerView` inside "By Barcode" tab (above the text input) instead of replacing the entire search area; on mobile, default `searchStrategy` to `'barcode'`; on detection, pre-fill `query`, auto-select if match found (FR-008), show "No products found" if not (FR-009); pass `initialBarcode={searchStrategy === 'barcode' ? query : undefined}` to `ProductCreationForm`; remove "Scan instead" button; add camera error banner (with "Try again" for mid-session) inside "By Barcode" tab
- [x] COR-005 Remove unused scan-mode style exports from `ProductAssignmentDialog.styles.ts` (`scanViewWrapper`, `scanNoMatchBanner`, `scanToggleBtn`)
- [x] COR-006 Update `specs/003-barcode-lookup/spec.md`: update FRs, User Stories, Edge Cases, Key Entities, and Success Criteria to reflect new embedded-camera UX; add FR-018 (barcode carry-over to product creation form)
- [x] COR-007 Rewrite `ProductAssignmentDialogScan.test.tsx` to match new UX: use `vi.hoisted` + DOM trigger buttons for `onDetected`/`onFallback`; add tests for barcode carry-over (T018); remove all "Type instead"/"Scan instead" button tests; verify mid_session_error "Try again" restarts camera; all 17 tests pass

## MVP Scope

**Implement only Phase 1 + Phase 2 + Phase 3 (T001–T014)** for a working P1 user story:
mobile users can scan a barcode and have a product pre-selected. Phases 4–6 add robustness
and the remaining stories but are safe to defer.
