import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { DashboardPage } from '@presentation/pages/DashboardPage/DashboardPage'
import { groceryListRepository } from '@di/container'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

vi.mock('@di/container', () => ({
  groceryListRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoryRepository: {
    getAll: vi.fn(),
    findByNormalizedName: vi.fn(),
    create: vi.fn(),
  },
  marketRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    findByAddress: vi.fn(),
    create: vi.fn(),
  },
  productRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    findByBarcode: vi.fn(),
    create: vi.fn(),
  },
  purchaseRepository: {
    create: vi.fn(),
  },
  productPriceRecordRepository: {
    getLastPriceForProduct: vi.fn(),
    createBatch: vi.fn(),
  },
}))

const makeList = (id: string, name: string, updatedAt: string): GroceryList => ({
  id,
  name,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt,
  items: [],
})

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Given lists loaded, When search query typed, Then only matching lists are shown', async () => {
    const user = userEvent.setup()
    vi.mocked(groceryListRepository.getAll).mockResolvedValue([
      makeList('1', 'Weekly Shopping', '2026-03-01T00:00:00.000Z'),
      makeList('2', 'Party Supplies', '2026-03-02T00:00:00.000Z'),
    ])

    render(
      <Provider>
        <DashboardPage />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Weekly Shopping')).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /search grocery lists/i }), 'party')

    expect(screen.getByText('Party Supplies')).toBeInTheDocument()
    expect(screen.queryByText('Weekly Shopping')).not.toBeInTheDocument()
  })

  it('Given no lists, Then empty state message is visible', async () => {
    vi.mocked(groceryListRepository.getAll).mockResolvedValue([])

    render(
      <Provider>
        <DashboardPage />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/no grocery lists/i)).toBeInTheDocument()
    })
  })

  it('Given delete confirmed, Then list removed from view', async () => {
    const user = userEvent.setup()
    vi.mocked(groceryListRepository.getAll).mockResolvedValue([
      makeList('1', 'Weekly Shopping', '2026-03-01T00:00:00.000Z'),
    ])
    vi.mocked(groceryListRepository.getById).mockResolvedValue(
      makeList('1', 'Weekly Shopping', '2026-03-01T00:00:00.000Z'),
    )
    vi.mocked(groceryListRepository.delete).mockResolvedValue(undefined)

    render(
      <Provider>
        <DashboardPage />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Weekly Shopping')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.queryByText('Weekly Shopping')).not.toBeInTheDocument()
    })
  })
})
