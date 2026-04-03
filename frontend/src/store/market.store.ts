import { atom } from 'jotai'
import type { Market } from '@domain/purchase/Market'

export const marketsAtom = atom<Market[]>([])
export const marketSearchQueryAtom = atom('')
