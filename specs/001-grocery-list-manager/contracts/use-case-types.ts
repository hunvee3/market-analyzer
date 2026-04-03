/**
 * SHARED INPUT/OUTPUT TYPES
 *
 * Canonical types used across use-case signatures and port contracts.
 * These live at the application layer boundary — no framework or
 * infrastructure imports permitted here.
 */

// ---------------------------------------------------------------------------
// Shared item input used when creating or updating a list
// ---------------------------------------------------------------------------

export interface NewItemInput {
  name: string;       // non-empty after trim
  unit: string;       // non-empty after trim
  categoryId: string; // must reference an existing Category.id
}

// ---------------------------------------------------------------------------
// Use Case: GetAllGroceryLists
// ---------------------------------------------------------------------------

// Input: none
// Output: GroceryList[] sorted by updatedAt descending

// ---------------------------------------------------------------------------
// Use Case: CreateGroceryList
// ---------------------------------------------------------------------------

export interface CreateGroceryListInput {
  name: string;          // non-empty after trim
  items: NewItemInput[]; // minimum 1 item
}

// Output: GroceryList (newly created, with generated id + timestamps)

// ---------------------------------------------------------------------------
// Use Case: UpdateGroceryList
// ---------------------------------------------------------------------------

export interface UpdateGroceryListInput {
  id: string;
  name: string;          // non-empty after trim
  items: NewItemInput[]; // minimum 1 item; replaces all existing items
}

// Output: GroceryList (updated, with new updatedAt)

// ---------------------------------------------------------------------------
// Use Case: DeleteGroceryList
// ---------------------------------------------------------------------------

export interface DeleteGroceryListInput {
  id: string;
}

// Output: void

// ---------------------------------------------------------------------------
// Use Case: GetAllCategories
// ---------------------------------------------------------------------------

// Input: none
// Output: Category[]

// ---------------------------------------------------------------------------
// Use Case: CreateOrReuseCategory
// ---------------------------------------------------------------------------

export interface CreateOrReuseCategoryInput {
  name: string; // raw user input — will be trimmed and normalized internally
}

// Output: Category (existing if normalizedName matches, otherwise newly created)

// ---------------------------------------------------------------------------
// Application-level error types (non-HTTP — for use case layer)
// ---------------------------------------------------------------------------

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly rule: string,
    public readonly message: string,
    public readonly params?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(public readonly entityId: string) {
    super(`Entity with id "${entityId}" not found`);
    this.name = 'NotFoundError';
  }
}
