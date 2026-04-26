# Quickstart: Barcode Lookup for Purchase Mode

**Branch**: `003-barcode-lookup` | **Date**: 2026-04-10

## What this feature adds

Camera-based barcode scanning inside the `ProductAssignmentDialog`. On mobile devices with
camera permission, the dialog opens directly in scan mode — point the camera at a retail
barcode and the matching product pre-selects itself. On desktop (or when scanning is
unavailable), the existing manual text-input flow is used unchanged.

---

## New dependency

```bash
cd frontend
npm install @ericblade/quagga2
```

`@ericblade/quagga2` is the only new runtime dependency introduced by this feature.
It provides 1D retail barcode decoding (EAN-13, UPC-A/E) entirely in-browser.
No QR code support is included.

---

## New files to create

### 1. BarcodeDecoderPort — application layer

**`frontend/src/application/purchase/ports/BarcodeDecoder.port.ts`**

Port interface for the scanner. See
[contracts/BarcodeDecoder.port.ts](contracts/BarcodeDecoder.port.ts) for the verbatim
TypeScript interface to copy into this file.

---

### 2. Quagga2BarcodeDecoder — infrastructure adapter

**`frontend/src/infrastructure/purchase/Quagga2BarcodeDecoder.ts`**

Wraps `@ericblade/quagga2` to implement `BarcodeDecoderPort`.

Key implementation notes:

- Call `Quagga.init(config, callback)` inside `start()`. The `config.inputStream.target`
  must be set to `options.targetElement`.
- Restrict readers to `['ean_reader', 'upc_reader', 'upc_e_reader', 'ean_8_reader']`
  to ensure no QR code detection occurs.
- Register `Quagga.onDetected` callback inside the init success callback.
- On init success: call `Quagga.start()`, then resolve with `{ stop: () => Quagga.stop() }`.
- On init error: call `options.onError(error as Error)`.
- The `stop()` handle must also call `Quagga.offDetected` to remove the listener before
  calling `Quagga.stop()`.

---

### 3. detectMobileDevice utility — presentation utils

**`frontend/src/presentation/utils/detectMobileDevice.ts`**

```typescript
export function detectMobileDevice(): boolean {
	return navigator.maxTouchPoints > 0;
}
```

---

### 4. BarcodeScannerView component

**`frontend/src/presentation/components/BarcodeScannerView/BarcodeScannerView.tsx`**

Props:

```typescript
interface BarcodeScannerViewProps {
	decoder: BarcodeDecoderPort;
	onDetected: (barcode: string) => void;
	onFallback: (reason: FallbackReason) => void;
}
```

Behaviour:

- On mount: call `decoder.start(...)`. Start an 8-second timeout interval; if the
  `onDetected` callback has not fired and quagga has not yet confirmed `started` events,
  call `session.stop()` and call `props.onFallback('timeout')`.
- On quagga `onDetected`: set a `hasDetected` ref to `true`, call `session.stop()`, then
  call `props.onDetected(result.code)`.
- On quagga `onError`: map error to `FallbackReason` and call `props.onFallback(reason)`.
- On unmount: call `session.stop()` (cleanup).
- Render states:
    - **Loading** (decoder starting): spinner with "Starting camera…" label.
    - **Active** (camera live): `<div ref={targetRef} />` where quagga renders its preview,
      plus a "Type instead" button that calls `props.onFallback('permission_denied')`.
    - **Error state** (rendered by parent after `onFallback`): handled in
      `ProductAssignmentDialog` — not by this component.

`FallbackReason` mapping:

```typescript
function mapError(error: Error): FallbackReason {
	if (error.name === 'NotAllowedError') return 'permission_denied';
	if (error.name === 'NotFoundError') return 'no_camera';
	return 'error';
}
```

**`frontend/src/presentation/components/BarcodeScannerView/BarcodeScannerView.styles.ts`**

Tailwind class constants for the scanner area, loading spinner, and overlay button.
Follow the dark-first palette: `bg-gray-900` container, `text-gray-400` loading text,
`bg-gray-800` button.

---

## Files to modify

### 5. ProductAssignmentDialog — add scan/manual mode

**`frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.tsx`**

New state:

```typescript
const [lookupMode, setLookupMode] = useState<LookupMode>('manual');
const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(
	null,
);
```

On `open` effect — compute initial `lookupMode`:

```typescript
useEffect(() => {
	if (!open) return;
	// ...existing reset logic...

	async function initLookupMode() {
		if (!detectMobileDevice()) {
			setLookupMode('manual');
			return;
		}
		try {
			const result = await navigator.permissions.query({
				name: 'camera' as PermissionName,
			});
			setLookupMode(result.state === 'denied' ? 'manual' : 'scan');
			setFallbackReason(
				result.state === 'denied' ? 'permission_denied' : null,
			);
		} catch {
			// Permissions API not supported (e.g., older Safari) — attempt scan anyway
			setLookupMode('scan');
		}
	}
	void initLookupMode();
}, [open, existingAssignment, prefill]);
```

Scan result handling:

