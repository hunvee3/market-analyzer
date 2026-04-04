# Bugfix: Confirm button unresponsive on mobile after category input blur (BF003)

**Branch**: `bugfix/category-confirm-mobile-blur`
**Date**: 2026-04-04
**Affects**: `CategoryAutocomplete`, `ItemSubForm`
**Severity**: Critical (completely blocks item creation on mobile Chrome)
**Depends on**: BF002 (controlled `value` prop — already merged)

## Problem

On mobile Chrome, when the user fills all fields in the Add Item form (name, amount,
unit, category) and taps the **Confirm** button, the button briefly flashes as disabled
(pale) and nothing happens — the item is never created and the form does not close.

This does **not** reproduce on desktop browsers.

### Root Cause

Headless UI `Combobox` v2.2.9 calls its `onChange` callback with `null` during the
blur handler when all of the following conditions are met:

1. The combobox is in **single** mode (not multi-select).
2. The current `value` prop is `null` (free-text typed, no option selected).
3. The combobox state is **Open** (dropdown was shown or input was focused).

The blur handler (`K` in the compiled source) runs:

```js
// Simplified from combobox.js
if (comboboxState === Open) {
	if (mode === Single && value === null) {
		onChange(null); // ← fires our handleSelect(null)
	}
	closeCombobox();
}
```

On mobile, tapping Confirm triggers this sequence:

1. **`blur`** fires on `ComboboxInput` (touch-up lifts focus from input).
2. Headless UI calls `onChange(null)` → our `handleSelect(null)`.
3. `handleSelect` attempts `cat.name` on `null` → **runtime error** (swallowed by
   `async` function, no visible crash).
4. `onInputChange` is **never called** (code after the crash doesn't execute), so
   `categoryInputText` stays intact in `ItemSubForm`.
5. However, Headless UI also calls `closeCombobox()`, which triggers an internal
   `useWatch` hook that **directly sets** the DOM input's `.value` to the computed
   `displayValue` (which is `undefined` since we use controlled `value` instead of
   `displayValue`). This causes the DOM input to show `"undefined"` or empty, and
   React's controlled value re-renders to fix it — but the re-render cycle causes the
   `Combobox` internal state to enter a closed state.
6. On mobile, the `click` event that follows the `blur` on the Confirm button fires
   while the component is mid-re-render. The button may be momentarily disabled or
   the event is lost.

### Why desktop works

On desktop, `blur` and `click` events fire in quick succession and React batches the
re-renders. The `handleSelect(null)` error is swallowed, `categoryInputText` remains
intact, and the form submit completes in the same microtask. On mobile, the touch
event model introduces a ~300ms delay between `blur` and the synthesized `click`,
giving React time to re-render with the broken state.

## Fix

A multi-layered defense that addresses each stage of the Headless UI blur cascade:

### 1. Null guard in `handleSelect` (CategoryAutocomplete.tsx)

When Headless UI calls `onChange(null)` on blur, return early without propagating to
the parent. This prevents the runtime error on `null.name` and any unintended state
changes.

### 2. `onPointerDown` preventDefault on Confirm button (ItemSubForm.tsx)

Adding `onPointerDown={(e) => e.preventDefault()}` to the Confirm button prevents
focus from leaving the category input when the button is pressed. This stops the
entire Combobox blur chain from firing in the first place — the combobox stays open
(or already closed) and doesn't trigger `onChange(null)` or the `useWatch` DOM clear.

### 3. Ref-backed category text (ItemSubForm.tsx)

A `useRef` mirrors `categoryInputText` state so that even if a render cycle clears the
state value, the ref preserves the last user-entered text. Both `categoryFilled`
(which gates the disabled state) and `handleConfirm` (which resolves the category)
read from the ref as a fallback.

### Files Changed

- `frontend/src/presentation/components/CategoryAutocomplete/CategoryAutocomplete.tsx`
  — Add null guard to `handleSelect`: `if (!cat) return`.
- `frontend/src/presentation/components/ItemSubForm/ItemSubForm.tsx`
  — Add `categoryInputTextRef` ref mirroring `categoryInputText` state.
  — Use ref as fallback in `categoryFilled` and `handleConfirm`.
  — Add `onPointerDown={(e) => e.preventDefault()}` on Confirm button.

## Related Requirements

- **FR-016**: _"The Confirm button in the item dialog MUST be enabled as soon as a
  category name is typed (even if not yet confirmed via Enter or dropdown selection) —
  the category is resolved to an existing or newly created record when Confirm is
  clicked, not when the field loses focus."_

## Verification

1. Open the Add Item dialog on **mobile Chrome**.
2. Fill in Item Name, Amount, Unit.
3. Type a new category name (e.g., "Snacks") in the Category field.
4. Tap the **Confirm** button.
5. **Expected**: Item is created with the "Snacks" category, form closes.
6. **Previously**: Button flashes disabled, nothing happens.
7. Also verify: selecting an existing category from the dropdown still works on both
   desktop and mobile.
