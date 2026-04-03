# Feature Specification: Purchase Mode

**Feature Branch**: `002-purchase-mode`
**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: Purchase Mode — register real purchases based on grocery lists
**Depends on**: `001-grocery-list-manager` (GroceryList, GroceryItem, Category entities)
**⚠ Data Model Impact on 001**: This feature requires adding a numeric `amount` field and
changing the `unit` field from free-text to a select with predefined units on `GroceryItem`.
See Clarifications Session 2026-04-02 — Clarification Round, question 1.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Enter Purchase Mode and Select a Market (Priority: P1)

A user opens the app and clicks the Purchase button on a grocery list card. The system
presents a market selection panel where the user can search for an existing market by name
or register a new one. Once the user selects a market, Purchase Mode activates and the
user sees the list items divided by category — identical to the grocery list layout — ready
for product assignment.

**Why this priority**: This is the entry point of the purchase flow. Without market selection
and Purchase Mode activation, no product assignment or purchase tracking is possible.

**Independent Test**: Can be tested by seeding the system with a grocery list and existing
markets, then verifying the market selection panel appears on Purchase button click, market
search filters correctly, selection activates Purchase Mode, and the purchase list displays
items grouped by category.

**Acceptance Scenarios**:

1. **Given** a grocery list exists on the dashboard, **When** the user clicks the Purchase
   button on that list, **Then** the system enters Purchase Mode and presents a market
   selection panel.

2. **Given** the market selection panel is open, **When** the user types a partial market
   name into the search field, **Then** matching markets are shown in real time as the user
   types.

3. **Given** matching markets are shown, **When** the user selects a market from the results,
   **Then** Purchase Mode activates with the selected market and the user is presented with
   the grocery list items grouped by category.

4. **Given** the market selection panel is open and no matching markets are found, **When**
   the user sees no results, **Then** the option to create a new market is clearly available.

5. **Given** Purchase Mode is active, **When** the user views the purchase list, **Then**
   each item displays its name, unit, and category — identical to the grocery list layout —
   along with an "Assign Product" action button.

---

### User Story 2 - Assign Products to Grocery List Items (Priority: P2)

While in Purchase Mode, the user assigns real products to grocery list items. For each item,
the user can search for a product by name (close match) or barcode (exact match). Upon
selecting a product, the user specifies the quantity of units to buy (prefilled from the
grocery list item) and the unit price at the current market on the current day. If the
product has been previously purchased, the system shows the last known price, the date of
that price, and the market it came from — enabling the user to evaluate whether the current
price is convenient. A disclaimer is shown (hidable) noting this historical data is
informative only and may be inaccurate. After confirming, the product is added to the
purchase and the purchase list updates with the product name, unit price, and running total
cost.

**Why this priority**: Assigning products with prices is the core value proposition of the
purchase flow. Without it, Purchase Mode has no purpose.

**Independent Test**: Can be tested by activating Purchase Mode on a seeded grocery list
with a selected market, assigning products to items, and verifying the quantity prefill,
price entry, historical price display, and total cost calculation all work correctly.

**Acceptance Scenarios**:

1. **Given** Purchase Mode is active, **When** the user clicks "Assign Product" on a grocery
   list item, **Then** a product lookup form is displayed allowing search by name or barcode.

2. **Given** the product lookup form is open, **When** the user searches by product name,
   **Then** closely matching products are shown using a fuzzy/close match strategy.

3. **Given** the product lookup form is open, **When** the user searches by barcode, **Then**
   an exact match is used and only the matching product (if any) is shown.

4. **Given** the user selects a product from the lookup results, **Then** the system presents
   a form with the quantity prefilled from the grocery list item's `amount` field, the unit
   prefilled from the grocery list item's `unit` field (as a select with predefined options),
   and an empty unit price field for the user to complete.

