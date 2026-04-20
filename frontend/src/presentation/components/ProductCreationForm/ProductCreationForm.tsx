import { useState, useEffect, useCallback } from 'react'
import type { Product } from '@domain/purchase/Product'
import { CreateProductUseCase } from '@application/purchase/use-cases/CreateProduct.usecase'
import { SearchProductsUseCase } from '@application/purchase/use-cases/SearchProducts.usecase'
import { ValidationError } from '@application/grocery-list/use-cases/use-case-types'
import { productRepository } from '@di/container'
import {
  formContainer,
  formTitle,
  fieldLabel,
  fieldInput,
  fieldInputError,
  fieldError,
  suggestionsList,
  suggestionItem,
  suggestionName,
  suggestionBarcode,
  formActions,
  btnCancel,
  btnCreate,
  duplicateAlert,
  duplicateText,
  btnUseDuplicate,
} from './ProductCreationForm.styles'

const createProductUseCase = new CreateProductUseCase(productRepository)
const searchProductsUseCase = new SearchProductsUseCase(productRepository)

interface ProductCreationFormProps {
  onCreated: (product: Product) => void
  onDuplicateFound: (product: Product) => void
  onCancel: () => void
  /** Pre-populate the barcode field (e.g., from a previous scan or manual entry) */
  initialBarcode?: string
}

export function ProductCreationForm({ onCreated, onDuplicateFound, onCancel, initialBarcode = '' }: ProductCreationFormProps) {
  const [name, setName] = useState('')
  const [barcode, setBarcode] = useState(initialBarcode)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(null)

  const searchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const results = await searchProductsUseCase.execute({ query, strategy: 'name' })
    setSuggestions(results)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchSuggestions(name)
    }, 300)
    return () => clearTimeout(timer)
  }, [name, searchSuggestions])

  function handleSuggestionSelect(product: Product) {
    onDuplicateFound(product)
  }

  async function handleSubmit() {
    setErrors({})
    setDuplicateProduct(null)

    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!barcode.trim()) newErrors.barcode = 'Barcode is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const result = await createProductUseCase.execute({
        name: name.trim(),
        barcode: barcode.trim(),
      })

      if (result.type === 'duplicate_barcode') {
        setDuplicateProduct(result.existingProduct)
      } else {
        onCreated(result.product)
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        setErrors({ [e.field]: e.message })
      }
    }
  }

  return (
    <div className={formContainer}>
      <h3 className={formTitle}>Create New Product</h3>

      {/* Name field with suggestions */}
      <div>
        <label htmlFor="product-name" className={fieldLabel}>Product Name</label>
        <input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          className={errors.name ? fieldInputError : fieldInput}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        {errors.name && <p className={fieldError}>{errors.name}</p>}
        {suggestions.length > 0 && !duplicateProduct && (
          <div className={suggestionsList} role="list" aria-label="Product suggestions">
            {suggestions.map((product) => (
              <button
                key={product.id}
                className={suggestionItem}
                onClick={() => handleSuggestionSelect(product)}
                role="listitem"
              >
                <div className={suggestionName}>{product.name}</div>
                <div className={suggestionBarcode}>{product.barcode}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Barcode field */}
      <div>
        <label htmlFor="product-barcode" className={fieldLabel}>Barcode</label>
        <input
          id="product-barcode"
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode"
          className={errors.barcode ? fieldInputError : fieldInput}
        />
        {errors.barcode && <p className={fieldError}>{errors.barcode}</p>}
      </div>

      {/* Duplicate barcode alert */}
      {duplicateProduct && (
        <div className={duplicateAlert} role="alert">
          <p className={duplicateText}>
            A product with this barcode already exists: <strong>{duplicateProduct.name}</strong>
          </p>
          <button
            className={btnUseDuplicate}
            onClick={() => onDuplicateFound(duplicateProduct)}
          >
            Use Existing Product
          </button>
        </div>
      )}

      {/* Actions */}
      <div className={formActions}>
        <button className={btnCancel} onClick={onCancel}>
          Cancel
        </button>
        <button className={btnCreate} onClick={() => void handleSubmit()} aria-label="Create Product">
          Create Product
        </button>
      </div>
    </div>
  )
}
