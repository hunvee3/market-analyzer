import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'jotai'
import { GroceryListModal } from '@presentation/components/GroceryListModal/GroceryListModal'

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

describe('GroceryListModal (create mode)', () => {
  it('Given name entered and close attempted, When close triggered, Then UnsavedChangesDialog appears', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Provider>
        <GroceryListModal open={true} onClose={onClose} initialList={null} />
      </Provider>,
    )

    await user.type(screen.getByRole('textbox', { name: /list name/i }), 'My New List')
    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/unsaved changes/i).length).toBeGreaterThan(0)
    })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Given unsaved changes dialog, When "Exit Without Saving" selected, Then modal closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Provider>
        <GroceryListModal open={true} onClose={onClose} initialList={null} />
      </Provider>,
    )

    await user.type(screen.getByRole('textbox', { name: /list name/i }), 'My New List')
    await user.click(screen.getByRole('button', { name: /close/i }))
    await screen.findByText('Unsaved Changes')
    await user.click(screen.getByRole('button', { name: /exit without saving/i }))

    expect(onClose).toHaveBeenCalled()
  })
})
