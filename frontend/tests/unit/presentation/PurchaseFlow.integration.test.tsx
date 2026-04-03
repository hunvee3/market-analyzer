import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { DashboardPage } from '@presentation/pages/DashboardPage/DashboardPage'
import { SnackbarProvider } from '@presentation/context/SnackbarContext'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { Category } from '@domain/grocery-list/Category'
import type { Market } from '@domain/purchase/Market'

const mockList: GroceryList = {
  id: 'list-1',
  name: 'Weekly Groceries',
  items: [
    { id: 'item-1', name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1', position: 0 },
    { id: 'item-2', name: 'Bread', amount: 1, unit: 'units', categoryId: 'cat-2', position: 1 },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Dairy', normalizedName: 'dairy', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Bakery', normalizedName: 'bakery', createdAt: '2026-01-01T00:00:00.000Z' },
]

const mockMarket: Market = {
  id: 'market-1',
  name: 'Fresh Mart',
  address: { street: '123 Main St', city: 'Springfield', state: 'IL', zip: '62701' },
  createdAt: '2026-01-01T00:00:00.000Z',
}

const mockGetAll = vi.fn().mockResolvedValue([mockList])
const mockGetAllCategories = vi.fn().mockResolvedValue(mockCategories)
const mockGetAllMarkets = vi.fn().mockResolvedValue([mockMarket])
const mockCreatePurchase = vi.fn().mockResolvedValue({ id: 'purchase-1' })
const mockCreateBatch = vi.fn().mockResolvedValue(undefined)

vi.mock('@di/container', () => ({
  groceryListRepository: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoryRepository: {
    getAll: (...args: unknown[]) => mockGetAllCategories(...args),
    findByNormalizedName: vi.fn(),
    create: vi.fn(),
  },
  marketRepository: {
    getAll: (...args: unknown[]) => mockGetAllMarkets(...args),
    getById: vi.fn(),
    findByAddress: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
  productRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    findByBarcode: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
  },
  purchaseRepository: {
    create: (...args: unknown[]) => mockCreatePurchase(...args),
  },
  productPriceRecordRepository: {
    getLastPriceForProduct: vi.fn().mockResolvedValue(null),
    createBatch: (...args: unknown[]) => mockCreateBatch(...args),
  },
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('Purchase Flow Integration', () => {
  it('Given grocery list on dashboard, When Purchase → select market, Then PurchaseView opens with items', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <SnackbarProvider>
          <DashboardPage />
        </SnackbarProvider>
      </Provider>,
    )

    // Wait for lists to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    })

    // Click Purchase button on the grocery list card
    await user.click(screen.getByRole('button', { name: /purchase/i }))

    // Market selection dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Select a Market')).toBeInTheDocument()
    })

    // Wait for market list and select a market
    await waitFor(() => {
      expect(screen.getByText('Fresh Mart')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Fresh Mart'))

    // PurchaseView should open with items grouped by category
    await waitFor(() => {
      expect(screen.getByText('@ Fresh Mart')).toBeInTheDocument()
    })

    // Items should be visible
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Bread')).toBeInTheDocument()
  })
})
