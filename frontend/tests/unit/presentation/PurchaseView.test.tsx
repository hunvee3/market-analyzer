import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { PurchaseView } from '@presentation/components/PurchaseView/PurchaseView'
import type { GroceryItem } from '@domain/grocery-list/GroceryList'
import type { Category } from '@domain/grocery-list/Category'
import { purchaseItemsAtom } from '@store/purchase.store'

vi.mock('@di/container', () => ({
  groceryListRepository: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoryRepository: { getAll: vi.fn(), findByNormalizedName: vi.fn(), create: vi.fn() },
  marketRepository: { getAll: vi.fn(), getById: vi.fn(), findByAddress: vi.fn(), create: vi.fn() },
  productRepository: { getAll: vi.fn(), getById: vi.fn(), findByBarcode: vi.fn(), create: vi.fn() },
  purchaseRepository: { create: vi.fn() },
  productPriceRecordRepository: { getLastPriceForProduct: vi.fn(), createBatch: vi.fn() },
}))

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Dairy', normalizedName: 'dairy', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Bakery', normalizedName: 'bakery', createdAt: '2026-01-01T00:00:00.000Z' },
]

const mockItems: GroceryItem[] = [
  { id: 'item-1', name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1', position: 0 },
  { id: 'item-2', name: 'Bread', amount: 1, unit: 'units', categoryId: 'cat-2', position: 1 },
  { id: 'item-3', name: 'Cheese', amount: 0.5, unit: 'kg', categoryId: 'cat-1', position: 2 },
]

describe('PurchaseView', () => {
  it('Given items and categories, When rendered, Then displays items grouped by category', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <PurchaseView
          open={true}
          groceryListName="Weekly Shopping"
          marketName="Carrefour"
          items={mockItems}
          categories={mockCategories}
          onClose={vi.fn()}
          onAssignProduct={vi.fn()}
          onModifyAssignment={vi.fn()}
          onSave={vi.fn()}
        />
      </Provider>,
    )

    expect(screen.getByText('Weekly Shopping')).toBeInTheDocument()
    expect(screen.getByText('@ Carrefour')).toBeInTheDocument()
    expect(screen.getByText('Dairy')).toBeInTheDocument()
    expect(screen.getByText('Bakery')).toBeInTheDocument()
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Bread')).toBeInTheDocument()
    expect(screen.getByText('Cheese')).toBeInTheDocument()
  })

  it('Given unassigned items, When rendered, Then each item has "Assign Product" button', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <PurchaseView
          open={true}
          groceryListName="Weekly Shopping"
          marketName="Carrefour"
          items={mockItems}
          categories={mockCategories}
          onClose={vi.fn()}
          onAssignProduct={vi.fn()}
          onModifyAssignment={vi.fn()}
          onSave={vi.fn()}
        />
      </Provider>,
    )

    const assignButtons = screen.getAllByRole('button', { name: /assign product/i })
    expect(assignButtons).toHaveLength(3)
  })

  it('Given an assigned item, When rendered, Then shows "Modify" button and assignment info', () => {
    const store = createStore()
    store.set(purchaseItemsAtom, [
      { id: 'pi-1', groceryItemId: 'item-1', productId: 'prod-1', quantity: 2, unit: 'L', unitPrice: 150 },
    ])

    render(
      <Provider store={store}>
        <PurchaseView
          open={true}
          groceryListName="Weekly Shopping"
          marketName="Carrefour"
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
    // Remaining items still have Assign Product
    const assignButtons = screen.getAllByRole('button', { name: /assign product/i })
    expect(assignButtons).toHaveLength(2)
  })

  it('Given Purchase Mode, When rendered, Then market name is display-only with no edit action (FR-025d)', () => {
    const store = createStore()

    render(
      <Provider store={store}>
        <PurchaseView
          open={true}
          groceryListName="Weekly Shopping"
          marketName="Carrefour"
          items={mockItems}
          categories={mockCategories}
          onClose={vi.fn()}
          onAssignProduct={vi.fn()}
          onModifyAssignment={vi.fn()}
          onSave={vi.fn()}
        />
      </Provider>,
    )

    const marketNameEl = screen.getByText('@ Carrefour')
    // Market name should be a simple span, not a button or link
    expect(marketNameEl.tagName).toBe('SPAN')
    // No edit button for market
    expect(screen.queryByRole('button', { name: /edit market/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /change market/i })).not.toBeInTheDocument()
  })
})
