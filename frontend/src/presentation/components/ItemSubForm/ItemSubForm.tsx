import { useState } from 'react'
import { TextField, Button } from '@mui/material'
import type { Category } from '@domain/grocery-list/Category'
import { CategoryAutocomplete, createOrReuseCategoryUseCase } from '@presentation/components/CategoryAutocomplete/CategoryAutocomplete'
import { useSetAtom } from 'jotai'
import { categoriesAtom } from '@store/category.store'
import { FormContainer, FormActions } from './ItemSubForm.styles'
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
      <FormContainer>
        <TextField
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          helperText={nameError ? 'Item name is required' : undefined}
          inputProps={{ 'aria-label': 'Item Name' }}
          size="small"
          fullWidth
          autoFocus
        />
        <TextField
          label="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          error={unitError}
          helperText={unitError ? 'Unit is required' : undefined}
          inputProps={{ 'aria-label': 'Unit' }}
          size="small"
          fullWidth
        />
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
        <FormActions>
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={confirmDisabled}
            aria-label="Confirm"
          >
            Confirm
          </Button>
        </FormActions>
      </FormContainer>
    </form>
  )
}
