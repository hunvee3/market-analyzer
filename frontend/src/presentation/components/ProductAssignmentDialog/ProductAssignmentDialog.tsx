import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import type { Product } from '@domain/purchase/Product'
import type { UnitType } from '@domain/shared/UnitType'
import type { ProductPriceRecord } from '@domain/purchase/ProductPriceRecord'
import { SearchProductsUseCase } from '@application/purchase/use-cases/SearchProducts.usecase'
import { GetLastProductPriceUseCase } from '@application/purchase/use-cases/GetLastProductPrice.usecase'
import { productRepository, productPriceRecordRepository } from '@di/container'
import { formatPrice } from '@presentation/utils/formatPrice'
import { ProductCreationForm } from '@presentation/components/ProductCreationForm/ProductCreationForm'
import {
  dialogBackdrop,
  dialogContainer,
  dialogPanel,
  dialogHeader,
  dialogTitle,
  searchToggle,
  searchToggleBtn,
  searchToggleActive,
  searchToggleInactive,
  searchInput,
  productList,
  productItem,
  productItemName,
  productItemBarcode,
  emptyState,
  btnCreateProduct,
  formSection,
  fieldLabel,
  input,
  inputError,
  errorMsg,
  historicalPrice,
  histPriceIcon,
  histPriceDisclaimer,
  formActions,
  btnCancel,
  btnConfirm,
} from './ProductAssignmentDialog.styles'

const searchProductsUseCase = new SearchProductsUseCase(productRepository)
const getLastPriceUseCase = new GetLastProductPriceUseCase(productPriceRecordRepository)

interface ProductAssignmentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: { productId: string; productName: string; quantity: number; unit: UnitType; unitPrice: number }) => void
  onCreateNew: () => void
  /** Prefill from GroceryItem */
  prefill?: { amount: number; unit: UnitType }
  /** For edit mode — existing assignment */
  existingAssignment?: {
    productId: string
    productName: string
    quantity: number
    unit: UnitType
    unitPrice: number
  }
}

