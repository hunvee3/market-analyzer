# Feature Specification: Grocery List Manager

**Feature Branch**: `001-grocery-list-manager`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: Grocery List Manager

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Manage Grocery Lists (Priority: P1)

A user opens the app and is presented with a dashboard showing all their grocery lists.
Each list card displays the list name and its creation date. The user can search lists by
name using a search bar at the top of the page. From the dashboard, the user can delete any
list or initiate a purchase flow (which only logs for now). A prominent "Create New List"
button is always visible at the top.

**Why this priority**: This is the entry point of the application. Without a functional
dashboard, no other part of the feature is accessible. It delivers standalone value as a
read-only view even before create/edit flows exist.

**Independent Test**: Can be fully tested by seeding the system with pre-existing grocery lists
and verifying display order, real-time search filtering, and deletion (with confirmation) all
work correctly — without creating or editing any list.

**Acceptance Scenarios**:

1. **Given** the user has previously created grocery lists, **When** they open the app,
   **Then** all lists are shown sorted by last-saved date descending (most recently created
   or edited list first), each displaying the list name and creation date.

2. **Given** the dashboard is showing multiple lists, **When** the user types a partial name
   into the search bar, **Then** only lists whose names contain that text are shown, updating
   in real time as the user types.

3. **Given** a list is visible on the dashboard, **When** the user clicks the Delete button and
   confirms the prompt, **Then** the list is permanently removed and the dashboard updates
   immediately.

4. **Given** a list is visible on the dashboard, **When** the user clicks the Purchase button,
   **Then** the action is logged and no visible change occurs.

5. **Given** the user has no grocery lists, **When** they open the app, **Then** an empty
   state message is displayed alongside the "Create New List" button.

---

### User Story 2 - Create a New Grocery List (Priority: P2)

A user wants to build a new grocery list from scratch. They open a creation modal, give the
list a name, and add items one by one. Each item has a name, a unit of measure, and a category.
Categories can be picked from existing ones or created on the spot. As items are added they are
automatically grouped under their category section within the modal. When ready, the user saves
and is returned to the dashboard where the new list appears at the top.

**Why this priority**: Creating lists is the primary write action of this feature. Without it,
the dashboard has no user-generated data to display.

**Independent Test**: Can be tested end-to-end by creating a new list with items across multiple
categories and verifying it appears at the top of the dashboard after saving.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they click "Create New List",
   **Then** a modal form opens with an empty name field and an empty items section.

2. **Given** the creation modal is open, **When** the user adds an item with a name, unit, and
   an existing category, **Then** the item appears immediately grouped under that category's
   section inside the modal.

3. **Given** the creation modal is open, **When** the user types a new category name that does
   not yet exist while adding an item, **Then** the category is created on the fly, the item is
   placed under it, and the new category becomes available for all subsequent items.

4. **Given** the modal has a list name and at least one item, **When** the user clicks Save,
   **Then** the list is persisted, the modal closes, and the dashboard shows the new list at
   the top.

5. **Given** the creation modal has unsaved changes (a name entered or items added), **When**
   the user attempts to close the modal, **Then** a warning appears stating that unsaved changes
   will be lost, offering "Save and Exit" and "Exit Without Saving".

6. **Given** the unsaved-changes warning is shown, **When** the user selects "Save and Exit",
   **Then** the list is saved and the modal closes.

7. **Given** the unsaved-changes warning is shown, **When** the user selects "Exit Without Saving",
   **Then** the modal closes and no list is created.

---

### User Story 3 - Edit an Existing Grocery List (Priority: P3)

A user wants to update a list they previously created — renaming it, adding new items, editing
existing ones, or removing some. The edit modal opens pre-populated with the current list data,
with items already grouped by category. All the same item and category management capabilities
from creation are available. The same unsaved-changes safeguard applies on exit.

**Why this priority**: Editing is essential for maintaining lists over time but depends on the
creation flow (US2) being complete first.

**Independent Test**: Can be tested by opening an existing list in edit mode, modifying the name
and items, saving, and verifying all changes are reflected on the dashboard.

**Acceptance Scenarios**:

1. **Given** a grocery list exists on the dashboard, **When** the user clicks its Edit button,
   **Then** the edit modal opens pre-populated with the list's current name and all items grouped
   by category.

