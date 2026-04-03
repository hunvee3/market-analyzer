import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarketCreationForm } from '@presentation/components/MarketCreationForm/MarketCreationForm'

vi.mock('@di/container', () => ({
  groceryListRepository: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoryRepository: { getAll: vi.fn(), findByNormalizedName: vi.fn(), create: vi.fn() },
  marketRepository: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn(), findByAddress: vi.fn().mockResolvedValue([]), create: vi.fn() },
  productRepository: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn(), findByBarcode: vi.fn().mockResolvedValue(null), create: vi.fn() },
  purchaseRepository: { create: vi.fn() },
  productPriceRecordRepository: { getLastPriceForProduct: vi.fn().mockResolvedValue(null), createBatch: vi.fn() },
}))

describe('MarketCreationForm', () => {
  it('Given form rendered, Then name and address fields are displayed', () => {
    render(
      <MarketCreationForm
        onCreated={vi.fn()}
        onDuplicateFound={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/market name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zip/i)).toBeInTheDocument()
  })

  it('Given all fields filled, When Create clicked, Then onCreated is called', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()

    render(
      <MarketCreationForm
        onCreated={onCreated}
        onDuplicateFound={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText(/market name/i), 'Fresh Mart')
    await user.type(screen.getByLabelText(/street/i), '123 Main St')
    await user.type(screen.getByLabelText(/city/i), 'Springfield')
    await user.type(screen.getByLabelText(/state/i), 'IL')
    await user.type(screen.getByLabelText(/zip/i), '62701')

    await user.click(screen.getByRole('button', { name: /create market/i }))

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled()
    })
  })

  it('Given empty required fields, When Create clicked, Then validation errors shown', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()

    render(
      <MarketCreationForm
        onCreated={onCreated}
        onDuplicateFound={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /create market/i }))

    expect(onCreated).not.toHaveBeenCalled()
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })
})
