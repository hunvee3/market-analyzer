import { LocalStorageGroceryListRepository } from '@infrastructure/grocery-list/LocalStorageGroceryListRepository'
import { LocalStorageCategoryRepository } from '@infrastructure/grocery-list/LocalStorageCategoryRepository'
import { MockMarketRepository } from '@infrastructure/purchase/MockMarketRepository'
import { MockProductRepository } from '@infrastructure/purchase/MockProductRepository'
import { MockPurchaseRepository } from '@infrastructure/purchase/MockPurchaseRepository'
import { MockProductPriceRecordRepository } from '@infrastructure/purchase/MockProductPriceRecordRepository'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'
import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'
import type { ProductRepository } from '@application/purchase/ports/ProductRepository.port'
import type { PurchaseRepository } from '@application/purchase/ports/PurchaseRepository.port'
import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'

export const groceryListRepository: GroceryListRepository = new LocalStorageGroceryListRepository()
export const categoryRepository: CategoryRepository = new LocalStorageCategoryRepository()
export const marketRepository: MarketRepository = new MockMarketRepository()
export const productRepository: ProductRepository = new MockProductRepository()
export const purchaseRepository: PurchaseRepository = new MockPurchaseRepository()
export const productPriceRecordRepository: ProductPriceRecordRepository = new MockProductPriceRecordRepository()
