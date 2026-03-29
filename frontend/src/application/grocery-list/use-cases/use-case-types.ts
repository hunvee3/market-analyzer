export interface NewItemInput {
  name: string
  unit: string
  categoryId: string
}

export interface CreateGroceryListInput {
  name: string
  items: NewItemInput[]
}

export interface UpdateGroceryListInput {
  id: string
  name: string
  items: NewItemInput[]
}

export interface DeleteGroceryListInput {
  id: string
}

export interface CreateOrReuseCategoryInput {
  name: string
}

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly rule: string,
    public readonly message: string,
    public readonly params?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(public readonly entityId: string) {
    super(`Entity with id "${entityId}" not found`)
    this.name = 'NotFoundError'
  }
}