2. **Given** the edit modal is open, **When** the user renames the list, modifies an item,
   adds a new item, or removes an item, **Then** all changes are reflected live within the modal.

3. **Given** the edit modal has unsaved changes, **When** the user attempts to close the modal,
   **Then** the same unsaved-changes warning appears with identical options as in the creation flow.

4. **Given** the user clicks Save in the edit modal, **Then** all changes are persisted, the modal
   closes, and the dashboard reflects the updated list.

---

### Edge Cases

- What happens when the user tries to save a list with no name? The save action is blocked and
  the name field is highlighted as required.
- What happens when the user tries to save a list with no items? The save action is blocked and
  the items section is highlighted, indicating at least one item is required.
- What happens when the user tries to add an item with no name or no unit? The add-item action
  is blocked and the missing fields are highlighted.
- What happens if two lists share the same name? Duplicate names are permitted — lists are
  identified by their unique identity, not by name.
- What happens when the search bar yields no matches? An empty state message is shown in the
  results area without affecting the rest of the page.
- What happens when the user clears the search bar? The full unfiltered list is restored immediately.
- What happens if the user opens the unsaved-changes warning and dismisses it without choosing
  either option (e.g., clicks the backdrop)? The warning closes and the modal remains open —
  no data is lost.
- What happens when a save operation fails (network error, server unavailable)? The modal stays
  open preserving all unsaved work, and a snackbar error notification is displayed. The user
  can retry the save or exit via the unsaved-changes warning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all grocery lists on the dashboard sorted by last-saved date
  descending (`updatedAt` descending — most recently created or edited list first).
- **FR-002**: Each grocery list card MUST display the list name and its creation date.
- **FR-003**: Dashboard MUST include a real-time search bar that filters the list by name as
  the user types.
- **FR-004**: Dashboard MUST include a "Create New List" button permanently visible at the top
  of the page.
- **FR-005**: Each grocery list card MUST include three action buttons: Purchase, Edit, and Delete.
- **FR-006**: The Purchase button MUST log the action; no other behavior is required at this stage.
- **FR-007**: The Delete button MUST prompt the user for confirmation before permanently removing
  the list.
- **FR-008**: System MUST open a full-screen modal form when the user initiates list creation or
  editing. The full-screen layout applies on all viewport sizes, not just mobile.
- **FR-009**: The modal form MUST include a list name text field.
- **FR-010**: The modal form MUST allow users to add, edit, and remove items within the list.
  Adding and editing an item MUST open a focused **dialog** (layered above the list modal) exposing
  all three item fields (name, unit, category); changes are confirmed before the dialog closes and
  the item appears in the list.
- **FR-011**: Each item MUST have exactly three fields: name, unit of measure, and category.
- **FR-012**: Items MUST be grouped and displayed under their assigned category section within
  the modal in real time as they are added. Each category section MUST be collapsible —
  clicking the category header toggles the items list; all sections are expanded by default.
  Items within the same category section MUST be visually separated from one another.
- **FR-013**: System MUST allow category selection from previously created categories when adding
  or editing an item.
- **FR-014**: System MUST allow users to create a new category on the fly during item add or edit,
  making it immediately available for the current and all future items. Before creating,
  the system MUST check for an existing category using a case-insensitive, whitespace-trimmed
  match; if a match is found the existing category MUST be reused, no duplicate created.
- **FR-015**: System MUST block saving a list if the list name field is empty or if the list
  contains zero items; both conditions MUST be indicated to the user with field-level feedback.
- **FR-016**: System MUST block adding an item if either the item name or unit field is empty.
  The Confirm button in the item dialog MUST be enabled as soon as a category name is typed
  (even if not yet confirmed via Enter or dropdown selection) — the category is resolved to an
  existing or newly created record when Confirm is clicked, not when the field loses focus.
- **FR-016a**: The item dialog MUST be keyboard-navigable: all fields reachable via Tab,
  pressing Enter submits the form (equivalent to clicking Confirm).
- **FR-017**: On save, the system MUST persist the list, close the modal, and return the user
  to the dashboard.
- **FR-018**: The dashboard MUST place the newly created or most recently updated list at the
  top of the list after saving.
- **FR-019**: System MUST show an unsaved-changes warning when the user attempts to close the
  modal while there are pending unsaved changes.
- **FR-020**: The unsaved-changes warning MUST present exactly two options: "Save and Exit" and
  "Exit Without Saving".
