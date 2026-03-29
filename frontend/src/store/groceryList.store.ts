import { atom } from 'jotai'
import type { GroceryList } from '@domain/grocery-list/GroceryList'

export const groceryListsAtom = atom<GroceryList[]>([])
export const searchQueryAtom = atom<string>('')
export const isLoadingAtom = atom<boolean>(false)
export const activeListAtom = atom<GroceryList | null>(null)

export const filteredListsAtom = atom<GroceryList[]>((get) => {
  const lists = get(groceryListsAtom)
  const query = get(searchQueryAtom).trim().toLowerCase()
  if (!query) return lists
  return lists.filter((list) => list.name.toLowerCase().includes(query))
})
