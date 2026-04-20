# Feature Specification: Barcode Lookup for Purchase Mode

**Feature Branch**: `003-barcode-lookup`
**Created**: 2026-04-10
**Status**: Draft
**Input**: User description: "lets implement barcode lookup. When adding a product to a grocery list item in purchase mode, barcode should be the default. In this step, the app will render the device camera view on the modal for the user to point to the bar code of the real product. Once the camera point to it, it will recognize the barcode and extract the numbers to do the look up. For this the use will have to give device permissions to the camera first. if the user hasnt given that permission the the lookup modal will default to manual input. The objective is for the user in site to be able to look and load the product fast. When used on a desktop device and not in a mobile device, it will default to manual input."
**Depends on**: `002-purchase-mode` (Purchase Mode, Product Lookup Modal)

## Clarifications

### Session 2026-04-10

- Q: Where does barcode decoding happen — client-side, server-side, or external API? → A: Client-side only; all decoding runs in-browser with no camera data leaving the device.
- Q: What happens when a scanned barcode matches no product in the catalogue? → A: Show an inline "no match" message; the barcode number IS pre-filled in the input so the user can verify it, edit it, or carry it into the Create New Product form without re-typing.
- Q: Does the barcode-based product lookup use a remote API or local data? → A: Same mechanism as existing Feature 002 product search — no change to data source or lookup strategy.
- Q: What happens when the camera loses access mid-session? → A: Hide the camera preview, show an inline error banner with a "Try again" button, and let the user continue typing in the barcode input below — no mode switch, no modal close.
- Q: Does the Product entity need a barcode field added? → A: No — the Product entity already has an optional barcode field in the existing data model; no schema change is required.

### Session 2026-04-10 — Clarification Round 2

- Q: Can a barcode value map to more than one product in the catalogue? → A: No — barcodes are unique per product; the system enforces one product per barcode value at product creation.
- Q: What happens when the camera preview loads very slowly or times out? → A: Apply a timeout; if the camera does not start within the limit, auto-fall back to manual input with an inline message.
- Q: What happens when the device is mobile but has no accessible camera hardware? → A: Treat identically to permission-denied — auto-default to manual input with an inline explanation; no separate error branch required.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Scan Barcode to Find a Product on Mobile (Priority: P1)

A mobile user in Purchase Mode clicks "Assign Product" on a grocery list item. The product
lookup modal opens with the **By Barcode** tab active by default. The camera preview appears
inside that tab above the barcode text input. The app requests camera permission from the
device if not yet granted. Once permission is active, the user points the camera at the
barcode on the real product. The system detects the barcode, pre-fills the barcode text
input with the decoded number, and immediately queries the product catalogue. If a matching
product is found, it is pre-selected in the form so the user can confirm price and quantity
without further typing.

**Why this priority**: This is the core of the feature. Speed of product lookup in-store is
the main goal. Barcode scanning on mobile is the primary flow that makes this feature
valuable and removes manual typing friction.

**Independent Test**: Can be tested by opening Purchase Mode on a mobile device, clicking
"Assign Product", granting camera permission, and pointing at a barcode — the product should
resolve and be pre-selected automatically.

**Acceptance Scenarios**:

1. **Given** the user is on a mobile device in Purchase Mode, **When** the user clicks
   "Assign Product" on a list item, **Then** the lookup modal opens with the **By Barcode**
   tab active by default, showing the camera preview above the barcode text input.

2. **Given** the lookup modal is open and camera permission has not been granted, **When**
   the system detects missing permission, **Then** the device's native permission prompt is
   displayed to the user before the camera preview starts.

3. **Given** camera permission is granted, **When** the modal opens the By Barcode tab,
   **Then** a live camera preview is shown within the tab for the user to aim at a barcode.

4. **Given** the camera is aimed at a valid product barcode, **When** the system recognises
   the barcode, **Then** the barcode number is extracted, pre-filled in the barcode text
   input, and a product lookup is triggered automatically without any user action.

5. **Given** a barcode has been successfully scanned, **When** a matching product is found in
   the catalogue, **Then** the product is pre-selected in the assignment form, ready for the
   user to enter price and confirm.

---

### User Story 2 - Fallback to Manual Input When Camera Permission Is Denied (Priority: P2)

A user in Purchase Mode opens the product lookup modal on a mobile device but has not
granted, or has denied, camera permission. Instead of an error state or a broken experience,
the modal defaults to the manual name/barcode text input, allowing the user to type a product
name or enter the barcode number by hand. The same product lookup logic runs as before this
feature. The user is shown a clear but unobtrusive explanation of why the camera view is not
available and how to enable it later.

**Why this priority**: Fallback coverage ensures the feature never degrades the existing
product lookup flow. Users who deny permission or are on environments where camera access
fails must still be able to assign products.

