import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { ProductAssignmentDialog } from '@presentation/components/ProductAssignmentDialog/ProductAssignmentDialog'

vi.mock('@di/container', () => ({
  groceryListRepository: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoryRepository: { getAll: vi.fn(), findByNormalizedName: vi.fn(), create: vi.fn() },
  marketRepository: { getAll: vi.fn(), getById: vi.fn(), findByAddress: vi.fn(), create: vi.fn() },
  productRepository: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'p-1', name: 'Whole Milk', barcode: '123456789', createdAt: '2026-01-01T00:00:00.000Z' },
    ]),
    getById: vi.fn(),
    findByBarcode: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
  },
  purchaseRepository: { create: vi.fn() },
  productPriceRecordRepository: {
    getLastPriceForProduct: vi.fn().mockResolvedValue(null),
    createBatch: vi.fn(),
  },
}))

describe('ProductAssignmentDialog', () => {
  it('Given dialog open, When rendered, Then shows search input and strategy toggle', async () => {
    render(
      <Provider>
        <ProductAssignmentDialog
          open={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          onCreateNew={vi.fn()}
        />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Assign Product')).toBeInTheDocument()
    })
    expect(screen.getByText('By Name')).toBeInTheDocument()
    expect(screen.getByText('By Barcode')).toBeInTheDocument()
    expect(screen.getByLabelText('Search products')).toBeInTheDocument()
  })

  it('Given dialog open, When "Create New Product" clicked, Then creation form is shown', async () => {
    const user = userEvent.setup()

    render(
      <Provider>
        <ProductAssignmentDialog
          open={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          onCreateNew={vi.fn()}
        />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Create New Product')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Create New Product'))
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/barcode/i)).toBeInTheDocument()
  })

  it('Given existing assignment, When rendered, Then shows edit mode with prefilled values', async () => {
    render(
      <Provider>
        <ProductAssignmentDialog
          open={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          onCreateNew={vi.fn()}
          existingAssignment={{
            productId: 'p-1',
            productName: 'Whole Milk',
            quantity: 2,
            unit: 'L',
            unitPrice: 150,
          }}
        />
      </Provider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Modify Assignment')).toBeInTheDocument()
    })
    expect(screen.getByText('Whole Milk')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toHaveValue(2)
    expect(screen.getByLabelText('Unit Price')).toHaveValue(150)
  })
})
