import { useEffect, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { GroceryListCard } from '@presentation/components/GroceryListCard/GroceryListCard'
import { SearchBar } from '@presentation/components/SearchBar/SearchBar'
import { GroceryListModal } from '@presentation/components/GroceryListModal/GroceryListModal'
import { groceryListsAtom, searchQueryAtom, filteredListsAtom, isLoadingAtom, activeListAtom } from '@store/groceryList.store'
import { GetAllGroceryListsUseCase } from '@application/grocery-list/use-cases/GetAllGroceryLists.usecase'
import { DeleteGroceryListUseCase } from '@application/grocery-list/use-cases/DeleteGroceryList.usecase'
import { groceryListRepository } from '@di/container'
import { useSnackbar } from '@presentation/context/SnackbarContext'
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
const deleteListUseCase = new DeleteGroceryListUseCase(groceryListRepository)

export function DashboardPage() {
  const [, setLists] = useAtom(groceryListsAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const filteredLists = useAtomValue(filteredListsAtom)
  const setLoading = useSetAtom(isLoadingAtom)
  const [activeList, setActiveList] = useAtom(activeListAtom)
  const { showError } = useSnackbar()
  const [modalOpen, setModalOpen] = useState(false)

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
    console.log('Purchase list:', id)
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
    </main>
  )
}
