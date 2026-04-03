import { useState, useEffect, useCallback } from 'react'
import type { Market } from '@domain/purchase/Market'
import { CreateMarketUseCase } from '@application/purchase/use-cases/CreateMarket.usecase'
import { SearchMarketsUseCase } from '@application/purchase/use-cases/SearchMarkets.usecase'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'
import { marketRepository } from '@di/container'
import {
  formContainer,
  formTitle,
  fieldLabel,
  fieldInput,
  fieldInputError,
  fieldError,
  addressGrid,
  suggestionsList,
  suggestionItem,
  suggestionName,
  suggestionAddress,
  formActions,
  btnCancel,
  btnCreate,
  duplicateAlert,
  duplicateText,
  btnUseDuplicate,
} from './MarketCreationForm.styles'

const createMarketUseCase = new CreateMarketUseCase(marketRepository)
const searchMarketsUseCase = new SearchMarketsUseCase(marketRepository)

interface MarketCreationFormProps {
  onCreated: (market: Market) => void
  onDuplicateFound: (market: Market) => void
  onCancel: () => void
}

export function MarketCreationForm({ onCreated, onDuplicateFound, onCancel }: MarketCreationFormProps) {
  const [name, setName] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Market[]>([])
  const [duplicateMarket, setDuplicateMarket] = useState<Market | null>(null)

  const searchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const results = await searchMarketsUseCase.execute({ query })
    setSuggestions(results)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchSuggestions(name)
    }, 300)
    return () => clearTimeout(timer)
  }, [name, searchSuggestions])

  function formatAddress(market: Market): string {
    const a = market.address
    return [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')
  }

  function handleSuggestionSelect(market: Market) {
    onDuplicateFound(market)
  }

  async function handleSubmit() {
    setErrors({})
    setDuplicateMarket(null)

    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!street.trim()) newErrors.street = 'Street is required'
    if (!city.trim()) newErrors.city = 'City is required'
    if (!state.trim()) newErrors.state = 'State is required'
    if (!zip.trim()) newErrors.zip = 'Zip is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const result = await createMarketUseCase.execute({
        name: name.trim(),
        address: { street: street.trim(), city: city.trim(), state: state.trim(), zip: zip.trim() },
      })

      if (result.type === 'duplicate_address') {
        setDuplicateMarket(result.existingMarket)
      } else {
        onCreated(result.market)
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        setErrors({ [e.field]: e.message })
      }
    }
  }

  return (
    <div className={formContainer}>
      <h3 className={formTitle}>Create New Market</h3>

      {/* Name field with suggestions */}
      <div>
        <label htmlFor="market-name" className={fieldLabel}>Market Name</label>
        <input
          id="market-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter market name"
          className={errors.name ? fieldInputError : fieldInput}
        />
        {errors.name && <p className={fieldError}>{errors.name}</p>}
        {suggestions.length > 0 && !duplicateMarket && (
          <div className={suggestionsList} role="list" aria-label="Market suggestions">
            {suggestions.map((market) => (
              <button
                key={market.id}
                className={suggestionItem}
                onClick={() => handleSuggestionSelect(market)}
                role="listitem"
              >
                <div className={suggestionName}>{market.name}</div>
                <div className={suggestionAddress}>{formatAddress(market)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Address fields */}
      <div>
        <label htmlFor="market-street" className={fieldLabel}>Street</label>
        <input
          id="market-street"
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Street address"
          className={errors.street ? fieldInputError : fieldInput}
        />
        {errors.street && <p className={fieldError}>{errors.street}</p>}
      </div>

      <div className={addressGrid}>
        <div>
          <label htmlFor="market-city" className={fieldLabel}>City</label>
          <input
            id="market-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className={errors.city ? fieldInputError : fieldInput}
          />
          {errors.city && <p className={fieldError}>{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="market-state" className={fieldLabel}>State</label>
          <input
            id="market-state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
            className={errors.state ? fieldInputError : fieldInput}
          />
          {errors.state && <p className={fieldError}>{errors.state}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="market-zip" className={fieldLabel}>Zip</label>
        <input
          id="market-zip"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Zip code"
          className={errors.zip ? fieldInputError : fieldInput}
        />
        {errors.zip && <p className={fieldError}>{errors.zip}</p>}
      </div>

      {/* Duplicate address alert */}
      {duplicateMarket && (
        <div className={duplicateAlert} role="alert">
          <p className={duplicateText}>
            A market already exists at this address: <strong>{duplicateMarket.name}</strong>
          </p>
          <button
            className={btnUseDuplicate}
            onClick={() => onDuplicateFound(duplicateMarket)}
          >
            Use Existing Market
          </button>
        </div>
      )}

      {/* Actions */}
      <div className={formActions}>
        <button className={btnCancel} onClick={onCancel}>
          Cancel
        </button>
        <button className={btnCreate} onClick={() => void handleSubmit()} aria-label="Create Market">
          Create Market
        </button>
      </div>
    </div>
  )
}
