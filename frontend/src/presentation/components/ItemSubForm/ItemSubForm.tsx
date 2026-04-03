import { useState } from 'react'
import { clsx } from 'clsx'
import type { Category } from '@domain/grocery-list/Category'
import { CategoryAutocomplete, createOrReuseCategoryUseCase } from '@presentation/components/CategoryAutocomplete/CategoryAutocomplete'
import { useSetAtom } from 'jotai'
import { categoriesAtom } from '@store/category.store'
import { formContainer, fieldLabel, input, inputError, errorMsg, formActions, btnCancel, btnConfirm } from './ItemSubForm.styles'
import type { NewItemInput } from '@application/grocery-list/use-cases/use-case-types'

interface ItemSubFormProps {
  categories: Category[]
  initialValues?: { name: string; unit: string; category: Category | null; categoryName?: string }
  onConfirm: (item: NewItemInput, categoryName: string) => void
  onCancel: () => void
}

export function ItemSubForm({ onConfirm, onCancel, initialValues }: ItemSubFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [unit, setUnit] = useState(initialValues?.unit ?? '')
  const [category, setCategory] = useState<Category | null>(initialValues?.category ?? null)
  const [categoryInputText, setCategoryInputText] = useState(
    initialValues?.category?.name ?? initialValues?.categoryName ?? '',
  )
  const [attempted, setAttempted] = useState(false)
  const setCategories = useSetAtom(categoriesAtom)

  const nameError = attempted && !name.trim()
  const unitError = attempted && !unit.trim()
  const categoryFilled = !!category || !!categoryInputText.trim()
  const confirmDisabled = !name.trim() || !unit.trim() || !categoryFilled

  async function handleConfirm() {
    setAttempted(true)
    if (!name.trim() || !unit.trim()) return

    let resolvedCategory = category

    if (!resolvedCategory && categoryInputText.trim()) {
      resolvedCategory = await createOrReuseCategoryUseCase.execute({ name: categoryInputText.trim() })
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === resolvedCategory!.id)
        return exists ? prev : [...prev, resolvedCategory!]
      })
      setCategory(resolvedCategory)
    }

    if (!resolvedCategory) return
    onConfirm(
      { name: name.trim(), unit: unit.trim(), categoryId: resolvedCategory.id },
      resolvedCategory.name,
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void handleConfirm()
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

        <div>
          <label htmlFor="item-unit" className={fieldLabel}>Unit</label>
          <input
            id="item-unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            aria-label="Unit"
            placeholder="e.g. kg, L, units"
            className={clsx(input, unitError && inputError)}
          />
          {unitError && <p className={errorMsg}>Unit is required</p>}
        </div>

        <div>
          <label className={fieldLabel}>Category</label>
          <CategoryAutocomplete
            value={category}
            onChange={setCategory}
            inputValue={categoryInputText}
            onInputChange={(text) => {
              setCategoryInputText(text)
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
          >
            Confirm
          </button>
        </div>
      </div>
    </form>
  )
}