5. **Given** the user selects an existing product that has been previously purchased, **Then**
   the system displays the last recorded price for that product, the date of that price, and
   the market where it was recorded, alongside a hidable disclaimer stating this information
   is informative only and may be subject to error.

6. **Given** the user has filled in quantity and unit price, **When** the user confirms the
   assignment, **Then** the product is added to the purchase, the purchase list updates to
   show the assigned product with its unit price, and the running total cost is recalculated
   and displayed.

7. **Given** a product is already assigned to a grocery list item, **When** the user views
   that item in the purchase list, **Then** the item displays the assigned product name, unit
   price, and an action to modify the assignment.

---

### User Story 3 - Create a New Market (Priority: P3)

When searching for a market and unable to find the right one, the user can create a new
market. The system presents a form for name and address. As the user types the market name,
the system shows closely matching existing markets to help avoid duplicates. When the user
provides an address, the system checks for address matches against existing markets; if a
match is found, the matching market is automatically loaded to prevent duplicate creation.
Markets are shared across all users.

**Why this priority**: Market creation supports the Purchase Mode entry flow (US1) and is
only needed when the desired market does not yet exist in the system.

**Independent Test**: Can be tested by creating a new market and verifying name-based
suggestions appear, address duplicate detection works, and the newly created market becomes
available for selection. Also verifiable by checking that other users can see the created
market.

**Acceptance Scenarios**:

1. **Given** the user is on the market selection panel and cannot find the desired market,
   **When** the user clicks "Create New Market", **Then** a form is presented with fields
   for name and structured address (street, city, state/province, zip/postal code).

2. **Given** the market creation form is open, **When** the user types a market name, **Then**
   the system displays a list of closely matching existing markets that the user can select
   instead of creating a duplicate.

3. **Given** the user selects a suggested market from the name match list, **Then** market
   creation is cancelled and the selected market is used directly.

4. **Given** the user fills in both name and structured address fields, **When** the system
   detects that the provided address matches an existing market's address, **Then** the
   matching market is automatically loaded and presented to the user, preventing duplicate
   creation.

5. **Given** the user fills in name and address with no duplicate detected, **When** the user
   confirms market creation, **Then** the new market is persisted and immediately available
   for selection by all users.

6. **Given** a market has been created by any user, **When** another user searches for markets,
   **Then** the created market appears in the search results.

---

### User Story 4 - Product Lookup and Creation (Priority: P3)

When assigning a product to a grocery list item, the user searches existing products by name
(close match) or barcode (exact match). If no suitable product exists, the user can create
a new one by providing a name and barcode. The system validates for duplicate products before
allowing creation. Products are shared across all users.

**Why this priority**: Product creation supports the product assignment flow (US2) and is
only needed when the desired product does not exist in the system.

**Independent Test**: Can be tested by searching for products with name and barcode strategies,
creating a new product, verifying duplicate validation blocks copies, and confirming other
users can see the created product.

**Acceptance Scenarios**:

1. **Given** the product lookup form is open, **When** the user searches by product name,
   **Then** a close match strategy is used and multiple potential matches are displayed.

2. **Given** the product lookup form is open, **When** the user searches by barcode, **Then**
   an exact match strategy is used and only the precisely matching product (if any) is shown.

3. **Given** the lookup returns no results or the user considers the suggestions unhelpful,
   **When** the user chooses to add a new product, **Then** a product creation form is
   displayed where the user enters the product name first.

4. **Given** the product creation form is open and the user has entered a name, **When** the
   system suggests closely matching existing products, **Then** the user can select a
   suggestion to cancel creation and use that product directly.

5. **Given** no suggestion was selected after entering the name, **When** the user enters a
   barcode that matches an existing product, **Then** creation is blocked and the matched
   product is used.

6. **Given** no suggestion was selected and the barcode does not match any existing product,
   **When** the user confirms product creation, **Then** the product is persisted and
   immediately available for assignment to the current grocery list item and for all future
   lookups by any user.

---

