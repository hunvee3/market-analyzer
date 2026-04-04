# Bugfix: CategoryAutocomplete loses typed text on blur (BF002)

**Branch**: `bugfix/category-autocomplete-blur`
**Date**: 2026-04-04
**Affects**: `CategoryAutocomplete`, `ItemSubForm`
**Severity**: High (blocks mobile usage)

## Problem

When the user focuses the category input in the Add/Edit Item dialog, types a **new**
category name (one that does not match any existing category), and then clicks outside
the input (losing focus), the input text is cleared.

### Root Cause

Headless UI's `Combobox` resets the input text on blur using the `displayValue` callback.
Since no `Category` object is selected (the user typed free text for a new category),
`value` is `null` and `displayValue` returns `''`, wiping the visible input.

### Desktop Impact

On desktop browsers the form still works because the parent `ItemSubForm` retains
`categoryInputText` in its own state and the Confirm button remains enabled. However,
the visible input appears empty, which is confusing.

### Mobile Impact (Critical)

On mobile browsers, tapping the **Confirm** button triggers `blur` on the category input
**before** the `click` event fires on the button. The blur event clears the displayed
text, which causes `onInputChange?.('')` to propagate up to `ItemSubForm`, setting
`categoryInputText` to `''`. This disables the Confirm button (`!categoryFilled`)
before the tap completes, so the click event never fires. The user is unable to confirm
an item with a new category.

## Fix

Replace the `displayValue` prop on `ComboboxInput` with a **controlled `value` prop**
that uses the parent-provided `inputValue` (or internal `query` state) instead of
relying on the Combobox's internal blur reset. This ensures:

1. Typed text is preserved on blur (the input is fully controlled).
2. The `onInputChange` callback is not called with `''` on blur.
3. Mobile tap-to-confirm works correctly because `categoryInputText` is never cleared
   by a spurious blur event.

### Files Changed

- `frontend/src/presentation/components/CategoryAutocomplete/CategoryAutocomplete.tsx`
  — Replace `displayValue` with controlled `value` prop on `ComboboxInput`.

## Related Requirements

- **FR-016**: _"The Confirm button in the item dialog MUST be enabled as soon as a
  category name is typed (even if not yet confirmed via Enter or dropdown selection) —
  the category is resolved to an existing or newly created record when Confirm is
  clicked, not when the field loses focus."_

## Verification

1. Open the Add Item dialog.
2. Type a new category name (e.g., "Snacks") that does not exist.
3. Click/tap outside the category input — the text must remain visible.
4. Click/tap the Confirm button — the item must be added with the new category.
5. On mobile: tap Confirm immediately after typing in category — must work on first tap.
