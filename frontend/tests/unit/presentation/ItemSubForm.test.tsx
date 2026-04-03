import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider, createStore } from 'jotai'
import { ItemSubForm } from '@presentation/components/ItemSubForm/ItemSubForm'
import type { Category } from '@domain/grocery-list/Category'
import { categoriesAtom } from '@store/category.store'

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
}))

const dairyCategory: Category = {
  id: 'cat-1',
  name: 'Dairy',
  normalizedName: 'dairy',
  createdAt: '2026-01-01T00:00:00.000Z',
}
const mockCategories: Category[] = [dairyCategory]

describe('ItemSubForm', () => {
  it('Given empty name field, When rendered, Then confirm button is disabled', () => {
    const store = createStore()
    store.set(categoriesAtom, mockCategories)

    render(
      <Provider store={store}>
        <ItemSubForm categories={mockCategories} onConfirm={vi.fn()} onCancel={vi.fn()} />
      </Provider>,
    )

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled()
  })

  it('Given all fields filled (via initialValues), When confirm clicked, Then calls onConfirm with item data', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const store = createStore()
    store.set(categoriesAtom, mockCategories)

    render(
      <Provider store={store}>
        <ItemSubForm
          categories={mockCategories}
          initialValues={{ name: 'Milk', unit: 'L', category: dairyCategory }}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      </Provider>,
    )

    // Confirm button should be enabled with all pre-filled values
    const confirmBtn = screen.getByRole('button', { name: /confirm/i })
    expect(confirmBtn).not.toBeDisabled()

    await user.click(confirmBtn)

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Milk', unit: 'L', categoryId: 'cat-1' }),
      'Dairy',
    )
  })
})
