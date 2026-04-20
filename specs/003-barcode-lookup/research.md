# Research: Barcode Lookup for Purchase Mode

**Branch**: `003-barcode-lookup` | **Date**: 2026-04-10

---

## R1: Client-Side 1D Barcode Scanning Library

**Context**: FR-014 mandates that all barcode decoding runs entirely client-side in the
browser with no camera frames leaving the device. The user requirement explicitly excludes QR
codes — only retail linear (1D) barcodes (EAN-13, UPC-A) are in scope.

**Decision**: Use **`@ericblade/quagga2`** for all barcode detection from the camera stream.

**Rationale**:

- Purpose-built for 1D retail barcodes — supports EAN-13, EAN-8, UPC-A, UPC-E, Code 128,
  Code 39 and others. Has zero QR code support by design, satisfying the user's explicit
  constraint without additional configuration.
- Operates entirely in-browser via `getUserMedia` + canvas processing. No camera frame or
  image data leaves the device — satisfies FR-014.
- Renders a live camera preview into a designated DOM element (`target` option). The preview
  renders inside the modal container, satisfying FR-006.
- Well-maintained fork of the original QuaggaJS project. Actively maintained as of 2025.
- Bundle size: ~160–180 KB minified. Acceptable for a PWA feature used only in-store.
- Clean lifecycle API: `Quagga.init(config, callback)`, `Quagga.start()`, `Quagga.stop()`,
  `Quagga.onDetected(callback)`. Easy to wrap behind a port interface.

**Alternatives considered**:

- **`@zxing/browser`** (~250 KB): Supports 1D and 2D formats including QR. Can be restricted
  to 1D formats via configuration, but the QR decoder code is still included in the bundle.
  Larger bundle, more complex API, requires passing a `MediaStream` object manually.
  Rejected because quagga2 is leaner and purpose-aligned with the 1D-only requirement.
- **`html5-qrcode`** (~350 KB): Misleading name — supports 1D and QR. Larger bundle.
  Rejected.
- **Native `BarcodeDetector` API**: Available in Chrome 83+ and Edge, not in Firefox or
  Safari iOS (the dominant mobile browser for iOS users). Unreliable for a PWA targeting all
  mobile devices. Rejected for insufficient cross-browser support.
- **`scandit` / `dynamsoft`**: Commercial SDKs requiring license keys and per-scan fees.
  Out of scope for a self-hosted PWA. Rejected.

**Configuration** (EAN/UPC retail barcodes only):

```typescript
readers: ['ean_reader', 'upc_reader', 'upc_e_reader', 'ean_8_reader'];
```

**Integration approach**: Wrap quagga2 behind `BarcodeDecoderPort` (application layer port)
with a `Quagga2BarcodeDecoder` infrastructure adapter. The port is injected into the
`BarcodeScannerView` presentation component via the DI container, keeping the presentation
layer decoupled from the quagga2 API and keeping the component testable with a mock decoder.

---

## R2: Mobile Device Detection Strategy

**Context**: FR-001 and FR-002 require the modal to default to scan view on mobile and manual
input on desktop with no user configuration. Detection must work entirely in the browser.

**Decision**: Use `navigator.maxTouchPoints > 0` as the sole mobile detection signal.

**Rationale**:

- `navigator.maxTouchPoints` returns the maximum number of simultaneous touch contact points.
  Any value `> 0` means the device supports touch input, which is the reliable distinguishing
  characteristic of mobile and tablet devices versus desktop/laptop machines.
- Cross-browser: supported in all modern browsers (Chrome, Firefox, Safari, Edge) and does
  not require any polyfill.
- No viewport-width check: using screen width alone is unreliable (small browser windows on
  desktop, landscape tablets). Touch capability is the meaningful signal for this feature.
- Tablet devices (`maxTouchPoints > 0`) will default to scan view — this is the correct
  behaviour; tablets are held in-store just like phones.

**Implementation**: Pure utility function `detectMobileDevice(): boolean` in
`frontend/src/presentation/utils/detectMobileDevice.ts`. Returns `true` when
`navigator.maxTouchPoints > 0`, `false` otherwise. Called once per modal open.

**Alternatives considered**:

- `window.innerWidth < 1024`: Brittle — a desktop user running in a narrow window would
  trigger the scan view. Rejected.
- `navigator.userAgent` parsing: Fragile, easily spoofed, deprecated direction. Rejected.
- Server-side UA detection: Requires server roundtrip, breaks offline-capable PWA. Rejected.
- CSS media query `(pointer: coarse)` via `window.matchMedia`: Also a valid signal but
  `maxTouchPoints` is simpler to test and equally reliable. Considered acceptable alternative
  if `maxTouchPoints` proves unreliable in edge cases.

---

## R3: Camera Permission and Browser API Flow

**Context**: FR-003, FR-004, FR-012 require proactive permission checking, graceful fallback
on denial, and re-checking permission on each modal open. Camera permission APIs vary across
browsers.

