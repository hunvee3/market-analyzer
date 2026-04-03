import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GroceryListCard } from '@presentation/components/GroceryListCard/GroceryListCard'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

const mockList: GroceryList = {
  id: 'list-1',
  name: 'Weekly Shopping',
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-15T10:00:00.000Z',
  items: [],
}

describe('GroceryListCard', () => {
  it('Given a GroceryList prop, When rendered, Then displays list name and formatted creation date', () => {
    render(
      <GroceryListCard
        list={mockList}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPurchase={vi.fn()}
      />,
    )

    expect(screen.getByText('Weekly Shopping')).toBeInTheDocument()
    expect(screen.getByText('15 Mar 2026')).toBeInTheDocument()
  })

  it('Given Delete clicked and confirmed, When confirmation dialog confirmed, Then calls onDelete callback', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <GroceryListCard
        list={mockList}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onPurchase={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith('list-1')
  })

  it('Given Purchase clicked, Then calls onPurchase callback', async () => {
    const user = userEvent.setup()
    const onPurchase = vi.fn()

    render(
      <GroceryListCard
        list={mockList}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPurchase={onPurchase}
      />,
    )

    await user.click(screen.getByRole('button', { name: /purchase/i }))

    expect(onPurchase).toHaveBeenCalledOnce()
    expect(onPurchase).toHaveBeenCalledWith('list-1')
  })
})
