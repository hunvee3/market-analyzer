import { atom } from 'jotai'
import type { Product } from '@domain/purchase/Product'

export const productsAtom = atom<Product[]>([])
export const productSearchQueryAtom = atom('')