export function ProductAssignmentDialog({
  open,
  onClose,
  onConfirm,
  onCreateNew,
  prefill,
  existingAssignment,
}: ProductAssignmentDialogProps) {
  const [searchStrategy, setSearchStrategy] = useState<'name' | 'barcode'>('name')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [lastPrice, setLastPrice] = useState<ProductPriceRecord | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const performSearch = useCallback(async (q: string, strategy: 'name' | 'barcode') => {
    const found = await searchProductsUseCase.execute({ query: q, strategy })
    setResults(found)
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults([])
    setLastPrice(null)
    setShowDisclaimer(false)
    setAttempted(false)
    setSearchStrategy('name')
    setShowCreateForm(false)

    if (existingAssignment) {
      setSelectedProduct({ id: existingAssignment.productId, name: existingAssignment.productName, barcode: '', createdAt: '' })
      setQuantity(existingAssignment.quantity.toString())
      setUnitPrice(existingAssignment.unitPrice.toString())
    } else {
      setSelectedProduct(null)
      setQuantity(prefill?.amount?.toString() ?? '1')
      setUnitPrice('')
    }
  }, [open, existingAssignment, prefill])

  useEffect(() => {
    if (!open || selectedProduct) return
    const timer = setTimeout(() => {
      void performSearch(query, searchStrategy)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, searchStrategy, open, selectedProduct, performSearch])

  async function handleSelectProduct(product: Product) {
    setSelectedProduct(product)
    setResults([])
    // Load historical price
    const price = await getLastPriceUseCase.execute({ productId: product.id })
    setLastPrice(price)
  }

  function handleConfirm() {
    setAttempted(true)
    if (!selectedProduct) return
    const qty = parseFloat(quantity)
    const price = parseFloat(unitPrice)
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) return

    onConfirm({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: qty,
      unit: (prefill?.unit ?? 'units') as UnitType,
      unitPrice: price,
    })
  }

  const parsedQty = parseFloat(quantity)
  const parsedPrice = parseFloat(unitPrice)
  const qtyError = attempted && (isNaN(parsedQty) || parsedQty <= 0)
  const priceError = attempted && (isNaN(parsedPrice) || parsedPrice <= 0)

  return (
    <>
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <div className={dialogBackdrop} aria-hidden="true" />
      <div className={dialogContainer}>
        <DialogPanel className={dialogPanel}>
          <div className={dialogHeader}>
            <DialogTitle className={dialogTitle}>
              {existingAssignment ? 'Modify Assignment' : 'Assign Product'}
            </DialogTitle>
            <button aria-label="close" onClick={onClose} className="text-gray-400 hover:text-gray-200 p-1 rounded-lg transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Product Search (hidden when product already selected) */}
          {!selectedProduct && (
            <>
              <div className={searchToggle}>
                <button
                  className={clsx(searchToggleBtn, searchStrategy === 'name' ? searchToggleActive : searchToggleInactive)}
                  onClick={() => setSearchStrategy('name')}
                >
                  By Name
                </button>
                <button
                  className={clsx(searchToggleBtn, searchStrategy === 'barcode' ? searchToggleActive : searchToggleInactive)}
                  onClick={() => setSearchStrategy('barcode')}
                >
                  By Barcode
                </button>
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchStrategy === 'name' ? 'Search product name...' : 'Enter barcode...'}
                aria-label="Search products"
                className={searchInput}
                autoFocus
              />

              <div className={productList} role="list">
                {results.length === 0 && query.trim() ? (
                  <p className={emptyState}>No products found</p>
                ) : (
                  results.map((product) => (
                    <button
                      key={product.id}
                      className={productItem}
                      onClick={() => void handleSelectProduct(product)}
                      role="listitem"
                    >
                      <div className={productItemName}>{product.name}</div>
                      <div className={productItemBarcode}>{product.barcode}</div>
                    </button>
                  ))
                )}
              </div>

              <button className={btnCreateProduct} onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4" />
                Create New Product
              </button>
            </>
          )}

          {/* Product Creation Form — separate modal */}

          {/* Assignment Form (shown when product selected) */}
          {selectedProduct && (
            <div className={formSection}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-100 font-medium">{selectedProduct.name}</span>
                <button
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                  onClick={() => {
                    setSelectedProduct(null)
                    setLastPrice(null)
                  }}
                >
                  Change
                </button>
              </div>

              {lastPrice && (
                <div>
                  <div className={historicalPrice}>
                    <span>Last price: {formatPrice(lastPrice.unitPrice)} ({lastPrice.date})</span>
                    <QuestionMarkCircleIcon
                      className={histPriceIcon}
                      role="button"
                      aria-label="Show price disclaimer"
                      tabIndex={0}
                      onClick={() => setShowDisclaimer((v) => !v)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDisclaimer((v) => !v) } }}
                    />
                  </div>
                  {showDisclaimer && (
                    <p className={histPriceDisclaimer}>
                      Historical prices are for reference only and may not reflect current prices.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="assign-quantity" className={fieldLabel}>Quantity ({prefill?.unit ?? 'units'})</label>
                  <input
                    id="assign-quantity"
                    type="number"
                    min="0.01"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    aria-label="Quantity"
                    aria-invalid={qtyError || undefined}
                    className={clsx(input, qtyError && inputError)}
                  />
                  {qtyError && <p className={errorMsg}>Quantity must be &gt; 0</p>}
                </div>
                <div className="flex-1">
                  <label htmlFor="assign-unit-price" className={fieldLabel}>Unit Price ($)</label>
                  <input
                    id="assign-unit-price"
                    type="number"
                    min="0.01"
                    step="any"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    aria-label="Unit Price"
                    aria-invalid={priceError || undefined}
                    className={clsx(input, priceError && inputError)}
                  />
                  {priceError && <p className={errorMsg}>Price must be &gt; 0</p>}
                </div>
              </div>

              <div className={formActions}>
                <button className={btnCancel} onClick={onClose}>Cancel</button>
                <button
                  className={btnConfirm}
                  onClick={handleConfirm}
                  disabled={!selectedProduct}
                  aria-label="Confirm assignment"
                >
                  {existingAssignment ? 'Update' : 'Assign'}
                </button>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>

    {/* Product Creation Form — separate modal */}
    <Dialog open={showCreateForm && !selectedProduct} onClose={() => setShowCreateForm(false)} className="relative z-[70]">
      <div className={dialogBackdrop} aria-hidden="true" />
      <div className={dialogContainer}>
        <DialogPanel className={dialogPanel}>
          <div className={dialogHeader}>
            <DialogTitle className={dialogTitle}>Create New Product</DialogTitle>
            <button aria-label="close" onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-200 p-1 rounded-lg transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <ProductCreationForm
            onCreated={(product) => {
              setShowCreateForm(false)
              void handleSelectProduct(product)
            }}
            onDuplicateFound={(product) => {
              setShowCreateForm(false)
              void handleSelectProduct(product)
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogPanel>
      </div>
    </Dialog>
    </>
  )
}