**Independent Test**: Can be tested by simulating denied camera permission (or revoking it),
opening the lookup modal, and verifying it lands on manual input with an explanatory message.

**Acceptance Scenarios**:

1. **Given** the user has denied camera permission, **When** the lookup modal opens on a
   mobile device, **Then** the camera preview is hidden and the By Barcode tab shows only
   the text input with a brief explanation message.

2. **Given** the modal is in the By Barcode tab with camera hidden due to denied permission,
   **When** the user views the modal, **Then** a brief, non-blocking message explains that
   camera access is unavailable and how to allow it.

3. **Given** the user is in the By Barcode tab with no camera, **When** they type a barcode
   number manually, **Then** the existing barcode product search works identically.

4. **Given** the user previously denied permission and then re-enables it at the device
   level, **When** they open the lookup modal again in the same session, **Then** the system
   re-checks permission status and shows the camera preview if permission is now granted.

---

### User Story 3 - Default to Manual Input on Desktop Devices (Priority: P3)

A user accessing the app on a desktop or laptop browser opens Purchase Mode and clicks
"Assign Product". Because the device is not a mobile/touch device, the product lookup modal
opens with the **By Name** tab active (desktop default). No camera permission request is
made and no camera preview is shown in the By Barcode tab either. The experience is
identical to the existing product lookup flow, preserving familiarity for desktop users.

**Why this priority**: Desktop users represent a secondary use case. Making manual input the
desktop default avoids unnecessary permission prompts and keeps the desktop experience clean
and undisturbed.

**Independent Test**: Can be tested on a desktop browser by opening the lookup modal and
confirming it opens with the By Name tab active and no camera UI visible.

**Acceptance Scenarios**:

1. **Given** the user is on a desktop device, **When** they click "Assign Product" in
   Purchase Mode, **Then** the lookup modal opens with the **By Name** tab active.

2. **Given** the modal is open on desktop, **When** the user views the modal,
   **Then** no camera preview or camera permission prompt is shown anywhere in the modal.

3. **Given** a desktop user is in the By Name or By Barcode tab, **When** they search by
   product name or type a barcode number, **Then** the product lookup works identically to
   the existing search behaviour.

---

### User Story 4 - Barcode Carries Over to Product Creation (Priority: P4)

A mobile user scans a barcode that does not match any product in the catalogue. The scanned
barcode number is pre-filled in the barcode text input so the user can verify it. The user
decides to create a new product. When they tap "Create New Product", the barcode number
already entered in the input is automatically carried into the barcode field of the product
creation form, so the user does not have to type it from scratch.

**Why this priority**: When a barcode scan yields no result, the most likely next action is
creation of a new product. Pre-filling the barcode eliminates redundant typing and reduces
error risk.

**Independent Test**: Scan a barcode that matches no product → confirm barcode pre-fills the
text input → click "Create New Product" → confirm barcode is pre-filled in the creation form.

**Acceptance Scenarios**:

1. **Given** a barcode scan yields no matching product, **When** the user views the By
   Barcode tab, **Then** an inline "No product found" message is shown and the barcode
   number IS pre-filled in the text input.

2. **Given** the scanned barcode is pre-filled in the text input, **When** the user clicks
   "Create New Product", **Then** the product creation form opens with the barcode field
   pre-populated with that value.

3. **Given** the user typed a barcode manually (without scanning), **When** they click
   "Create New Product", **Then** the product creation form opens with the barcode field
   pre-populated with whatever they typed.

---

### Edge Cases

- When the barcode is scanned but no product in the catalogue matches it, the barcode number IS pre-filled in the text input and an inline "No product found" message is shown. If the user clicks "Create New Product", the barcode carries over to the product creation form.
- When the camera loses access mid-session (e.g., another app takes over the camera), the camera preview is hidden and an inline error banner with a "Try again" button is shown. The barcode text input remains accessible so the user can type manually.
- When the camera preview loads very slowly or fails to start within the timeout window, the camera preview is hidden and an inline message is shown. The timeout is approximately 8 seconds.
- Barcode values are unique per product. A scanned barcode resolves to at most one product; multi-match disambiguation is not required.
- When the device reports as mobile but no accessible camera hardware is available, the camera preview is hidden in the By Barcode tab with an inline explanation; the text input remains functional.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: On a mobile device, the product lookup modal MUST open with the barcode scan
  view active by default when the user clicks "Assign Product" in Purchase Mode.

- **FR-002**: On a desktop device, the product lookup modal MUST open with manual text input
  active by default and MUST NOT show a camera preview or request camera permission.

- **FR-003**: When the scan view is opened on a mobile device without prior camera permission,
  the system MUST trigger the native device permission prompt before activating the camera preview.

- **FR-004**: If camera permission is denied, camera hardware is inaccessible, or the
  camera stream cannot be established for any reason, the modal MUST automatically fall
  back to the manual text input view. All such failure conditions are treated identically
  from the user's perspective.

