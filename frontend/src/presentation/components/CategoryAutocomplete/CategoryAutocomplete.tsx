import { useState } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import type { Category } from '@domain/grocery-list/Category'
import { categoriesAtom } from '@store/category.store'
import { CreateOrReuseCategoryUseCase } from '@application/grocery-list/use-cases/CreateOrReuseCategory.usecase'
import { categoryRepository } from '@di/container'

export const createOrReuseCategoryUseCase = new CreateOrReuseCategoryUseCase(categoryRepository)

const inputCls =
  'w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 pr-10 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

const optionsCls =
  'absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-auto max-h-48 py-1 text-sm'

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
  const [query, setQuery] = useState(inputValue ?? '')

  const filtered =
    query.trim() === ''
      ? categories
      : categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))

  async function handleSelect(cat: Category) {
    onChange(cat)
    onInputChange?.(cat.name)
  }

  return (
    <div className="relative">
      <Combobox value={value} onChange={handleSelect}>
        <div className="relative">
          <ComboboxInput
            aria-label="Category"
            className={inputCls}
            displayValue={(cat: Category | null) => cat?.name ?? ''}
            placeholder="Category"
            onChange={(e) => {
              const text = e.target.value
              setQuery(text)
              onInputChange?.(text)
              if (value && text.toLowerCase() !== value.name.toLowerCase()) {
                onChange(null)
              }
            }}
          />
          <ComboboxButton className="absolute inset-y-0 right-2 flex items-center px-1 text-gray-400 hover:text-gray-200 transition-colors">
            <ChevronUpDownIcon className="h-4 w-4" aria-hidden="true" />
          </ComboboxButton>
        </div>
        {filtered.length > 0 && (
          <ComboboxOptions className={optionsCls}>
            {filtered.map((cat) => (
              <ComboboxOption
                key={cat.id}
                value={cat}
                className={({ focus }: { focus: boolean }) =>
                  `flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${
                    focus ? 'bg-indigo-600/30 text-indigo-200' : 'text-gray-200'
                  }`
                }
                onClick={async () => {
                  const resolved = await createOrReuseCategoryUseCase.execute({ name: cat.name })
                  setCategories((prev) => {
                    const exists = prev.some((c) => c.id === resolved.id)
                    return exists ? prev : [...prev, resolved]
                  })
                }}
              >
                {({ selected }: { selected: boolean }) => (
                  <>
                    {selected ? (
                      <CheckIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                    {cat.name}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  )
}
