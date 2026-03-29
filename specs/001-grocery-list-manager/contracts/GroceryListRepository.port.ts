/**
 * PORT: GroceryListRepository
 *
 * Application layer contract for grocery list persistence.
 * Implementations live in infrastructure/ (e.g. LocalStorageGroceryListRepository,
 * HttpGroceryListRepository). Domain and application layers MUST import only this
 * interface — never a concrete implementation.
 *
 * All methods are async to ensure adapters (localStorage, HTTP, IndexedDB) are
 * interchangeable without changing call sites.
 */

import type { GroceryList } from '../../src/domain/grocery-list/GroceryList';
import type { NewItemInput } from './use-case-types';

export interface GroceryListRepository {
  /**
   * Returns all grocery lists sorted by updatedAt descending (most recently saved first).
   */
  getAll(): Promise<GroceryList[]>;

  /**
   * Returns a single list by id, or null if not found.
   */
  getById(id: string): Promise<GroceryList | null>;

  /**
   * Persists a new grocery list. The adapter is responsible for generating
   * the id, createdAt, and updatedAt fields.
   */
  create(input: {
    name: string;
    items: NewItemInput[];
  }): Promise<GroceryList>;

  /**
   * Replaces the name and items of an existing list.
   * The adapter updates updatedAt. createdAt is preserved.
   * Throws if id not found.
   */
  update(id: string, input: {
    name: string;
    items: NewItemInput[];
  }): Promise<GroceryList>;

  /**
   * Permanently removes a list and all its items.
   * Throws if id not found.
   */
  delete(id: string): Promise<void>;
}
