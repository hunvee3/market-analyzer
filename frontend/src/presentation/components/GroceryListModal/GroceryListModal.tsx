import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { XMarkIcon, PencilIcon, TrashIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { useAtom, useSetAtom } from 'jotai'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { UnitType } from '@domain/shared/UnitType'
import type { NewItemInput } from '@application/grocery-list/use-cases/use-case-types'
import { ItemSubForm } from '@presentation/components/ItemSubForm/ItemSubForm'
import { UnsavedChangesDialog } from '@presentation/components/UnsavedChangesDialog/UnsavedChangesDialog'
import { groceryListsAtom } from '@store/groceryList.store'
import { categoriesAtom } from '@store/category.store'
import { CreateGroceryListUseCase } from '@application/grocery-list/use-cases/CreateGroceryList.usecase'
import { UpdateGroceryListUseCase } from '@application/grocery-list/use-cases/UpdateGroceryList.usecase'
import { GetAllCategoriesUseCase } from '@application/grocery-list/use-cases/GetAllCategories.usecase'
import { groceryListRepository, categoryRepository } from '@di/container'
import { useSnackbar } from '@presentation/context/SnackbarContext'
import {
  fullScreenPanel,
  modalHeader,
  modalTitleInput,
  modalTitleInputError,
  btnClose,
  modalBody,
  itemsSection,
  itemsSectionHeader,
  itemsSectionTitle,
  itemsBadge,
  errorInline,
  categoryGroup,
  categoryGroupHeader,
  categoryChip,
  categoryCount,
  chevronIcon,
  chevronOpen,
  itemsGroupBody,
  itemRow,
  itemRowText,
  itemName,
  itemUnit,
  itemActions,
  btnIconEdit,
  btnIconDelete,
  btnAddItem,
  modalFooter,
  btnModalCancel,
  btnModalSave,
  itemDialogPanel,
  itemDialogHeader,
  itemDialogTitle,
} from './GroceryListModal.styles'

const createListUseCase = new CreateGroceryListUseCase(groceryListRepository)
const updateListUseCase = new UpdateGroceryListUseCase(groceryListRepository)
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepository)

