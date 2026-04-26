# Data Model: Barcode Lookup for Purchase Mode

**Branch**: `003-barcode-lookup` | **Date**: 2026-04-10
**Depends on**: `002-purchase-mode` (Product, ProductRepository port)

## Overview

This feature introduces **no new domain entities** and **no data model changes**.

The `Product` entity already carries an optional `barcode` field (confirmed from the
existing "Create New Product" form and the `ProductRepository` port which exposes
`findByBarcode`). No migration, no schema change, no new persistence layer.

The two new concepts introduced by this feature — **Lookup Mode** and **Camera Permission
State** — live exclusively in the presentation layer as transient UI state. They are never
persisted and have no domain representation.

---

## Existing Entity: Product (unchanged)

```typescript
// frontend/src/domain/purchase/Product.ts — NO CHANGES
interface Product {
	id: string; // UUID v4
	name: string; // non-empty after trim
	barcode: string; // optional in practice; empty string when not assigned
	createdAt: string; // ISO 8601 UTC
}
```

**Barcode uniqueness** (FR-016): Enforced at the `CreateProduct` use-case level
(already in place via `CreateProductResult: 'duplicate_barcode'` discriminated union).
No changes needed.

---

## New Runtime Concepts (presentation layer only — not persisted)

### LookupMode

```typescript
type LookupMode = 'scan' | 'manual';
```

- **`'scan'`**: Camera preview is active; barcode detection running.
  Default on mobile when camera permission is `'granted'` or `'prompt'`.
- **`'manual'`**: Text input is active; existing name/barcode search.
  Default on desktop. Also the fallback for all camera failure conditions.

**Initial value rules** (evaluated once per modal open):

| Device  | Permission state | Initial LookupMode                                 |
| ------- | ---------------- | -------------------------------------------------- |
| Mobile  | `granted`        | `'scan'`                                           |
| Mobile  | `prompt`         | `'scan'` (native prompt shown by quagga2)          |
| Mobile  | `denied`         | `'manual'` (FR-004)                                |
| Mobile  | API unsupported  | `'scan'` (Stage 2 error handling catches failures) |
| Desktop | any              | `'manual'` (FR-002)                                |

---

### CameraPermissionState

```typescript
type CameraPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';
```

- Resolved via `navigator.permissions.query({ name: 'camera' })` on each modal open.
- `'unknown'` is used when the Permissions API is not available (older Safari).
- Never stored in localStorage, Jotai atoms, or any other persistent store.
- Only used to compute the initial `LookupMode` value.

---

### FallbackReason

```typescript
type FallbackReason =
	| 'permission_denied' // NotAllowedError — user denied camera access
	| 'no_camera' // NotFoundError — no camera hardware accessible
	| 'timeout' // camera did not start within ~8 seconds (FR-017)
	| 'error' // any other quagga2 initialisation error
	| 'mid_session_error'; // camera stream interrupted after successful start (FR-015)
```

Used by `BarcodeScannerView` to emit the correct inline message to the parent component.
Not persisted; exists only for the duration a scan session is active.

---

## Port Changes

### BarcodeDecoderPort (new)

A new port is added to the application layer. This is the only code-level artifact
introduced at the application layer by this feature.

See [contracts/BarcodeDecoder.port.ts](contracts/BarcodeDecoder.port.ts) for the full
TypeScript interface.

**Summary**:

- `start(target, options) → Promise<BarcodeDecoderSession>`: initialise quagga2, render
  camera preview into `target`, fire callbacks on detection and error.
- `BarcodeDecoderSession.stop()`: stop quagga2 and release the camera.
- `onDetected` callback receives a `{ code: string; format: string }` result.
- `onError` callback receives an `Error` — mapped to `FallbackReason` by the caller.

### ProductRepository (unchanged)

`findByBarcode(barcode: string): Promise<Product | null>` already exists.
`SearchProductsUseCase` already uses it via `strategy: 'barcode'`.
No changes to any existing port or use case.
