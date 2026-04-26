import { useMemo, useState, useEffect, useCallback } from 'react'
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import { useAtomValue, useSetAtom } from 'jotai'
import type { GroceryItem } from '@domain/grocery-list/GroceryList'
import type { Category } from '@domain/grocery-list/Category'
import type { UnitType } from '@domain/shared/UnitType'
import { purchaseItemsAtom, purchaseHasChangesAtom } from '@store/purchase.store'
import { formatPrice } from '@presentation/utils/formatPrice'
import { PurchaseSummaryBar } from '@presentation/components/PurchaseSummaryBar/PurchaseSummaryBar'
import { ProductAssignmentDialog } from '@presentation/components/ProductAssignmentDialog/ProductAssignmentDialog'
import { UnsavedChangesDialog } from '@presentation/components/UnsavedChangesDialog/UnsavedChangesDialog'
import { AssignProductUseCase } from '@application/purchase/use-cases/AssignProduct.usecase'
import { GetLastProductPriceUseCase } from '@application/purchase/use-cases/GetLastProductPrice.usecase'
import { productPriceRecordRepository } from '@di/container'
import { useSnackbar } from '@presentation/context/SnackbarContext'
import {
  fullScreenPanel,
  viewHeader,
  headerTitle,
  headerMarket,
  btnClose,
  viewBody,
  categoryGroup,
  categoryGroupHeader,
  categoryChip,
  categoryCount,
  chevronIcon,
  chevronOpen,
  itemsGroupBody,
  itemRow,
  itemRowText,
  itemRowAssigned,
  assignedTopRow,
  itemName,
  itemDetail,
  assignedProductName,
  assignedBottomSection,
  assignedQtyDetail,
  assignedPriceRow,
  assignedPriceLabel,
  assignedPriceTotal,
  btnAssign,
  btnModify,
  emptyState,
} from './PurchaseView.styles'

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

const assignProductUseCase = new AssignProductUseCase()
const getLastPriceUseCase = new GetLastProductPriceUseCase(productPriceRecordRepository)

function getAccent(categoryName: string, allNames: string[]) {
  const idx = allNames.indexOf(categoryName)
  return CATEGORY_ACCENTS[(idx < 0 ? 0 : idx) % CATEGORY_ACCENTS.length]
}

interface PurchaseViewProps {
  open: boolean
  groceryListName: string
  marketName: string
  items: GroceryItem[]
  categories: Category[]
  onClose: () => void
  onAssignProduct: (groceryItemId: string) => void
  onModifyAssignment: (groceryItemId: string) => void
  onSave: () => void
  saveDisabled?: boolean
}

