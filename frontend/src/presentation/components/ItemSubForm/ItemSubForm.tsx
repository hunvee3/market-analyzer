import { useState, useRef } from 'react'
import { clsx } from 'clsx'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import type { Category } from '@domain/grocery-list/Category'
import type { UnitType } from '@domain/shared/UnitType'
import { UNIT_OPTIONS } from '@domain/shared/UnitType'
import { CategoryAutocomplete, createOrReuseCategoryUseCase } from '@presentation/components/CategoryAutocomplete/CategoryAutocomplete'
import { useSetAtom } from 'jotai'
import { categoriesAtom } from '@store/category.store'
import { formContainer, fieldLabel, input, inputError, errorMsg, formActions, btnCancel, btnConfirm } from './ItemSubForm.styles'
import type { NewItemInput } from '@application/grocery-list/use-cases/use-case-types'

interface ItemSubFormProps {
  categories: Category[]
  initialValues?: { name: string; amount: number; unit: UnitType; category: Category | null; categoryName?: string }
  onConfirm: (item: NewItemInput, categoryName: string) => void
  onCancel: () => void
}

export function ItemSubForm({ onConfirm, onCancel, initialValues }: ItemSubFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [amount, setAmount] = useState<string>(initialValues?.amount?.toString() ?? '1')
  const [unit, setUnit] = useState<UnitType>(initialValues?.unit ?? 'units')
  const [category, setCategory] = useState<Category | null>(initialValues?.category ?? null)
  const [categoryInputText, setCategoryInputText] = useState(
    initialValues?.category?.name ?? initialValues?.categoryName ?? '',
  )
  const categoryInputTextRef = useRef(categoryInputText)
  const [attempted, setAttempted] = useState(false)
  const setCategories = useSetAtom(categoriesAtom)

  const parsedAmount = parseFloat(amount)
  const nameError = attempted && !name.trim()
  const amountError = attempted && (isNaN(parsedAmount) || parsedAmount <= 0)
  const categoryFilled = !!category || !!categoryInputText.trim() || !!categoryInputTextRef.current.trim()
  const confirmDisabled = !name.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryFilled

  async function handleConfirm() {
    setAttempted(true)
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      return
    }

    let resolvedCategory = category
    const catText = categoryInputText || categoryInputTextRef.current

    if (!resolvedCategory && catText.trim()) {
      try {
        resolvedCategory = await createOrReuseCategoryUseCase.execute({ name: catText.trim() })
        setCategories((prev) => {
          const exists = prev.some((c) => c.id === resolvedCategory!.id)
          return exists ? prev : [...prev, resolvedCategory!]
        })
        setCategory(resolvedCategory)
      } catch {
        return
      }
    }

    if (!resolvedCategory) {
      return
    }
    onConfirm(
      { name: name.trim(), amount: parsedAmount, unit, categoryId: resolvedCategory.id },
      resolvedCategory.name,
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleConfirm()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={formContainer}>
        <div>
          <label htmlFor="item-name" className={fieldLabel}>Item Name</label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Item Name"
            placeholder="e.g. Milk"
            autoFocus
            className={clsx(input, nameError && inputError)}
          />
          {nameError && <p className={errorMsg}>Item name is required</p>}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="item-amount" className={fieldLabel}>Amount</label>
            <input
              id="item-amount"
              type="number"
              min="0.01"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount"
              placeholder="1"
              className={clsx(input, amountError && inputError)}
            />
            {amountError && <p className={errorMsg}>Amount must be greater than 0</p>}
          </div>

          <div className="flex-1">
            <label className={fieldLabel}>Unit</label>
            <Listbox value={unit} onChange={setUnit}>
              <ListboxButton
                className={clsx(input, 'flex items-center justify-between')}
                aria-label="Unit"
              >
                <span>{UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? unit}</span>
                <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
              </ListboxButton>
              <ListboxOptions className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-gray-900 border border-gray-700 shadow-lg py-1 text-sm">
                {UNIT_OPTIONS.map((opt) => (
                  <ListboxOption
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer select-none px-4 py-2 text-gray-100 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                  >
                    {opt.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Category</label>
          <CategoryAutocomplete
            value={category}
            onChange={(cat) => {
              setCategory(cat)
            }}
            inputValue={categoryInputText}
            onInputChange={(text) => {
              setCategoryInputText(text)
              categoryInputTextRef.current = text
              if (category && text.toLowerCase() !== category.name.toLowerCase()) {
                setCategory(null)
              }
            }}
          />
        </div>

        <div className={formActions}>
          <button type="button" className={btnCancel} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className={btnConfirm}
            disabled={confirmDisabled}
            aria-label="Confirm"
            onPointerDown={(e) => {
              e.preventDefault()
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </form>
  )
}