- **FR-005**: When falling back to manual input due to denied camera permission, the modal
  MUST display a brief, non-blocking explanation of why the scan view is unavailable.

- **FR-006**: The scan view MUST display a live camera preview within the modal boundary
  for the user to aim at a product barcode.

- **FR-007**: When a valid barcode is detected by the camera, the system MUST automatically
  extract the barcode number and trigger a product lookup without requiring an additional
  user action.

- **FR-008**: If a product matching the scanned barcode is found in the catalogue, it MUST
  be pre-selected in the assignment form so the user can proceed directly to price and
  quantity confirmation.

- **FR-009**: If no product matches the scanned barcode, the system MUST display an inline
  "no match" message within the scan view and then automatically switch the modal to manual
  text input. The barcode number MUST NOT be pre-filled in the manual input field.

- **FR-010**: The modal MUST provide a visible control to switch between the scan view and
  the manual input view on mobile devices at any time during the lookup flow.

- **FR-011**: When the user switches from scan to manual input, the camera preview MUST
  stop to release the device camera resource.

- **FR-012**: The system MUST re-check camera permission status each time the lookup modal
  is opened, so that previously denied permission newly granted by the user at the device
  level is correctly reflected.

- **FR-013**: The manual input view MUST retain all existing product search behaviour
  (name-based close match and barcode number entry) unchanged from the prior feature.

- **FR-014**: Barcode decoding MUST be performed entirely client-side within the browser.
  No camera frames, snapshots, or image data MAY be transmitted to any server or
  third-party service at any point during the scanning process.

- **FR-015**: If the camera stream is interrupted mid-session (e.g., hardware access revoked
  by the OS or another application), the system MUST hide the camera preview and display an
  inline "Camera was interrupted" banner with a "Try again" button that restarts the camera
  preview. The barcode text input remains accessible below the banner.

- **FR-016**: Barcode values MUST be unique across all products in the catalogue. When a
  user creates a new product, the system MUST reject a barcode value that is already
  assigned to an existing product and notify the user of the conflict.

- **FR-017**: The camera MUST apply an initialisation timeout of approximately 8 seconds.
  If the camera stream has not started within that window, the camera preview MUST be
  hidden and an inline "camera unavailable" message MUST be shown.

- **FR-018**: When the user clicks "Create New Product" while the By Barcode tab is active
  and a barcode value is present in the text input, that barcode value MUST be
  pre-populated in the barcode field of the product creation form.

### Key Entities

- **Barcode**: A numeric identifier encoded in a physical barcode label on a real product.
  Serves as an exact match key to resolve exactly one product in the catalogue. Barcode
  values are unique across all products; the system enforces this at product creation. The
  Product entity already carries an optional `barcode` field (visible in the Create New
  Product form); no data model change is required by this feature. The lookup uses the same
  data source and mechanism as the existing name-based product search introduced in Feature 002.

- **Camera Permission State**: The current device-level permission status for camera access
  (granted, denied, or not yet requested). Determines whether the camera preview is shown
  within the By Barcode tab without persisting the value in app storage.

- **Lookup Mode** (simplified): The active tab within the product lookup modal — either
  **By Barcode** (default on mobile) or **By Name** (default on desktop). Switching tabs
  releases the camera if it was running.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: On a mobile device with camera permission granted, a user can identify and
  pre-select a product via barcode scan in under 5 seconds from opening the lookup modal.

- **SC-002**: The lookup modal correctly defaults to the By Barcode tab on mobile and to
  the By Name tab on desktop in 100% of cases, with no user configuration required.

- **SC-003**: When camera permission is denied, the camera preview is hidden and the text
  input is shown immediately with no error screen or broken state.

- **SC-004**: Barcode detection pre-fills the input and triggers a product lookup
  automatically — users complete product assignment without typing in at least 80% of
  mobile in-store sessions where barcodes are scannable.

- **SC-005**: Switching between By Name and By Barcode tabs takes under 1 second with no
  full-page reload.

## Assumptions

- Mobile device detection is based on touch capability and screen characteristics available
  in the browser; no server-side detection is required.
- The product catalogue already stores barcode numbers on product records via an existing
  optional `barcode` field on the Product entity. No data model change is required for this
  feature.
- Barcode types to support are standard retail linear barcodes (EAN-13, UPC-A as the most
  common); QR codes are out of scope for this feature.
- The app runs in a browser context where standard device camera APIs are accessible; no
  native app wrapper is assumed.
- Barcode decoding is performed entirely client-side in-browser. No camera frames or image
  data are transmitted to any external server or third-party service. This keeps the feature
  fully offline-capable and preserves user privacy.
- Only one barcode scan attempt is active at a time; the system does not process multiple
  simultaneous scans.
- Users are expected to be physically present in-store holding their mobile device; network
  latency for product lookup is assumed to be within normal ranges (under 2 seconds).