- **FR-021**: The edit modal MUST open pre-populated with the target list's existing name and
  all its items, grouped by category.
- **FR-022**: When a save operation fails due to a network or server error, the modal MUST
  remain open (preserving the user's unsaved work) and a snackbar notification MUST be shown
  describing the failure.
- **FR-023**: Field-level validation errors (empty name, no items, empty item fields) MUST be
  displayed inline on the form, directly adjacent to the offending field or section.
  Snackbars MUST NOT be used for validation errors.

### Key Entities

- **GroceryList**: A named collection of items for a shopping trip. Key attributes: name,
  creation date (`createdAt`), last-saved date (`updatedAt`, used for sort order), ordered
  list of items. Belongs to a user.
- **GroceryItem**: A single product entry within a list. Key attributes: name, unit of measure,
  category, insertion order. Items are displayed in the order they were added within their
  category section. Belongs to exactly one GroceryList.
- **Category**: A named grouping label for items (e.g., "Dairy", "Produce"). Shared across
  all lists for the same user. Can be created at any point during item management.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete grocery list with five or more items across at least
  two categories in under 3 minutes.
- **SC-002**: The search bar filters the displayed list within 300 milliseconds of the user
  pausing typing, with no full-page reload.
- **SC-003**: Every item addition is reflected under the correct category section immediately,
  with no manual refresh required — 100% of additions must be instant.
- **SC-004**: The unsaved-changes warning appears in 100% of modal-close attempts when the user
  has entered a name or added at least one item without saving.
- **SC-005**: The dashboard always reflects the most recently saved list in position one without
  requiring a manual page refresh.
- **SC-006**: Users can complete the full create → save → view cycle without encountering any
  error state under normal operating conditions.

## Assumptions

- The user is assumed to already be authenticated. User authentication is a separate feature
  and is out of scope here.
- The "unit" field is free-text (e.g., "kg", "L", "units", "bags") and is not restricted to
  a predefined enumeration for this feature.
- Item quantity is not part of the data model in this feature. Items represent what to buy;
  the unit field provides measure context.
- Categories are scoped to the authenticated user and are shared across all their lists.
  A category created in one list is available in all subsequent lists.
- The Purchase button's placeholder behavior (logging only) is intentional and will be replaced
  in a dedicated purchase feature.
- Lists are private to the authenticated user. Sharing or collaboration is out of scope.
- The list modal renders as a full-screen overlay on all viewport sizes (not just mobile).
  The item add/edit dialog is a standard centered dialog layered above the list modal.
- No pagination is applied to the dashboard list for v1. If performance requires it, that will
  be addressed as a separate concern.

## Clarifications

### Session 2026-03-27

- Q: Should saving be blocked when the list has zero items, or should an empty list be a valid placeholder? → A: Block save if list has zero items — saving requires name + at least one item.
- Q: How should item editing work inside the list modal — inline, sub-form/dialog, or a dedicated edit row? → A: Edit opens a sub-form within the modal, exposing all three fields (name, unit, category) for modification before confirming back to the list.
- Q: What should happen when a save operation fails (network/server error)? → A: Modal stays open preserving work; snackbar shown for API/network errors. Field validation errors are displayed inline on the form, not via snackbar.
- Q: In what order are items displayed within a category section? → A: Insertion order — items appear in the order they were added; no reordering supported in this feature.
- Q: How should the system match category names when the user types a new category on the fly? → A: Case-insensitive, whitespace-trimmed exact match — "dairy" and " Dairy " both resolve to "Dairy"; no duplicate is created.
- Q: Should the item sub-form be inline inside the list modal or open in a separate dialog? → A: Separate dialog — clicking "+ Add item" or the edit icon opens a focused Headless UI Dialog above the list modal. The dialog closes when the item is confirmed or cancelled.
- Q: Should the list modal be full-screen only on mobile or on all viewports? → A: Always full-screen on all viewports.
- Q: Should category sections be collapsible in the list view? → A: Yes — clicking the category header collapses/expands the items. All categories start expanded. A chevron icon and item count are shown in the header.
- Q: When should the Confirm button be enabled in the item dialog — only when a category is selected from the dropdown, or also when text is typed? → A: Also when text is typed. Typed text is resolved to a category (create-or-reuse) when Confirm is clicked, not on blur.
