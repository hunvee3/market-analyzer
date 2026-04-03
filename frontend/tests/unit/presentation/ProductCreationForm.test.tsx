import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCreationForm } from '@presentation/components/ProductCreationForm/ProductCreationForm'

vi.mock('@di/container', () => ({
  groceryListRepository: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  categoryRepository: { getAll: vi.fn(), findByNormalizedName: vi.fn(), create: vi.fn() },
  marketRepository: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn(), findByAddress: vi.fn().mockResolvedValue([]), create: vi.fn() },
  productRepository: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn(), findByBarcode: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'p-1', name: 'Test', barcode: '123', createdAt: '' }) },
  purchaseRepository: { create: vi.fn() },
  productPriceRecordRepository: { getLastPriceForProduct: vi.fn().mockResolvedValue(null), createBatch: vi.fn() },
}))

describe('ProductCreationForm', () => {
  it('Given form rendered, Then name and barcode fields are displayed', () => {
    render(
      <ProductCreationForm
        onCreated={vi.fn()}
        onDuplicateFound={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/barcode/i)).toBeInTheDocument()
  })

  it('Given name and barcode filled, When Create clicked, Then onCreated is called', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()

    render(
      <ProductCreationForm
        onCreated={onCreated}
        onDuplicateFound={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText(/product name/i), 'Organic Milk')
    await user.type(screen.getByLabelText(/barcode/i), '1234567890')

    await user.click(screen.getByRole('button', { name: /create product/i }))

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled()
    })
  })

  it('Given empty fields, When Create clicked, Then validation error shown', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()

    render(
      <ProductCreationForm
        onCreated={onCreated}
        onDuplicateFound={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /create product/i }))

    expect(onCreated).not.toHaveBeenCalled()
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })
})
