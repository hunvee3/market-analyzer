import { describe, it, expect, beforeEach } from 'vitest'

const STORAGE_KEY = 'smart-basket:v1:grocery-lists'

/**
 * Tests for the LocalStorageGroceryListRepository migration logic.
 * When existing localStorage data lacks the `amount` field or has a free-text
 * `unit` that doesn't match UnitType, the repository must migrate:
 * - Missing `amount` → defaults to 1
 * - Recognized `unit` string → kept as UnitType
 * - Unrecognized `unit` string → defaults to 'units'
 */
describe('LocalStorageGroceryListRepository — GroceryItem migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function seedLegacyData(lists: unknown[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  }

  async function getRepository() {
    const { LocalStorageGroceryListRepository } = await import(
      '@infrastructure/grocery-list/LocalStorageGroceryListRepository'
    )
    return new LocalStorageGroceryListRepository()
  }

  it('Given legacy items without amount, When getAll is called, Then each item has amount: 1', async () => {
    seedLegacyData([
      {
        id: 'list-1',
        name: 'Old List',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        items: [
          { id: 'item-1', name: 'Milk', unit: 'L', categoryId: 'cat-1', position: 0 },
          { id: 'item-2', name: 'Rice', unit: 'kg', categoryId: 'cat-2', position: 1 },
        ],
      },
    ])

    const repo = await getRepository()
    const lists = await repo.getAll()
    expect(lists[0].items[0].amount).toBe(1)
    expect(lists[0].items[1].amount).toBe(1)
  })

  it('Given legacy items with recognized unit strings, When getAll is called, Then unit is preserved as UnitType', async () => {
    seedLegacyData([
      {
        id: 'list-1',
        name: 'List',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        items: [
          { id: 'item-1', name: 'Milk', unit: 'L', categoryId: 'cat-1', position: 0 },
          { id: 'item-2', name: 'Sugar', unit: 'kg', categoryId: 'cat-2', position: 1 },
          { id: 'item-3', name: 'Water', unit: 'mL', categoryId: 'cat-3', position: 2 },
          { id: 'item-4', name: 'Flour', unit: 'g', categoryId: 'cat-2', position: 3 },
          { id: 'item-5', name: 'Eggs', unit: 'units', categoryId: 'cat-4', position: 4 },
        ],
      },
    ])

    const repo = await getRepository()
    const lists = await repo.getAll()
    const units = lists[0].items.map((i) => i.unit)
    expect(units).toEqual(['L', 'kg', 'mL', 'g', 'units'])
  })

  it('Given legacy items with unrecognized unit strings, When getAll is called, Then unit defaults to units', async () => {
    seedLegacyData([
      {
        id: 'list-1',
        name: 'List',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        items: [
          { id: 'item-1', name: 'Bread', unit: 'loaves', categoryId: 'cat-1', position: 0 },
          { id: 'item-2', name: 'Cheese', unit: 'slices', categoryId: 'cat-2', position: 1 },
        ],
      },
    ])

    const repo = await getRepository()
    const lists = await repo.getAll()
    expect(lists[0].items[0].unit).toBe('units')
    expect(lists[0].items[1].unit).toBe('units')
  })

  it('Given items with amount already present, When getAll is called, Then amount is preserved', async () => {
    seedLegacyData([
      {
        id: 'list-1',
        name: 'List',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        items: [
          { id: 'item-1', name: 'Milk', amount: 2.5, unit: 'L', categoryId: 'cat-1', position: 0 },
        ],
      },
    ])

    const repo = await getRepository()
    const lists = await repo.getAll()
    expect(lists[0].items[0].amount).toBe(2.5)
  })

  it('Given a new item is created with amount and UnitType, When create is called, Then item has amount and unit', async () => {
    const repo = await getRepository()
    const created = await repo.create({
      name: 'New List',
      items: [{ name: 'Milk', amount: 2, unit: 'L', categoryId: 'cat-1' }],
    })

    expect(created.items[0].amount).toBe(2)
    expect(created.items[0].unit).toBe('L')
  })
})