export function PurchaseView({
  open,
  groceryListName,
  marketName,
  items,
  categories,
  onClose,
  onAssignProduct,
  onModifyAssignment,
  onSave,
  saveDisabled,
}: PurchaseViewProps) {
  const purchaseItems = useAtomValue(purchaseItemsAtom)
  const setPurchaseItems = useSetAtom(purchaseItemsAtom)
  const hasChanges = useAtomValue(purchaseHasChangesAtom)
  const { showError } = useSnackbar()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [productNameMap, setProductNameMap] = useState<Map<string, string>>(new Map())
  // Maps groceryItemId → last recorded unit price (for showing diff)
  const [lastPriceMap, setLastPriceMap] = useState<Map<string, number>>(new Map())
  const [mismatchDialogOpen, setMismatchDialogOpen] = useState(false)
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false)
  const [mismatches, setMismatches] = useState<{ unassigned: string[]; quantityDiffs: { name: string; listAmount: number; listUnit: string; purchaseQty: number; purchaseUnit: string }[] }>({ unassigned: [], quantityDiffs: [] })

  // beforeunload protection
  useEffect(() => {
    if (!open || !hasChanges) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [open, hasChanges])

  const handleExitAttempt = useCallback(() => {
    if (hasChanges) {
      setExitDialogOpen(true)
    } else {
      onClose()
    }
  }, [hasChanges, onClose])

  function handleExitWithoutSaving() {
    setExitDialogOpen(false)
    onClose()
  }

  const assignedMap = useMemo(() => {
    const map = new Map<string, { productId: string; quantity: number; unit: string; unitPrice: number }>()
    for (const pi of purchaseItems) {
      map.set(pi.groceryItemId, {
        productId: pi.productId,
        quantity: pi.quantity,
        unit: pi.unit,
        unitPrice: pi.unitPrice,
      })
    }
    return map
  }, [purchaseItems])

  const grouped = useMemo(() => {
    const catMap = new Map<string, Category>()
    for (const c of categories) catMap.set(c.id, c)

    const groups = new Map<string, { category: Category; items: GroceryItem[] }>()
    for (const item of items) {
      const cat = catMap.get(item.categoryId)
      const catName = cat?.name ?? item.categoryId
      if (!groups.has(catName)) {
        groups.set(catName, { category: cat ?? { id: item.categoryId, name: catName, normalizedName: catName.toLowerCase(), createdAt: '' }, items: [] })
      }
      groups.get(catName)!.items.push(item)
    }
    return groups
  }, [items, categories])

  const categoryNames = useMemo(() => Array.from(grouped.keys()), [grouped])

  function handleAssignClick(groceryItemId: string) {
    setAssigningItemId(groceryItemId)
    setEditingItemId(null)
    setAssignDialogOpen(true)
    onAssignProduct(groceryItemId)
  }

  function handleModifyClick(groceryItemId: string) {
    setEditingItemId(groceryItemId)
    setAssigningItemId(groceryItemId)
    setAssignDialogOpen(true)
    onModifyAssignment(groceryItemId)
  }

  async function handleAssignConfirm(data: { productId: string; productName: string; quantity: number; unit: UnitType; unitPrice: number }) {
    if (!assigningItemId) return
    try {
      // Track product name for display
      setProductNameMap((prev) => new Map(prev).set(assigningItemId, data.productName))

      // Fetch last known price for diff display (fire-and-forget on top of the main flow)
      void getLastPriceUseCase.execute({ productId: data.productId }).then((record) => {
        if (record) {
          setLastPriceMap((prev) => new Map(prev).set(assigningItemId, record.unitPrice))
        }
      })

      if (editingItemId) {
        // Update existing assignment
        setPurchaseItems((prev) =>
          prev.map((pi) =>
            pi.groceryItemId === editingItemId
              ? { ...pi, productId: data.productId, quantity: data.quantity, unit: data.unit, unitPrice: data.unitPrice }
              : pi,
          ),
        )
      } else {
        const purchaseItem = await assignProductUseCase.execute({
          groceryItemId: assigningItemId,
          productId: data.productId,
          quantity: data.quantity,
          unit: data.unit,
          unitPrice: data.unitPrice,
        })
        setPurchaseItems((prev) => [...prev, purchaseItem])
      }
      setAssignDialogOpen(false)
      setAssigningItemId(null)
      setEditingItemId(null)
    } catch {
      showError('Failed to assign product.')
    }
  }

  const assigningGroceryItem = assigningItemId ? items.find((i) => i.id === assigningItemId) : null

  function handleSaveAttempt() {
    const unassigned: string[] = []
    const quantityDiffs: { name: string; listAmount: number; listUnit: string; purchaseQty: number; purchaseUnit: string }[] = []

    for (const item of items) {
      const assignment = assignedMap.get(item.id)
      if (!assignment) {
        unassigned.push(item.name)
      } else if (assignment.quantity !== item.amount) {
        quantityDiffs.push({
          name: item.name,
          listAmount: item.amount,
          listUnit: item.unit,
          purchaseQty: assignment.quantity,
          purchaseUnit: assignment.unit,
        })
      }
    }

    if (unassigned.length > 0 || quantityDiffs.length > 0) {
      setMismatches({ unassigned, quantityDiffs })
      setMismatchDialogOpen(true)
    } else {
      setSaveConfirmDialogOpen(true)
    }
  }

  const existingAssignment = editingItemId
    ? (() => {
        const pi = purchaseItems.find((p) => p.groceryItemId === editingItemId)
        if (!pi) return undefined
        return {
          productId: pi.productId,
          productName: productNameMap.get(editingItemId) ?? pi.productId,
          quantity: pi.quantity,
          unit: pi.unit,
          unitPrice: pi.unitPrice,
        }
      })()
    : undefined

  return (
    <Dialog open={open} onClose={handleExitAttempt} className="relative z-50">
      <DialogPanel className={fullScreenPanel}>
        {/* Header */}
        <div className={viewHeader}>
          <div className="flex items-center min-w-0">
            <span className={headerTitle}>{groceryListName}</span>
            <span className={headerMarket}>@ {marketName}</span>
          </div>
          <button aria-label="close" onClick={handleExitAttempt} className={btnClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className={viewBody}>
          {items.length === 0 ? (
            <div className={emptyState}>No items in this grocery list</div>
          ) : (
            Array.from(grouped.entries()).map(([catName, { items: catItems }]) => {
              const accent = getAccent(catName, categoryNames)
              return (
                <div key={catName} className={categoryGroup}>
                  <Disclosure defaultOpen>
                    {({ open: isOpen }: { open: boolean }) => (
                      <>
                        <DisclosureButton className={categoryGroupHeader}>
                          <span className={clsx(categoryChip, accent.bg)}>
                            {catName}
                          </span>
                          <span className={categoryCount}>{catItems.length}</span>
                          <ChevronDownIcon className={clsx(chevronIcon, isOpen && chevronOpen)} />
                        </DisclosureButton>
                        <DisclosurePanel>
                          <div className={itemsGroupBody}>
                            {catItems.map((item) => {
                              const assignment = assignedMap.get(item.id)
                              const lastPriceEntry = lastPriceMap.get(item.id)
                              const priceDiff = assignment && lastPriceEntry
                                ? assignment.unitPrice - lastPriceEntry
                                : null

                              return assignment ? (
                                <div key={item.id} className={clsx(itemRowAssigned, accent.border)}>
                                  <div className={assignedTopRow}>
                                    <span className={itemName}>{item.name}</span>
                                    <button
                                      className={btnModify}
                                      onClick={() => handleModifyClick(item.id)}
                                      aria-label="Modify assignment"
                                    >
                                      Modify
                                    </button>
                                  </div>
                                  <span className={assignedProductName}>{productNameMap.get(item.id) ?? 'Product'}</span>
                                  <div className={assignedBottomSection}>
                                    <span className={assignedQtyDetail}>
                                      {assignment.quantity} {assignment.unit} out of {item.amount} {item.unit}
                                    </span>
                                    <div className={assignedPriceRow}>
                                      <span className={assignedPriceLabel}>Unit: {formatPrice(assignment.unitPrice)}</span>
                                      {priceDiff !== null && priceDiff !== 0 && (
                                        <span className={priceDiff > 0 ? 'text-xs text-rose-400 font-medium' : 'text-xs text-emerald-400 font-medium'}>
                                          {priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)}
                                        </span>
                                      )}
                                      <span className={assignedPriceTotal}>Total: {formatPrice(assignment.quantity * assignment.unitPrice)}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div key={item.id} className={clsx(itemRow, accent.border, 'bg-gray-800/40 hover:bg-gray-800/70')}>
                                  <div className={itemRowText}>
                                    <span className={itemName}>{item.name}</span>
                                    <span className={itemDetail}>{item.amount} {item.unit}</span>
                                  </div>
                                  <button
                                    className={btnAssign}
                                    onClick={() => handleAssignClick(item.id)}
                                    aria-label="Assign product"
                                  >
                                    Assign Product
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                </div>
              )
            })
          )}
        </div>

        {/* Summary Bar */}
        <PurchaseSummaryBar
          onSave={handleSaveAttempt}
          onExit={handleExitAttempt}
          saveDisabled={saveDisabled}
        />
      </DialogPanel>

      <ProductAssignmentDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false)
          setAssigningItemId(null)
          setEditingItemId(null)
        }}
        onConfirm={(data) => void handleAssignConfirm(data)}
        onCreateNew={() => {
          // Phase 7 - T065
          setAssignDialogOpen(false)
        }}
        prefill={assigningGroceryItem ? { amount: assigningGroceryItem.amount, unit: assigningGroceryItem.unit } : undefined}
        existingAssignment={existingAssignment}
      />

      <UnsavedChangesDialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        onSaveAndExit={() => {
          setExitDialogOpen(false)
          onSave()
        }}
        onExitWithoutSaving={handleExitWithoutSaving}
      />

      {/* Mismatch Warning Dialog */}
      <Dialog open={mismatchDialogOpen} onClose={() => setMismatchDialogOpen(false)} className="relative z-[60]">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl p-6 space-y-4">
            <DialogTitle className="text-lg font-semibold text-amber-400">Purchase Mismatches</DialogTitle>
            <div className="space-y-3 text-sm text-gray-300">
              {mismatches.unassigned.length > 0 && (
                <div>
                  <p className="font-medium text-gray-200 mb-1">Items without a product assigned:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                    {mismatches.unassigned.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {mismatches.quantityDiffs.length > 0 && (
                <div>
                  <p className="font-medium text-gray-200 mb-1">Quantity differences:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                    {mismatches.quantityDiffs.map((d) => (
                      <li key={d.name}>
                        {d.name}: {d.purchaseQty} {d.purchaseUnit} purchased, {d.listAmount} {d.listUnit} on list
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => setMismatchDialogOpen(false)}
              >
                Go Back
              </button>
              <button
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 transition-colors"
                onClick={() => {
                  setMismatchDialogOpen(false)
                  onSave()
                }}
              >
                Save Anyway
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveConfirmDialogOpen} onClose={() => setSaveConfirmDialogOpen(false)} className="relative z-[60]">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl p-6 space-y-4">
            <DialogTitle className="text-lg font-semibold text-gray-100">Save Purchase</DialogTitle>
            <p className="text-sm text-gray-400">
              This purchase cannot be edited after saving. Are you sure you want to save?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => setSaveConfirmDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                onClick={() => {
                  setSaveConfirmDialogOpen(false)
                  onSave()
                }}
              >
                Save
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Dialog>
  )
}