### User Story 5 - Complete or Cancel a Purchase (Priority: P2)

Once the user finishes assigning products and prices, they can save the purchase. The saved
purchase is stored for later display (a separate feature). If the user does not want to
finish the purchase, they can exit Purchase Mode, but the system warns them that unsaved
changes will be lost and requires confirmation before discarding.

**Why this priority**: Without the ability to save or cancel, the purchase flow has no
conclusion. Depends on US1 and US2 being functional.

**Independent Test**: Can be tested by completing a purchase (assigning at least one product)
and verifying the save persists the data, as well as by attempting to exit with unsaved
changes and verifying the confirmation dialog works correctly.

**Acceptance Scenarios**:

1. **Given** Purchase Mode is active and at least one product has been assigned, **When** the
   user clicks Save Purchase, **Then** the purchase is stored with all assigned products,
   quantities, and unit prices, and the user exits Purchase Mode.

2. **Given** Purchase Mode is active, **When** the user views the purchase list, **Then**
   the current total cost of all assigned items is displayed and updates in real time as
   products are assigned or modified.

3. **Given** Purchase Mode is active with unsaved changes, **When** the user attempts to exit
   Purchase Mode, **Then** a confirmation dialog appears warning that changes will be lost.

4. **Given** the exit confirmation dialog is shown, **When** the user confirms they want to
   exit, **Then** Purchase Mode is closed and no purchase data is saved.

5. **Given** the exit confirmation dialog is shown, **When** the user cancels the exit action,
   **Then** the dialog closes and the user remains in Purchase Mode with all data intact.

6. **Given** Purchase Mode is active but no products have been assigned, **When** the user
   attempts to exit, **Then** Purchase Mode closes immediately without a confirmation dialog
   (no changes to lose).

---

### User Story 6 - Edit Product Assignment in a Purchase (Priority: P3)

While in Purchase Mode, the user can modify the product assigned to any grocery list item
at any time. This allows correcting mistakes or changing to a different product. The purchase
totals update immediately after modification.

**Why this priority**: Editing complements the assignment flow (US2) and is required for a
complete purchase experience, but can be built after the core assignment flow exists.

**Independent Test**: Can be tested by assigning a product, then modifying the assignment
to a different product, and verifying the purchase item and total cost update correctly.

**Acceptance Scenarios**:

1. **Given** a grocery list item has an assigned product in Purchase Mode, **When** the user
   clicks the modify action on that item, **Then** the product lookup form opens with the
   current assignment displayed.

2. **Given** the user selects a different product from the lookup, **When** the user confirms
   the new assignment with updated quantity and price, **Then** the purchase item is updated
   and the total cost is recalculated.

3. **Given** the user modifies a product assignment, **When** the user views the purchase
   list, **Then** the modified item reflects the new product, quantity, unit price, and the
   total cost is correct.

---

### Edge Cases

- What happens when the user tries to save a purchase with no products assigned? The save
  action is blocked and the user is informed that at least one product must be assigned.
- What happens when the user enters a negative or zero unit price? The system blocks the entry
  and shows a field-level validation error requiring a positive price value.
- What happens when the user enters a negative or zero quantity? The system blocks the entry
  and shows a field-level validation error requiring a positive quantity value.
- What happens when the user creates a product with an empty name or empty barcode? Product
  creation is blocked and the missing fields are highlighted as required.
- What happens when the user creates a market with an empty name or empty address fields?
  Market creation is blocked and the missing fields are highlighted as required.
- What happens when the product lookup returns no results for either name or barcode? An
  empty state message is shown alongside the option to create a new product.
- What happens when the market search returns no results? An empty state message is shown
  alongside the option to create a new market.
- What happens if the user navigates away from the app while in Purchase Mode? The browser's
  beforeunload event should warn that unsaved purchase data will be lost.
- What happens when a save operation fails (network error, server unavailable)? The purchase
  view stays open preserving all unsaved work, and a snackbar error notification is displayed.
  The user can retry the save.
