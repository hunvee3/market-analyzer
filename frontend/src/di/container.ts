import { LocalStorageGroceryListRepository } from '@infrastructure/grocery-list/LocalStorageGroceryListRepository'
import { LocalStorageCategoryRepository } from '@infrastructure/grocery-list/LocalStorageCategoryRepository'
import { LocalStorageMarketRepository } from '@infrastructure/purchase/LocalStorageMarketRepository'
import { MockProductRepository } from '@infrastructure/purchase/MockProductRepository'
import { MockPurchaseRepository } from '@infrastructure/purchase/MockPurchaseRepository'
import { MockProductPriceRecordRepository } from '@infrastructure/purchase/MockProductPriceRecordRepository'
import { ZxingBarcodeDecoder } from '@infrastructure/purchase/ZxingBarcodeDecoder'
import type { GroceryListRepository } from '@application/grocery-list/ports/GroceryListRepository.port'
import type { CategoryRepository } from '@application/grocery-list/ports/CategoryRepository.port'
import type { MarketRepository } from '@application/purchase/ports/MarketRepository.port'
import type { ProductRepository } from '@application/purchase/ports/ProductRepository.port'
import type { PurchaseRepository } from '@application/purchase/ports/PurchaseRepository.port'
import type { ProductPriceRecordRepository } from '@application/purchase/ports/ProductPriceRecordRepository.port'
import type { BarcodeDecoderPort } from '@application/purchase/ports/BarcodeDecoder.port'

export const groceryListRepository: GroceryListRepository = new LocalStorageGroceryListRepository()
export const categoryRepository: CategoryRepository = new LocalStorageCategoryRepository()
export const marketRepository: MarketRepository = new LocalStorageMarketRepository()
export const productRepository: ProductRepository = new MockProductRepository()
export const purchaseRepository: PurchaseRepository = new MockPurchaseRepository()
export const productPriceRecordRepository: ProductPriceRecordRepository = new MockProductPriceRecordRepository()
export const barcodeDecoder: BarcodeDecoderPort = new ZxingBarcodeDecoder()
