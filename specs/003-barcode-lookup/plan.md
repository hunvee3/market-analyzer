# Implementation Plan: Barcode Lookup for Purchase Mode

**Branch**: `003-barcode-lookup` | **Date**: 2026-04-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-barcode-lookup/spec.md`
**Depends on**: `002-purchase-mode`
**User argument**: Use a library that reads barcodes — NOT QR codes.

## Summary

Adds camera-based barcode scanning to the `ProductAssignmentDialog` in Purchase Mode.
On mobile devices with camera permission, the dialog opens with a live camera scan view
by default; the user points their phone at a product barcode and the matching product is
pre-selected automatically. On desktop, or when camera permission is denied/unavailable,
the dialog falls back to the existing manual text-input flow unchanged.

Client-side decoding uses **`@ericblade/quagga2`** — a library purpose-built for 1D retail
barcodes (EAN-13, UPC-A/E) with zero QR code support, satisfying the user constraint. All
decoding runs in-browser; no camera data leaves the device. No new entities or backend
changes are required — the `Product` entity already has a `barcode` field and
`ProductRepository` already exposes `findByBarcode`. The feature extends the existing
hexagonal structure with one new port, one new infrastructure adapter, and one new
presentation component.

## Technical Context

**Language/Version**: TypeScript ~5.7 (frontend only — this is a frontend-only feature)
**Primary Dependencies**: React 18, Tailwind CSS v3, Headless UI, Heroicons, Jotai,
clsx + tailwind-merge, Fuse.js, date-fns, uuid (all existing);
`@ericblade/quagga2` (new — 1D barcode scanning, ~180 KB minified)
**Storage**: No new storage — localStorage (existing feature 001); no new entities
**Testing**: Vitest + React Testing Library; jsdom polyfills required for
`navigator.mediaDevices`, `navigator.permissions.query`, `ResizeObserver`
**Target Platform**: PWA — all modern browsers; mobile-primary for scan feature
**Project Type**: Web application (frontend PWA, frontend-only feature)
**Performance Goals**: Product pre-selected < 5 seconds from modal open on mobile (SC-001);
mode switch < 1 second (SC-005)
**Constraints**: WCAG 2.1 AA; dark-first design; offline-capable; client-side decoding only
(no camera frames leave device); 1D barcodes only (EAN-13, UPC-A — no QR)
**Scale/Scope**: 3 new files; 1 new port interface; 1 new infrastructure adapter;
1 new presentation component; 2 existing files modified; 4 new test files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #   | Principle                      | Status  | Notes                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I   | Hexagonal Architecture         | ✅ PASS | New `BarcodeDecoderPort` in application layer; `Quagga2BarcodeDecoder` in infrastructure layer. `BarcodeScannerView` (presentation) depends on the port, not on quagga2 directly. No cross-layer violations. Domain layer untouched — no new entities.                                                 |
| II  | Test-First Development         | ✅ PASS | TDD cycle enforced. `Quagga2BarcodeDecoder` tested with mocked quagga2 module. `BarcodeScannerView` tested via RTL with mock decoder. `detectMobileDevice` tested with mocked `navigator`. AAA + Given/When/Then throughout.                                                                           |
| III | Error Handling & Observability | ✅ PASS | All camera failure paths (`permission_denied`, `no_camera`, `timeout`, `error`) produce visible inline feedback. No silent failures. No sensitive data in scanner flow.                                                                                                                                |
| IV  | Frontend Tech Stack            | ✅ PASS | Tailwind CSS for all styling. Headless UI Dialog already used; no new overlays added. Heroicons for scan/toggle icons. clsx + tailwind-merge for class composition. Dark-first palette. `@ericblade/quagga2` is the only new dependency — justified as the only viable client-side 1D barcode library. |
| V   | Backend Tech Stack             | ✅ N/A  | Frontend-only feature. No backend changes. Existing mock repositories unchanged.                                                                                                                                                                                                                       |
| —   | Branching Strategy             | ✅ PASS | Feature branch from develop.                                                                                                                                                                                                                                                                           |

**Gate result**: PASS — No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-barcode-lookup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── BarcodeDecoder.port.ts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/src/
├── application/
│   └── purchase/
│       └── ports/
│           └── BarcodeDecoder.port.ts   # NEW — port interface for barcode decoding
├── infrastructure/
│   └── purchase/
│       └── Quagga2BarcodeDecoder.ts     # NEW — quagga2 adapter implementing BarcodeDecoderPort
├── presentation/
│   ├── components/
│   │   ├── BarcodeScannerView/          # NEW
│   │   │   ├── BarcodeScannerView.tsx
│   │   │   └── BarcodeScannerView.styles.ts
│   │   └── ProductAssignmentDialog/     # MODIFIED — scan/manual mode logic added
│   │       ├── ProductAssignmentDialog.tsx        # MODIFIED
│   │       └── ProductAssignmentDialog.styles.ts  # MODIFIED — new scan-view styles
│   └── utils/
│       └── detectMobileDevice.ts        # NEW — navigator.maxTouchPoints detection
└── di/
    └── container.ts                     # MODIFIED — register Quagga2BarcodeDecoder

frontend/tests/unit/
├── infrastructure/purchase/
│   └── Quagga2BarcodeDecoder.test.ts    # NEW
└── presentation/
    ├── components/
    │   ├── BarcodeScannerView.test.tsx       # NEW
    │   └── ProductAssignmentDialogScan.test.tsx  # NEW — scan-specific dialog tests
    └── utils/
        └── detectMobileDevice.test.ts    # NEW
```

**Structure Decision**: Extends the existing frontend hexagonal architecture.
No new top-level directories. All additions slot naturally into the established
domain/application/infrastructure/presentation layer structure.

## Constitution Check (Post-Design Re-evaluation)

All Phase 1 artifacts verified against constitution:

- **Hexagonal**: `BarcodeDecoder.port.ts` lives in `application/purchase/ports/` (zero
  framework imports). `Quagga2BarcodeDecoder` in `infrastructure/` imports quagga2 only.
  `BarcodeScannerView` imports from the port interface and the DI container — not from
  quagga2 directly. No cross-layer violations.
- **TDD**: All new units are testable. quagga2 is mocked via Vitest module mocking in
  `Quagga2BarcodeDecoder.test.ts`. Browser APIs (`navigator.permissions.query`,
  `navigator.mediaDevices`) are mocked in test setup. RTL used for all component tests.
- **Error handling**: Five fallback reasons defined (`permission_denied`, `no_camera`,
  `timeout`, `error`, `mid_session_error`) — each renders a distinct but consistent inline
  message. No silent failures. No sensitive data exposure.
- **Frontend stack**: `@ericblade/quagga2` is the only new dependency. All styling uses
  Tailwind CSS with extracted `.styles.ts` constants. Icons from Heroicons. No new
  accessible-primitive components needed (no new Dialog or Combobox).
- **Accessibility**: Camera preview area labeled with ARIA. Scan/manual toggle buttons
  keyboard-navigable. Fallback messages use `role="alert"` for screen-reader announcement.
  Loading and error states communicated via ARIA live regions.