- What happens when the last price information for a product is unavailable (first-time
  purchase of that product)? The historical price section is simply not displayed for that
  product; no error or placeholder is shown.
- What happens when the user dismisses the exit confirmation dialog without choosing an option
  (e.g., clicks the backdrop)? The dialog closes and the user remains in Purchase Mode — no
  data is lost.
- What happens when the address duplicate detection finds a market match during creation? The
  matched market is loaded automatically and the user is informed, preventing the duplicate.

## Requirements _(mandatory)_

### Functional Requirements

#### Purchase Mode Activation

- **FR-001**: The Purchase button on each grocery list card MUST initiate Purchase Mode for
  that grocery list.
- **FR-002**: Upon clicking Purchase, the system MUST display a market selection panel before
  activating Purchase Mode.
- **FR-003**: The market selection panel MUST allow the user to search existing markets by name
  in real time.
- **FR-004**: The market selection panel MUST provide an option to create a new market when the
  desired one is not found.
- **FR-005**: Upon selecting a market, the system MUST activate Purchase Mode and display the
  grocery list items grouped by category, matching the grocery list layout.

#### Market Creation

- **FR-006**: The market creation form MUST include a name field and structured address fields
  (street, city, state/province, zip/postal code), all required.
- **FR-007**: As the user types a market name, the system MUST display a list of closely
  matching existing markets to help avoid duplicates.
- **FR-008**: If the user selects a suggested market from the name match list, market creation
  MUST be cancelled and the selected market used directly.
- **FR-009**: When the user provides structured address fields, the system MUST compare
  the address against existing market addresses and, if a match is found, automatically load
  the matching market to prevent duplicate creation.
- **FR-010**: Markets MUST be shared across all users — a market created by one user is visible
  and selectable by all other users.
- **FR-011**: Market creation MUST be blocked if name or any address field is empty; all
  required fields MUST show field-level validation errors.

#### Product Assignment

- **FR-012**: Each grocery list item in Purchase Mode MUST display an "Assign Product" action
  when no product is assigned, and a "Modify" action when a product is already assigned.
- **FR-013**: Clicking "Assign Product" or "Modify" MUST open a product lookup form.
- **FR-014**: The product lookup form MUST allow searching by product name using a close match
  (fuzzy) strategy.
- **FR-015**: The product lookup form MUST allow searching by barcode using an exact match
  strategy.
- **FR-016**: Upon selecting a product, the system MUST present a form with quantity (amount)
  prefilled from the grocery list item's `amount` field, the unit prefilled from the grocery
  list item's `unit` field and **displayed as a read-only label** next to the quantity field,
  and an empty unit price field. The unit field is a select with predefined options
  (kg, g, L, mL, units).
- **FR-017**: When the selected product has previous purchase history, the system MUST display
  the last recorded price, the date of that price, and the market where it was recorded.
- **FR-018**: The historical price information MUST include a disclaimer accessed via a
  question-mark icon toggle (hidden by default). Clicking the icon shows the disclaimer
  stating that the data is informative only and may be subject to user error, with no binding
  meaning. Clicking again hides it. The toggle state is not persisted — it resets each time
  the product assignment view is opened.
- **FR-019**: The system MUST block product assignment if quantity is zero or negative, or if
  unit price is zero or negative; field-level validation errors MUST be shown. Prices MUST
  be displayed in Argentine Peso format: `$` symbol, 2 decimal places, dot separator
  (e.g., `$1250.00`).
- **FR-020**: Upon confirming a product assignment, the purchase list MUST update to show the
  assigned product name, unit price (in `$0.00` format), and quantity for that item.

#### Product Lookup and Creation

- **FR-021**: When product lookup returns no results or the user considers suggestions unhelpful,
  the system MUST provide an option to create a new product.