**Decision**: Two-stage permission strategy — proactive query first, reactive error catch second.

**Stage 1 — Proactive query** (on modal open, before mounting `BarcodeScannerView`):

```typescript
const result = await navigator.permissions.query({
	name: 'camera' as PermissionName,
});
// result.state: 'granted' | 'denied' | 'prompt'
```

- If `denied` → immediately set `lookupMode = 'manual'`, display fallback message. No camera
  component mounted (FR-004, FR-005).
- If `granted` or `prompt` → mount `BarcodeScannerView` (quagga2 will show the native prompt
  for `prompt` state).
- If `navigator.permissions.query` throws (e.g., older Safari iOS) → fall through to Stage 2.

**Stage 2 — Reactive error catch** (inside `BarcodeScannerView` / quagga2 init callback):

- `NotAllowedError` (permission denied at runtime) → emit `onFallback('permission_denied')`
- `NotFoundError` (no camera hardware) → emit `onFallback('no_camera')`
- Any other error → emit `onFallback('error')`

**Timeout** (FR-017): An 8-second timer starts when `BarcodeScannerView` mounts. If quagga2
has not emitted a `started` event within 8 seconds, the component calls `Quagga.stop()` and
emits `onFallback('timeout')`.

**Re-check on each open** (FR-012): The proactive query is called inside the `useEffect`
that fires when `open` changes to `true` in `ProductAssignmentDialog`. This ensures each
fresh modal open re-reads the current permission state.

**Permission Constraints by Browser**:

- **Chrome / Edge (desktop + Android)**: `navigator.permissions.query({ name: 'camera' })`
  fully supported.
- **Firefox**: `navigator.permissions.query({ name: 'camera' })` supported since v96.
- **Safari iOS 16+**: `navigator.permissions.query` for `camera` is supported.
  Earlier versions: API may throw → Stage 2 handles it.
- **Safari desktop**: Behaves like iOS in permission model.

**Conclusion**: Two-stage approach covers the full browser matrix reliably.

---

## R4: Integration with Existing ProductAssignmentDialog

**Context**: The existing `ProductAssignmentDialog` already handles name/barcode toggle
search. Feature 003 adds a scan mode that short-circuits the manual search flow when a
barcode is detected automatically.

**Decision**: Extend `ProductAssignmentDialog` with a `lookupMode: 'scan' | 'manual'` state.
Keep all existing logic intact. Add scan-specific rendering conditionally.

**Integration points**:

- `lookupMode` initial value: computed from mobile detection + permission check on each
  `open` event (via `useEffect` on `open`).
- When `lookupMode === 'scan'`: render `BarcodeScannerView` in place of the text input +
  result list. Show a "Type instead" link/button to switch to manual.
- When `lookupMode === 'manual'`: existing rendering unchanged. On mobile, show a "Scan
  instead" button (visible only when permission is not `denied`).
- On barcode detected by `BarcodeScannerView`:
    1. Stop scanner (unmount / emit `onDetected`)
    2. Call `searchProductsUseCase.execute({ query: barcode, strategy: 'barcode' })`
    3. If product found: pre-select, switch to assignment form (same as manual select)
    4. If not found: show inline "No product found for this barcode" message,
       then `setLookupMode('manual')` (FR-009)
- Existing manual flow (name search, barcode text search, product list, create form) is
  untouched.

**What does NOT change**:

- `SearchProductsUseCase`, `GetLastProductPriceUseCase` — no changes.
- `ProductRepository` port — `findByBarcode` already exists; `SearchProducts` already uses it.
- Domain entities — no changes (Product already has `barcode` field).
- Test existing tests — no regressions; new test file covers scan-specific behavior.

**New presentation component: `BarcodeScannerView`**

Responsibilities:

- Mount and start quagga2 on the target `<div>` ref
- Apply 8-second timeout for camera initialisation
- Emit `onDetected(barcode: string)` on first confirmed scan (stop immediately after first
  detection to prevent duplicate firing — quagga2 fires `onDetected` continuously while
  aimed at a code)
- Emit `onFallback(reason: FallbackReason)` on any camera failure
- Stop quagga2 on unmount (cleanup)
- Render: camera preview area, loading spinner (while initialising), error state with "Try
  again" and "Switch to manual" actions

**Deduplication**: quagga2 fires `onDetected` on every successful frame decode. A `useRef`
flag prevents calling `onDetected` prop more than once per scan session. The scanner is
stopped after the first confirmed detection.

---

## Terminology Note

**"close match" = fuzzy search via Fuse.js**: The spec (FR-013) and Feature 002 spec use
the term "close match" for product name search. In the implementation this is the existing
Fuse.js fuzzy search introduced in Feature 002 (R1 of `002-purchase-mode/research.md`).
The terms are interchangeable — "close match," "fuzzy match," and "fuzzy search" all refer
to the same Fuse.js-powered search already in place. No disambiguation is needed during
implementation.
