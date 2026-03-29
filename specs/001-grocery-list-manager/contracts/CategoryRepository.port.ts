/**
 * PORT: CategoryRepository
 *
 * Application layer contract for category persistence.
 * Categories are shared across all lists for the session user.
 * Uniqueness is enforced by normalizedName (trim + lowercase).
 */

import type { Category } from '../../src/domain/grocery-list/Category';

export interface CategoryRepository {
  /**
   * Returns all categories for the session user.
   */
  getAll(): Promise<Category[]>;

  /**
   * Finds a category by its normalizedName (input.trim().toLowerCase()).
   * Returns null if no match found.
   */
  findByNormalizedName(normalizedName: string): Promise<Category | null>;

  /**
   * Creates a new category. The adapter derives normalizedName from name.
   * The adapter generates id and createdAt.
   * Callers MUST check findByNormalizedName before calling create to prevent
   * duplicates — this is enforced by the CreateOrReuseCategory use case.
   */
  create(name: string): Promise<Category>;
}