- **FR-022**: The product creation form MUST follow a sequential two-step flow: the user enters
  the product **name first**. The system suggests closely matching existing products based on
  the name. If the user selects a suggestion, creation is cancelled and that product is used
  directly. If no suggestion is selected, the user proceeds to enter the **barcode**.
- **FR-023**: When the user enters a barcode during product creation, the system MUST check for
  an exact barcode match against existing products. If a match is found, creation is blocked
  and the matched product is used. If no match is found, creation proceeds with the provided
  name and barcode. Both name and barcode are required.
- **FR-024**: Products MUST be shared across all users — a product created by one user is
  visible and available in lookups for all other users.
- **FR-025**: Product creation MUST be blocked if name or barcode is empty; both fields MUST
  show field-level validation errors.
- **FR-025a**: Purchase Mode MUST render as a full-screen view (fixed inset-0, all viewport
  sizes) — same layout pattern as the GroceryListModal from feature 001.
- **FR-025b**: The market selection panel MUST be a dialog/modal shown on top of the dashboard
  when the user clicks Purchase, before the full-screen Purchase Mode view opens.
- **FR-025c**: The product lookup and assignment form (product search, quantity/price entry)
  MUST be a dialog layered above the full-screen Purchase Mode view. When the user chooses
  to create a new product, the product creation form MUST open in a **separate modal**
  layered above the product assignment dialog — it MUST NOT render inline within the
  assignment dialog.
- **FR-025d**: Once a market is selected for a purchase, the market selection MUST NOT be
  editable. If the user made a mistake, they must discard the purchase and start a new one.

#### Purchase Totals and Display

- **FR-026**: The purchase list MUST display the running total cost of all assigned products
  at all times during Purchase Mode.
- **FR-027**: The total cost MUST update in real time whenever a product is assigned, modified,
  or removed.