```typescript
async function handleBarcodeDetected(barcode: string) {
	const results = await searchProductsUseCase.execute({
		query: barcode,
		strategy: 'barcode',
	});
	if (results.length > 0) {
		await handleSelectProduct(results[0]);
	} else {
		// FR-009: show message then switch to manual, no pre-fill
		setLookupMode('manual');
		setScanNoMatch(true); // drives an inline inline banner in manual view
	}
}
```

Render — scan view section (renders when `lookupMode === 'scan'` and no product selected):

```tsx
<BarcodeScannerView
	decoder={barcodeDecoder} // injected from DI container
	onDetected={handleBarcodeDetected}
	onFallback={(reason) => {
		setFallbackReason(reason);
		setLookupMode('manual');
	}}
/>
```

Mode toggle (mobile only, when no product selected):

- In scan view: "Type instead" button → `setLookupMode('manual')`
- In manual view on mobile: "Scan instead" button (hidden if `fallbackReason === 'permission_denied'` or `'no_camera'`) → `setLookupMode('scan')`

Fallback message banner (shown in manual view when `fallbackReason` is set or `scanNoMatch`):

- `permission_denied`: "Camera access is unavailable. Enable it in your device settings to scan barcodes."
- `no_camera` / `error`: "Camera could not be accessed. Enter the barcode manually."
- `timeout`: "Camera took too long to start. Enter the barcode manually."
- `mid_session_error`: "Camera was interrupted. Enter the barcode manually."
- `scanNoMatch` (no product found): "No product found for this barcode. Search by name or add a new product."

All messages use `role="alert"` for screen-reader announcement.

**`frontend/src/presentation/components/ProductAssignmentDialog/ProductAssignmentDialog.styles.ts`**

Add class constants for: `scanView`, `scanFallbackBanner`, `scanToggleBtn`, `scanModeContainer`.

---

### 6. DI container

**`frontend/src/di/container.ts`**

Import and instantiate `Quagga2BarcodeDecoder` and export it as `barcodeDecoder`:

```typescript
import { Quagga2BarcodeDecoder } from '@infrastructure/purchase/Quagga2BarcodeDecoder';
export const barcodeDecoder = new Quagga2BarcodeDecoder();
```

Import `barcodeDecoder` in `ProductAssignmentDialog` (similar to how `productRepository`
is imported today).

---

## Tests to write

### `Quagga2BarcodeDecoder.test.ts`

Mock `@ericblade/quagga2` via Vitest `vi.mock`. Test:

- `start()` calls `Quagga.init` with the target element and correct readers config
- `start()` calls `Quagga.start()` on init success
- `start()` calls `options.onError` on init failure
- `session.stop()` calls `Quagga.stop()`

### `BarcodeScannerView.test.tsx`

Provide a mock `BarcodeDecoderPort`. Test (AAA / Given-When-Then):

- **Given** component mounts, **When** decoder starts, **Then** loading state is shown
- **Given** decoder starts successfully, **When** a barcode is detected, **Then** `onDetected` is called with the barcode code
- **Given** decoder emits `NotAllowedError`, **When** error is received, **Then** `onFallback('permission_denied')` is called
- **Given** decoder emits `NotFoundError`, **When** error is received, **Then** `onFallback('no_camera')` is called
- **Given** 8 seconds pass without detection, **When** timeout fires, **Then** `onFallback('timeout')` is called
- **Given** component unmounts, **When** cleanup runs, **Then** `session.stop()` is called

> **jsdom polyfill note**: `navigator.mediaDevices` is not available in jsdom. Add a stub
> in `tests/setup.ts` before the `BarcodeScannerView` tests can reference it indirectly.

### `ProductAssignmentDialogScan.test.tsx`

Mock `detectMobileDevice`, `navigator.permissions.query`, `barcodeDecoder`, and
`SearchProductsUseCase`. Test:

- **Given** desktop device, **When** dialog opens, **Then** manual view is shown by default
- **Given** mobile + permission `denied`, **When** dialog opens, **Then** manual view shown with permission message
- **Given** mobile + permission `granted`, **When** dialog opens, **Then** scan view shown
- **Given** scan view active, **When** barcode detected and product found, **Then** product pre-selected
- **Given** scan view active, **When** barcode detected and no product found, **Then** switches to manual with no-match message
- **Given** scan view active, **When** fallback emitted (timeout), **Then** switches to manual with timeout message
- **Given** manual view on mobile + permission not denied, **When** "Scan instead" clicked, **Then** scan view shown

### `detectMobileDevice.test.ts`

Mock `navigator.maxTouchPoints`. Test:

- Returns `true` when `maxTouchPoints > 0`
- Returns `false` when `maxTouchPoints === 0`

---

## Test environment polyfills

Add to `frontend/tests/setup.ts` (if not already present):

```typescript
// navigator.mediaDevices stub — jsdom does not implement camera APIs
Object.defineProperty(navigator, 'mediaDevices', {
	value: { getUserMedia: vi.fn().mockResolvedValue({}) },
	writable: true,
});

// navigator.permissions stub — not in jsdom
Object.defineProperty(navigator, 'permissions', {
	value: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) },
	writable: true,
});
```

These polyfills follow the constitution rule: "Any missing native browser method MUST be
polyfilled in the global test setup file, not silenced with try/catch in component code."