// A small palette of accent colors used for category chips/borders
const CATEGORY_ACCENTS = [
  { bg: 'bg-indigo-500/20 text-indigo-300', border: 'border-indigo-500' },
  { bg: 'bg-violet-500/20 text-violet-300', border: 'border-violet-500' },
  { bg: 'bg-emerald-500/20 text-emerald-300', border: 'border-emerald-500' },
  { bg: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500' },
  { bg: 'bg-rose-500/20 text-rose-300', border: 'border-rose-500' },
  { bg: 'bg-cyan-500/20 text-cyan-300', border: 'border-cyan-500' },
  { bg: 'bg-pink-500/20 text-pink-300', border: 'border-pink-500' },
  { bg: 'bg-lime-500/20 text-lime-300', border: 'border-lime-500' },
]

function getAccent(categoryName: string, allNames: string[]) {
  const idx = allNames.indexOf(categoryName)
  return CATEGORY_ACCENTS[(idx < 0 ? 0 : idx) % CATEGORY_ACCENTS.length]
}

interface PendingItem {
  id: string
  name: string
  amount: number
  unit: UnitType
  categoryId: string
  categoryName: string
}

interface GroceryListModalProps {
  open: boolean
  onClose: () => void
  initialList: GroceryList | null
}

export function GroceryListModal({ open, onClose, initialList }: GroceryListModalProps) {
  const isEdit = initialList !== null
  const { showError } = useSnackbar()

  const setLists = useSetAtom(groceryListsAtom)
  const [categories, setCategories] = useAtom(categoriesAtom)

  const [name, setName] = useState(initialList?.name ?? '')
  const [items, setItems] = useState<PendingItem[]>([])
  const [addingItem, setAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [nameError, setNameError] = useState(false)
  const [itemsError, setItemsError] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)

  const isDirty = name !== (initialList?.name ?? '') || items.length > 0

  useEffect(() => {
    if (!open) return
    setName(initialList?.name ?? '')
    setNameError(false)
    setItemsError(false)
    setAddingItem(false)
    setEditingItemId(null)
    setUnsavedDialogOpen(false)
    setItems([])

    getAllCategoriesUseCase
      .execute()
      .then((cats) => {
        setCategories(cats)
        if (initialList && initialList.items.length > 0) {
          setItems(
            initialList.items.map((item) => {
              const cat = cats.find((c) => c.id === item.categoryId)
              return {
                id: item.id,
                name: item.name,
                amount: item.amount,
                unit: item.unit,
                categoryId: item.categoryId,
                categoryName: cat?.name ?? item.categoryId,
              }
            }),
          )
        }
      })
      .catch(() => {/* no-op */})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialList])

  const categoryNames = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const item of items) {
      if (!seen.has(item.categoryName)) {
        seen.add(item.categoryName)
        ordered.push(item.categoryName)
      }
    }
    return ordered
  }, [items])

  const groupedItems = useMemo(() => {
    const groups = new Map<string, PendingItem[]>()
    for (const item of items) {
      const group = groups.get(item.categoryName) ?? []
      group.push(item)
      groups.set(item.categoryName, group)
    }
    return groups
  }, [items])

  function handleCloseAttempt() {
    if (isDirty) {
      setUnsavedDialogOpen(true)
    } else {
      onClose()
    }
  }

  function handleExitWithoutSaving() {
    setUnsavedDialogOpen(false)
    onClose()
  }

  async function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }
    if (items.length === 0) {
      setItemsError(true)
      return
    }
    const newItems: NewItemInput[] = items.map((item) => ({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      categoryId: item.categoryId,
    }))

    try {
      if (isEdit && initialList) {
        const updated = await updateListUseCase.execute({
          id: initialList.id,
          name: trimmedName,
          items: newItems,
        })
        setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      } else {
        const created = await createListUseCase.execute({ name: trimmedName, items: newItems })
        setLists((prev) => [created, ...prev])
      }
      onClose()
    } catch {
      showError('Failed to save grocery list.')
    }
  }

  async function handleSaveAndExit() {
    setUnsavedDialogOpen(false)
    await handleSave()
  }

  function handleItemConfirm(newItem: NewItemInput, categoryName: string) {
    if (editingItemId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId ? { ...item, ...newItem, categoryName } : item,
        ),
      )
      setEditingItemId(null)
    } else {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), ...newItem, categoryName }])
    }
    setAddingItem(false)
    setItemsError(false)
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleEditItem(id: string) {
    setEditingItemId(id)
    setAddingItem(true)
  }

  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null
  const editingCategory = editingItem
    ? (categories.find((c) => c.id === editingItem.categoryId) ?? null)
    : null

  return (
    <>
      <Dialog open={open} onClose={handleCloseAttempt} className="relative z-50">
        <div className={fullScreenPanel}>
          <DialogPanel className="flex flex-col h-full">
            {/* Header */}
            <div className={modalHeader}>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(false)
                }}
                aria-label="List Name"
                placeholder="List name…"
                className={clsx(modalTitleInput, nameError && modalTitleInputError)}
              />
              {nameError && (
                <span className="text-xs text-red-400 mr-2 shrink-0">Name required</span>
              )}
              <button
                aria-label="close"
                onClick={handleCloseAttempt}
                className={btnClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className={modalBody}>
              <div className={itemsSection}>
                <div className={itemsSectionHeader}>
                  <span className={itemsSectionTitle}>Items</span>
                  {items.length > 0 && (
                    <span className={itemsBadge}>{items.length}</span>
                  )}
                </div>

                {itemsError && (
                  <p className={errorInline}>At least one item is required</p>
                )}

                {Array.from(groupedItems.entries()).map(([categoryName, catItems]) => {
                  const accent = getAccent(categoryName, categoryNames)
                  return (
                    <div key={categoryName} className={categoryGroup}>
                      <Disclosure defaultOpen>
                        {({ open: isOpen }: { open: boolean }) => (
                          <>
                            <DisclosureButton className={categoryGroupHeader}>
                              <span className={clsx(categoryChip, accent.bg)}>
                                {categoryName}
                              </span>
                              <span className={categoryCount}>{catItems.length}</span>
                              <ChevronDownIcon
                                className={clsx(chevronIcon, isOpen && chevronOpen)}
                              />
                            </DisclosureButton>
                            <DisclosurePanel>
                              <div className={itemsGroupBody}>
                                {catItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className={clsx(itemRow, accent.border, 'bg-gray-800/40 hover:bg-gray-800/70')}
                                  >
                                    <div className={itemRowText}>
                                      <span className={itemName}>{item.name}</span>
                                      <span className={itemUnit}>{item.amount} {item.unit}</span>
                                    </div>
                                    <div className={itemActions}>
                                      <button
                                        className={btnIconEdit}
                                        aria-label="Edit item"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEditItem(item.id)
                                        }}
                                      >
                                        <PencilIcon className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        className={btnIconDelete}
                                        aria-label="Remove item"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRemoveItem(item.id)
                                        }}
                                      >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DisclosurePanel>
                          </>
                        )}
                      </Disclosure>
                    </div>
                  )
                })}

                <button
                  className={btnAddItem}
                  onClick={() => setAddingItem(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add item
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className={modalFooter}>
              <button className={btnModalCancel} onClick={handleCloseAttempt}>
                Cancel
              </button>
              <button className={btnModalSave} onClick={() => void handleSave()}>
                Save
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Item sub-dialog */}
      <Dialog
        open={addingItem}
        onClose={() => {
          setAddingItem(false)
          setEditingItemId(null)
        }}
        className="relative z-[60]"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className={itemDialogPanel}>
            <div className={itemDialogHeader}>
              <DialogTitle className={itemDialogTitle}>
                {editingItemId ? 'Edit Item' : 'Add Item'}
              </DialogTitle>
              <button
                aria-label="close"
                onClick={() => {
                  setAddingItem(false)
                  setEditingItemId(null)
                }}
                className="text-gray-400 hover:text-gray-200 p-1 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <ItemSubForm
              categories={categories}
              initialValues={
                editingItem
                  ? {
                      name: editingItem.name,
                      amount: editingItem.amount,
                      unit: editingItem.unit,
                      category: editingCategory,
                      categoryName: editingItem.categoryName,
                    }
                  : undefined
              }
              onConfirm={(item, categoryName) => {
                handleItemConfirm(item, categoryName)
              }}
              onCancel={() => {
                setAddingItem(false)
                setEditingItemId(null)
              }}
            />
          </DialogPanel>
        </div>
      </Dialog>

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onClose={() => setUnsavedDialogOpen(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
      />
    </>
  )
}