- **FR-028**: Each assigned item in the purchase list MUST display: the assigned product name,
  the purchase quantity and list quantity in a comparative format (e.g., "3 units out of
  6 units"), the unit price, and the line total. The display MUST NOT use math symbols
  (×, =). All monetary values MUST use Argentine Peso format (`$0.00`). The card layout
  MUST use a multi-row structure with clear visual separation: the grocery item name and
  action button on the top row, the product name on a second row, and quantity/price
  information on a third row with adequate spacing between sections.

#### Completing and Canceling a Purchase

- **FR-029**: The system MUST provide a Save Purchase action that stores the purchase with all
  assigned products, quantities, units, unit prices, the selected market, and the purchase
  date (auto-set to the current day, not user-editable).
- **FR-030**: Saving a purchase MUST be blocked if no products have been assigned; the user
  MUST be informed that at least one product assignment is required.
- **FR-031**: After saving, the system MUST exit Purchase Mode and return the user to the
  dashboard.
- **FR-032**: The system MUST provide an option to exit Purchase Mode without saving.
- **FR-033**: If the user attempts to exit with unsaved changes (at least one product assigned),
  a confirmation dialog MUST appear warning that changes will be lost.
- **FR-034**: The exit confirmation dialog MUST present options to confirm exit (discard changes)
  or cancel (remain in Purchase Mode).
- **FR-035**: If no products have been assigned, exiting Purchase Mode MUST NOT show a
  confirmation dialog.
- **FR-036**: When a save operation fails, the purchase view MUST remain open preserving all
  unsaved work, and a snackbar error notification MUST be displayed.

#### Purchase Save Validation

- **FR-039**: Before saving a purchase, the system MUST check for mismatches between the
  grocery list and the purchase: (a) items without an assigned product, and (b) items where
  the purchase quantity differs from the grocery list quantity.
- **FR-040**: If mismatches are detected, the system MUST display a mismatch warning dialog
  listing missing assignments and quantity discrepancies, with options to "Go Back" (cancel
  save) or "Save Anyway" (proceed with save).
- **FR-041**: If no mismatches are detected, the system MUST display a confirmation dialog
  stating that the purchase cannot be edited after saving, with options to "Cancel" or
  "Save".

#### Product Assignment Editing

- **FR-037**: While in Purchase Mode, the user MUST be able to modify the product assigned to
  any item at any time by opening the product lookup form for that item.
- **FR-038**: Upon modifying a product assignment, the purchase totals MUST update immediately.

### Key Entities

- **Purchase**: A record of buying products from a grocery list at a specific market on a
  specific date. Contains a reference to the grocery list, the selected market, the purchase
  date, and a collection of purchase items. Belongs to a user.
- **PurchaseItem**: Links a grocery list item to a real product with a specified quantity and
  unit price. Belongs to exactly one Purchase.
- **Market**: A store or supermarket where purchases are made. Has a name and address. Shared
  across all users.
- **Product**: A real product that can be purchased. Has a name and barcode. Shared across all
  users.
- **ProductPriceRecord**: A historical record of a product's unit price at a specific market
  on a specific date. Used to display last known price information during product assignment.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The exit confirmation dialog appears in 100% of exit attempts when at least one
  product has been assigned without saving.
- **SC-002**: Historical price information is displayed correctly for 100% of products that
  have prior purchase records.
- **SC-003**: Market creation with duplicate address detection prevents 100% of address-based
  duplicate markets.
- **SC-004**: Product creation with duplicate validation prevents 100% of duplicate products
  (by name or barcode).

## Assumptions

- The user is assumed to already be authenticated. User authentication is a separate feature.
- The `001-grocery-list-manager` feature is complete and functional. Purchase Mode relies on
  existing GroceryList, GroceryItem, and Category entities.
- The "quantity" for a purchase item refers to the number of units purchased. It is prefilled
  from the grocery list item's `amount` field. The `unit` is a select field with predefined
  options (kg, g, L, mL, units), shared between grocery items and purchase items.
- The unit price is the price per single unit of the product at the market on the day of
  purchase. All monetary values use Argentine Peso ($) with 2 decimal places (e.g., $1250.00).
- The total cost is calculated as the sum of (quantity × unit price) for all assigned items.
- Product barcodes are expected to be standard numeric barcodes (EAN-13, UPC-A, etc.) but are
  stored as free-text strings — no format validation beyond non-empty is required for v1.
- Markets and products are global shared resources. Any user can create them, and they are
  immediately visible to all users.
- The display of finished/saved purchases (purchase history, comparison, analytics) is out of
  scope for this feature. Only the purchase creation flow is covered here.
- The "close match" strategy for product name and market name search is implementation-defined
  (could be substring, Levenshtein distance, trigram, etc.) — the spec requires only that it
  is not an exact match.
- Address matching for market duplicate detection uses structured address fields (street,
  city, state/province, zip/postal code). The matching strategy is implementation-defined
  (could be normalized field comparison, partial matching, etc.) — the spec requires that
  obvious duplicates are caught.
- The map-based market duplicate prevention mentioned by the user is explicitly out of scope
  for this feature.
- Purchase Mode operates on a single grocery list at a time. Multi-list purchases are out of
  scope.
- A purchase is always associated with exactly one market. Split-market purchases are out of
  scope.
- Product price records are created automatically when a purchase is saved — no manual price
  entry outside of the purchase flow is supported.
- The purchase date is auto-set to the current day and is not user-editable.
- Once a market is selected for a purchase, it cannot be changed. The user must discard and
  start a new purchase to select a different market.
- A grocery list can be reused across multiple purchases (different markets, different days).
- The same product can be assigned to multiple grocery list items within a single purchase.
- The grocery list is not modified during the purchase flow. The purchase is a separate entity
  that references the grocery list.

## Clarifications

### Session 2026-04-02 — Initial

- Q: Can a user partially complete a purchase (save with some items unassigned)? → A: No — a
  purchase requires at least one product assignment to be saved, but it does NOT require all
  grocery list items to have products assigned. Partial purchases (some items assigned, some
  not) are valid.
- Q: What happens to the purchase data if the grocery list is later deleted? → A: Out of scope
  for this feature. The purchase stores its own snapshot of the relevant data. Referential
  integrity rules will be defined when purchase history display is specified.
- Q: Is the barcode field required when creating a new product? → A: Yes, both name and barcode
  are required for product creation as specified by the user.
- Q: Should the quantity field accept decimal values? → A: Yes — to support fractional units
  (e.g., 1.5 kg, 0.25 L). The field should accept positive decimal numbers.
- Q: How is the "last price" for a product determined? → A: It is the most recent
  ProductPriceRecord for that product across all markets. The date, price, and market are all
  displayed so the user has full context.
- Q: Can the user remove a product assignment from a purchase item (unassign)? → A: Yes, the
  user can unassign a product from an item. The item reverts to its unassigned state with the
  "Assign Product" action available again.
- Q: When creating a market, if the address matches an existing market but the name differs,
  what happens? → A: The system automatically loads the existing market (matched by address),
  regardless of the name the user typed. The user can then decide to use that market or try
  a different address.

### Session 2026-04-02 — Clarification Round

- Q: Quantity prefill source — `GroceryItem` has no numeric quantity. What should be prefilled?
  → A: Both grocery list items and purchase items must have a numeric `amount` field and a `unit`
  field as a select with predefined units (kg, L, g, mL, etc.) plus a generic "units" option.
  The purchase quantity is prefilled from the grocery list item's `amount`. **⚠ DATA MODEL
  IMPACT**: This changes the existing `GroceryItem` model from feature 001 — the free-text
  `unit` field is replaced by a numeric `amount` + select-based `unit` with predefined options.

- Q: Should Purchase Mode be a full-screen view or something else?
  → A: Full-screen view — same pattern as the GroceryListModal (fixed inset-0, all viewports).

- Q: Is the market selection panel a dialog, full-screen view, or a step within Purchase Mode?
  → A: Dialog/modal. Shown on top of the dashboard when the user clicks Purchase, before
  entering the full-screen Purchase Mode view.

- Q: Should the product lookup + quantity/price entry be a dialog layered above Purchase Mode?
  → A: Yes — a dialog, following the same pattern as ItemSubForm in feature 001.

- Q: Is the market address a single free-text field or structured?
  → A: Structured fields (street, city, zip, etc.).

- Q: Is this a single-currency system? What currency and format?
  → A: Currency is Argentine Peso. Symbol is `$`. Format uses 2 decimal places separated by a
  dot (e.g., `$1250.00`). Currency is global — not stored per-record.

- Q: Product duplicate validation — does matching name OR barcode block creation, or must both
  match?
  → A: Sequential flow: the user enters the product **name first**. The system suggests similar
  existing products. If the user selects one, creation is cancelled and that product is used.
  If no suggestion is selected, the user continues to input the **barcode**. If the barcode
  matches an existing product, creation is blocked and that product is used. If no barcode
  matches, creation proceeds. Duplicate check is NOT a simultaneous OR/AND — it is a two-step
  sequential process.

- Q: Can the user make multiple purchases from the same grocery list?
  → A: Yes — a grocery list can be reused across multiple purchases.

- Q: Is the purchase date auto-set to today, or can the user select it?
  → A: Auto-set to today. Not user-editable.

- Q: Historical price disclaimer — how does the hide behavior work?
  → A: A question-mark icon toggle. Hidden by default. The user clicks the icon to show the
  disclaimer, clicks again to hide. No persistence — resets on every product assignment view.

- Q: Can the user change the market after Purchase Mode is active?
  → A: No. Once a market is selected, it is not editable. If the user made a mistake, they must
  discard the purchase and start a new one.

- Q: Can the same product be assigned to multiple grocery list items in the same purchase?
  → A: Yes — the same product can be assigned to different grocery list items.
