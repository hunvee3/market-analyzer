import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { MarketSelectionDialog } from '@presentation/components/MarketSelectionDialog/MarketSelectionDialog'
vi.mock('@di/container', () => ({
  groceryListRepository: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoryRepository: { getAll: vi.fn(), findByNormalizedName: vi.fn(), create: vi.fn() },
  marketRepository: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'm-1',
        name: 'Carrefour',
        address: { street: '123 Main St', city: 'Buenos Aires', state: 'CABA', zip: '1000' },
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'm-2',
        name: 'Coto',
        address: { street: '456 Oak Ave', city: 'Buenos Aires', state: 'CABA', zip: '1001' },
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ]),
    getById: vi.fn(),
    findByAddress: vi.fn(),
    create: vi.fn(),
  },
  productRepository: { getAll: vi.fn(), getById: vi.fn(), findByBarcode: vi.fn(), create: vi.fn() },
  purchaseRepository: { create: vi.fn() },
  productPriceRecordRepository: { getLastPriceForProduct: vi.fn(), createBatch: vi.fn() },
}))

describe('MarketSelectionDialog', () => {
  it('Given dialog is open, When rendered, Then displays search input and market list', async () => {
    render(
      <Provider>
        <MarketSelectionDialog
          open={true}
          onClose={vi.fn()}
          onSelect={vi.fn()}
          onCreateNew={vi.fn()}
        />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Search markets')).toBeInTheDocument()
    })
    expect(screen.getByText('Select a Market')).toBeInTheDocument()
    expect(screen.getByText('Create New Market')).toBeInTheDocument()
  })

  it('Given markets loaded, When a market is clicked, Then onSelect is called', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <Provider>
        <MarketSelectionDialog
          open={true}
          onClose={vi.fn()}
          onSelect={onSelect}
          onCreateNew={vi.fn()}
        />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Carrefour')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Carrefour'))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'm-1', name: 'Carrefour' }))
  })

  it('Given dialog is open, When "Create New Market" clicked, Then creation form is shown', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <MarketSelectionDialog
          open={true}
          onClose={vi.fn()}
          onSelect={vi.fn()}
          onCreateNew={vi.fn()}
        />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Market')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Create New Market'))
    expect(screen.getByLabelText(/market name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument()
  })
})
