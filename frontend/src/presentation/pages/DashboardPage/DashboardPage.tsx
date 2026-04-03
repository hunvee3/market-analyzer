import { useEffect, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { GroceryListCard } from '@presentation/components/GroceryListCard/GroceryListCard'
import { SearchBar } from '@presentation/components/SearchBar/SearchBar'
import { GroceryListModal } from '@presentation/components/GroceryListModal/GroceryListModal'
import { MarketSelectionDialog } from '@presentation/components/MarketSelectionDialog/MarketSelectionDialog'
import { PurchaseView } from '@presentation/components/PurchaseView/PurchaseView'
import { groceryListsAtom, searchQueryAtom, filteredListsAtom, isLoadingAtom, activeListAtom } from '@store/groceryList.store'
import { activePurchaseAtom, purchaseItemsAtom } from '@store/purchase.store'
import { categoriesAtom } from '@store/category.store'
import { GetAllGroceryListsUseCase } from '@application/grocery-list/use-cases/GetAllGroceryLists.usecase'
import { GetAllCategoriesUseCase } from '@application/grocery-list/use-cases/GetAllCategories.usecase'
import { DeleteGroceryListUseCase } from '@application/grocery-list/use-cases/DeleteGroceryList.usecase'
import { SavePurchaseUseCase } from '@application/purchase/use-cases/SavePurchase.usecase'
import { groceryListRepository, categoryRepository, purchaseRepository, productPriceRecordRepository } from '@di/container'
import { useSnackbar } from '@presentation/context/SnackbarContext'
import type { Market } from '@domain/purchase/Market'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import {
  pageContainer,
  pageHeader,
  pageTitle,
  btnCreateNew,
  listsGrid,
  emptyState,
  emptyStateText,
  btnCreateNewOutline,
} from './DashboardPage.styles'

const getAllListsUseCase = new GetAllGroceryListsUseCase(groceryListRepository)
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepository)
const deleteListUseCase = new DeleteGroceryListUseCase(groceryListRepository)
const savePurchaseUseCase = new SavePurchaseUseCase(purchaseRepository, productPriceRecordRepository)

export function DashboardPage() {
  const [, setLists] = useAtom(groceryListsAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const filteredLists = useAtomValue(filteredListsAtom)
  const setLoading = useSetAtom(isLoadingAtom)
  const [activeList, setActiveList] = useAtom(activeListAtom)
  const [categories, setCategories] = useAtom(categoriesAtom)
  const [activePurchase, setActivePurchase] = useAtom(activePurchaseAtom)
  const [purchaseItems, setPurchaseItems] = useAtom(purchaseItemsAtom)
  const { showError } = useSnackbar()
  const [modalOpen, setModalOpen] = useState(false)
  const [marketDialogOpen, setMarketDialogOpen] = useState(false)
  const [purchaseList, setPurchaseList] = useState<GroceryList | null>(null)

  useEffect(() => {
    void loadLists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadLists() {
    setLoading(true)
    try {
      const lists = await getAllListsUseCase.execute()
      setLists(lists)
    } catch {
      showError('Failed to load grocery lists.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteListUseCase.execute({ id })
      setLists((prev) => prev.filter((l) => l.id !== id))
    } catch {
      showError('Failed to delete grocery list.')
    }
  }

  function handleEdit(id: string) {
    const list = filteredLists.find((l) => l.id === id) ?? null
    setActiveList(list)
    setModalOpen(true)
  }

  function handlePurchase(id: string) {
    const list = filteredLists.find((l) => l.id === id) ?? null
    if (!list) return
    setPurchaseList(list)
    setMarketDialogOpen(true)
  }

  function handleMarketSelect(market: Market) {
    if (!purchaseList) return
    setMarketDialogOpen(false)
    setActivePurchase({ groceryList: purchaseList, market })
    setPurchaseItems([])
    // Load categories for display
    getAllCategoriesUseCase.execute().then(setCategories).catch(() => {/* no-op */})
  }

  function handlePurchaseClose() {
    setActivePurchase(null)
    setPurchaseItems([])
    setPurchaseList(null)
  }

  async function handleSavePurchase() {
    if (!activePurchase) return
    try {
      const items = purchaseItems.map((pi) => ({
        groceryItemId: pi.groceryItemId,
        productId: pi.productId,
        quantity: pi.quantity,
        unit: pi.unit,
        unitPrice: pi.unitPrice,
      }))
      await savePurchaseUseCase.execute({
        groceryListId: activePurchase.groceryList.id,
        marketId: activePurchase.market.id,
        items,
      })
      handlePurchaseClose()
    } catch {
      showError('Failed to save purchase.')
    }
  }

  function handleCreateNewMarket() {
    // Placeholder — will be implemented in Phase 6 (T059-T060)
    setMarketDialogOpen(false)
  }

  function handleCreateNew() {
    setActiveList(null)
    setModalOpen(true)
  }

  function handleModalClose() {
    setModalOpen(false)
    setActiveList(null)
  }

  return (
    <main className={pageContainer}>
      <div className={pageHeader}>
        <h1 className={pageTitle}>My Grocery Lists</h1>
        <button className={btnCreateNew} onClick={handleCreateNew}>
          Create New List
        </button>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div aria-live="polite" aria-atomic="false">
        {filteredLists.length === 0 ? (
          <div className={emptyState}>
            <p className={emptyStateText}>No grocery lists yet. Create one to get started!</p>
            <button className={btnCreateNewOutline} onClick={handleCreateNew}>
              Create New List
            </button>
          </div>
        ) : (
          <div className={listsGrid}>
            {filteredLists.map((list) => (
              <GroceryListCard
                key={list.id}
                list={list}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}
      </div>

      <GroceryListModal
        open={modalOpen}
        onClose={handleModalClose}
        initialList={activeList}
      />

      <MarketSelectionDialog
        open={marketDialogOpen}
        onClose={() => {
          setMarketDialogOpen(false)
          setPurchaseList(null)
        }}
        onSelect={handleMarketSelect}
        onCreateNew={handleCreateNewMarket}
      />

      {activePurchase && (
        <PurchaseView
          open={!!activePurchase}
          groceryListName={activePurchase.groceryList.name}
          marketName={activePurchase.market.name}
          items={activePurchase.groceryList.items}
          categories={categories}
          onClose={handlePurchaseClose}
          onAssignProduct={() => {}}
          onModifyAssignment={() => {}}
          onSave={() => void handleSavePurchase()}
        />
      )}
    </main>
  )
}
