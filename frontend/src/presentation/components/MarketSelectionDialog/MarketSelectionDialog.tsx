import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useSetAtom } from 'jotai'
import type { Market } from '@domain/purchase/Market'
import { SearchMarketsUseCase } from '@application/purchase/use-cases/SearchMarkets.usecase'
import { marketRepository } from '@di/container'
import { marketsAtom } from '@store/market.store'
import { MarketCreationForm } from '@presentation/components/MarketCreationForm/MarketCreationForm'
import {
  dialogBackdrop,
  dialogContainer,
  dialogPanel,
  dialogHeader,
  dialogTitle,
  searchInput,
  marketList,
  marketItem,
  marketItemName,
  marketItemAddress,
  emptyState,
  btnCreateMarket,
} from './MarketSelectionDialog.styles'

const searchMarketsUseCase = new SearchMarketsUseCase(marketRepository)

interface MarketSelectionDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (market: Market) => void
  onCreateNew: () => void
}

export function MarketSelectionDialog({ open, onClose, onSelect, onCreateNew }: MarketSelectionDialogProps) {
  const setMarkets = useSetAtom(marketsAtom)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Market[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const performSearch = useCallback(async (searchQuery: string) => {
    const found = await searchMarketsUseCase.execute({ query: searchQuery })
    setResults(found)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setShowCreateForm(false)
    // Load all markets on open
    searchMarketsUseCase.execute({ query: '' }).then((all) => {
      setMarkets(all)
      setResults(all)
    }).catch(() => {/* no-op */})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      void performSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, open, performSearch])

  function formatAddress(market: Market): string {
    const a = market.address
    return [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className={dialogBackdrop} aria-hidden="true" />
      <div className={dialogContainer}>
        <DialogPanel className={dialogPanel}>
          <div className={dialogHeader}>
            <DialogTitle className={dialogTitle}>Select a Market</DialogTitle>
            <button
              aria-label="close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 p-1 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {showCreateForm ? (
            <MarketCreationForm
              onCreated={(market) => {
                setShowCreateForm(false)
                setMarkets((prev) => [...prev, market])
                onSelect(market)
              }}
              onDuplicateFound={(market) => {
                setShowCreateForm(false)
                onSelect(market)
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search markets..."
                aria-label="Search markets"
                className={searchInput}
                autoFocus
              />

              <div className={marketList} role="list">
                {results.length === 0 && query.trim() ? (
                  <p className={emptyState}>No markets found</p>
                ) : (
                  results.map((market) => (
                    <button
                      key={market.id}
                      className={marketItem}
                      onClick={() => onSelect(market)}
                      role="listitem"
                    >
                      <div className={marketItemName}>{market.name}</div>
                      <div className={marketItemAddress}>{formatAddress(market)}</div>
                    </button>
                  ))
                )}
              </div>

              <button className={btnCreateMarket} onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4" />
                Create New Market
              </button>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
