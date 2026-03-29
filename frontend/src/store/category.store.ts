import { atom } from 'jotai'
import type { Category } from '@domain/grocery-list/Category'

export const categoriesAtom = atom<Category[]>([])
export const isCategoryLoadingAtom = atom<boolean>(false)
