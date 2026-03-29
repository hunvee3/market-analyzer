import { Autocomplete, TextField } from '@mui/material'
import { useAtom } from 'jotai'
import type { Category } from '@domain/grocery-list/Category'
import { categoriesAtom } from '@store/category.store'
import { CreateOrReuseCategoryUseCase } from '@application/grocery-list/use-cases/CreateOrReuseCategory.usecase'
import { categoryRepository } from '@di/container'

const createOrReuseCategoryUseCase = new CreateOrReuseCategoryUseCase(categoryRepository)

interface CategoryAutocompleteProps {
  value: Category | null
  onChange: (category: Category | null) => void
  inputValue?: string
  onInputChange?: (text: string) => void
}

export function CategoryAutocomplete({
  value,
  onChange,
  inputValue,
  onInputChange,
}: CategoryAutocompleteProps) {
  const [categories, setCategories] = useAtom(categoriesAtom)

  async function handleChange(_: React.SyntheticEvent, newValue: Category | string | null) {
    if (!newValue) {
      onChange(null)
      return
    }
    if (typeof newValue !== 'string') {
      onChange(newValue)
      return
    }
    // Free-text confirmed via Enter key
    const category = await createOrReuseCategoryUseCase.execute({ name: newValue })
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id)
      return exists ? prev : [...prev, category]
    })
    onChange(category)
  }

  return (
    <Autocomplete
      value={value}
      inputValue={inputValue}
      onInputChange={(_, text) => onInputChange?.(text)}
      options={categories}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
      freeSolo
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Category"
          inputProps={{ ...params.inputProps, 'aria-label': 'Category' }}
        />
      )}
    />
  )
}

export { createOrReuseCategoryUseCase }
