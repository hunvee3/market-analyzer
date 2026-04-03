import { LocalStorageGroceryListRepository } from '@infrastructure/grocery-list/LocalStorageGroceryListRepository'
import { LocalStorageCategoryRepository } from '@infrastructure/grocery-list/LocalStorageCategoryRepository'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'

export const groceryListRepository: GroceryListRepository = new LocalStorageGroceryListRepository()
export const categoryRepository: CategoryRepository = new LocalStorageCategoryRepository()
