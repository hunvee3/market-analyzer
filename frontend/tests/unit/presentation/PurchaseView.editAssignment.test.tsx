import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider, createStore } from 'jotai'
import { PurchaseView } from '@presentation/components/PurchaseView/PurchaseView'
import type { GroceryItem } from '@domain/grocery-list/GroceryList'
import type { Category } from '@domain/grocery-list/Category'
import { purchaseItemsAtom } from '@store/purchase.store'

vi.mock('@di/container', () => ({
  groceryListRepository: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoryRepository: { getAll: vi.fn(), findByNormalizedName: vi.fn(), create: vi.fn() },
  marketRepository: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn(), findByAddress: vi.fn().mockResolvedValue([]), create: vi.fn() },
  productRepository: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn(), findByBarcode: vi.fn().mockResolvedValue(null), create: vi.fn() },
  purchaseRepository: { create: vi.fn() },
  productPriceRecordRepository: { getLastPriceForProduct: vi.fn().mockResolvedValue(null), createBatch: vi.fn() },
}))

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Dairy', normalizedName: 'dairy', createdAt: '2026-01-01T00:00:00.000Z' },
]

const mockItems: GroceryItem[] = [
  { id: 'item-1', name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1', position: 0 },
]

describe('PurchaseView edit assignment', () => {
  it('Given item has assignment, Then Modify button is displayed', async () => {
    const store = createStore()
    store.set(purchaseItemsAtom, [
      { id: 'pi-1', groceryItemId: 'item-1', productId: 'prod-1', quantity: 2, unit: 'L', unitPrice: 150 },
    ])

    render(
      <Provider store={store}>
        <PurchaseView
          open={true}
          groceryListName="Test"
          marketName="Market"
          items={mockItems}
          categories={mockCategories}
          onClose={vi.fn()}
          onAssignProduct={vi.fn()}
          onModifyAssignment={vi.fn()}
          onSave={vi.fn()}
        />
      </Provider>,
    )

    expect(screen.getByRole('button', { name: /modify assignment/i })).toBeInTheDocument()
  })

  it('Given item has assignment, When Modify clicked, Then ProductAssignmentDialog opens', async () => {
    const user = userEvent.setup()
    const onModifyAssignment = vi.fn()
    const store = createStore()
    store.set(purchaseItemsAtom, [
      { id: 'pi-1', groceryItemId: 'item-1', productId: 'prod-1', quantity: 2, unit: 'L', unitPrice: 150 },
    ])

    render(
      <Provider store={store}>
        <PurchaseView
          open={true}
          groceryListName="Test"
          marketName="Market"
          items={mockItems}
          categories={mockCategories}
          onClose={vi.fn()}
          onAssignProduct={vi.fn()}
          onModifyAssignment={onModifyAssignment}
          onSave={vi.fn()}
        />
      </Provider>,
    )

    await user.click(screen.getByRole('button', { name: /modify assignment/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /modify assignment/i })).toBeInTheDocument()
    })
    expect(onModifyAssignment).toHaveBeenCalledWith('item-1')
  })
})
