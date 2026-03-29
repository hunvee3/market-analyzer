import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  Box,
  Collapse,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useAtom, useSetAtom } from 'jotai'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import type { NewItemInput } from '@application/grocery-list/use-cases/use-case-types'
import { ItemSubForm } from '@presentation/components/ItemSubForm/ItemSubForm'
import { UnsavedChangesDialog } from '@presentation/components/UnsavedChangesDialog/UnsavedChangesDialog'
import { groceryListsAtom } from '@store/groceryList.store'
import { categoriesAtom } from '@store/category.store'
import { CreateGroceryListUseCase } from '@application/grocery-list/use-cases/CreateGroceryList.usecase'
import { UpdateGroceryListUseCase } from '@application/grocery-list/use-cases/UpdateGroceryList.usecase'
import { GetAllCategoriesUseCase } from '@application/grocery-list/use-cases/GetAllCategories.usecase'
import { groceryListRepository, categoryRepository } from '@di/container'
import { useSnackbar } from '@presentation/context/SnackbarContext'
import {
  ModalContent,
  ItemsSection,
  CategoryGroup,
  CategoryHeader,
  ItemRow,
  ItemActions,
} from './GroceryListModal.styles'

const createListUseCase = new CreateGroceryListUseCase(groceryListRepository)
const updateListUseCase = new UpdateGroceryListUseCase(groceryListRepository)
const getAllCategoriesUseCase = new GetAllCategoriesUseCase(categoryRepository)

const CATEGORY_COLORS = [
  '#1976d2',
  '#7b1fa2',
  '#2e7d32',
  '#e65100',
  '#c62828',
  '#00838f',
  '#ad1457',
  '#558b2f',
  '#f57f17',
  '#4527a0',
]

function getCategoryColor(categoryName: string, allCategoryNames: string[]): string {
  const index = allCategoryNames.indexOf(categoryName)
  return CATEGORY_COLORS[(index < 0 ? 0 : index) % CATEGORY_COLORS.length]
}

interface PendingItem {
  id: string
  name: string
  unit: string
  categoryId: string
  categoryName: string
}

interface GroceryListModalProps {
  open: boolean
  onClose: () => void
  initialList: GroceryList | null
}

export function GroceryListModal({ open, onClose, initialList }: GroceryListModalProps) {
  const isEdit = initialList !== null
  const { showError } = useSnackbar()

  const setLists = useSetAtom(groceryListsAtom)
  // Single source of truth — categoriesAtom is updated by CategoryAutocomplete and ItemSubForm
  const [categories, setCategories] = useAtom(categoriesAtom)

  const [name, setName] = useState(initialList?.name ?? '')
  const [items, setItems] = useState<PendingItem[]>([])
  const [addingItem, setAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [nameError, setNameError] = useState(false)
  const [itemsError, setItemsError] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const isDirty = name !== (initialList?.name ?? '') || items.length > 0

  useEffect(() => {
    if (!open) return
    setName(initialList?.name ?? '')
    setNameError(false)
    setItemsError(false)
    setAddingItem(false)
    setEditingItemId(null)
    setUnsavedDialogOpen(false)
    setItems([])

    getAllCategoriesUseCase.execute().then((cats) => {
      setCategories(cats)

      if (initialList && initialList.items.length > 0) {
        setItems(
          initialList.items.map((item) => {
            const cat = cats.find((c) => c.id === item.categoryId)
            return {
              id: item.id,
              name: item.name,
              unit: item.unit,
              categoryId: item.categoryId,
              categoryName: cat?.name ?? item.categoryId,
            }
          }),
        )
      }
    }).catch(() => {/* no-op */})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialList])

  // Stable ordered list of unique category names for color assignment
  const categoryNames = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const item of items) {
      if (!seen.has(item.categoryName)) {
        seen.add(item.categoryName)
        ordered.push(item.categoryName)
      }
    }
    return ordered
  }, [items])

  const groupedItems = useMemo(() => {
    const groups = new Map<string, PendingItem[]>()
    for (const item of items) {
      const group = groups.get(item.categoryName) ?? []
      group.push(item)
      groups.set(item.categoryName, group)
    }
    return groups
  }, [items])

  function handleCloseAttempt() {
    if (isDirty) {
      setUnsavedDialogOpen(true)
    } else {
      onClose()
    }
  }

  function handleExitWithoutSaving() {
    setUnsavedDialogOpen(false)
    onClose()
  }

  async function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(true)
      return
    }
    if (items.length === 0) {
      setItemsError(true)
      return
    }
    const newItems: NewItemInput[] = items.map((item) => ({
      name: item.name,
      unit: item.unit,
      categoryId: item.categoryId,
    }))

    try {
      if (isEdit && initialList) {
        const updated = await updateListUseCase.execute({
          id: initialList.id,
          name: trimmedName,
          items: newItems,
        })
        setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      } else {
        const created = await createListUseCase.execute({ name: trimmedName, items: newItems })
        setLists((prev) => [created, ...prev])
      }
      onClose()
    } catch {
      showError('Failed to save grocery list.')
    }
  }

  async function handleSaveAndExit() {
    setUnsavedDialogOpen(false)
    await handleSave()
  }

  function handleItemConfirm(newItem: NewItemInput, categoryName: string) {
    if (editingItemId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId ? { ...item, ...newItem, categoryName } : item,
        ),
      )
      setEditingItemId(null)
    } else {
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ...newItem, categoryName },
      ])
    }
    setAddingItem(false)
    setItemsError(false)
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleEditItem(id: string) {
    setEditingItemId(id)
    setAddingItem(true)
  }

  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null
  // Look up from categoriesAtom (always up to date, including newly created categories)
  const editingCategory = editingItem
    ? (categories.find((c) => c.id === editingItem.categoryId) ?? null)
    : null

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseAttempt}
        fullScreen
        aria-labelledby="list-modal-title"
      >
        <DialogTitle
          id="list-modal-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
        >
          <Typography variant="h6" component="span">
            {isEdit ? 'Edit Grocery List' : 'Create Grocery List'}
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseAttempt} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <ModalContent>
            <TextField
              label="List Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameError(false)
              }}
              error={nameError}
              helperText={nameError ? 'List name is required' : undefined}
              inputProps={{ 'aria-label': 'List Name' }}
              fullWidth
              autoFocus
            />

            <ItemsSection>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Items
                </Typography>
                {items.length > 0 && (
                  <Chip label={items.length} size="small" color="primary" />
                )}
              </Box>

              {itemsError && (
                <Typography color="error" variant="body2">
                  At least one item is required
                </Typography>
              )}

              {Array.from(groupedItems.entries()).map(([categoryName, catItems]) => {
                const color = getCategoryColor(categoryName, categoryNames)
                const isCollapsed = collapsedCategories.has(categoryName)
                return (
                  <CategoryGroup key={categoryName}>
                    <CategoryHeader
                      onClick={() => setCollapsedCategories((prev) => {
                        const next = new Set(prev)
                        if (next.has(categoryName)) next.delete(categoryName)
                        else next.add(categoryName)
                        return next
                      })}
                    >
                      <Chip
                        label={categoryName}
                        size="small"
                        sx={{
                          bgcolor: color,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          pointerEvents: 'none',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        {catItems.length}
                      </Typography>
                      <Box sx={{ ml: 'auto', display: 'flex', color: 'text.secondary' }}>
                        {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
                      </Box>
                    </CategoryHeader>
                    <Collapse in={!isCollapsed}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {catItems.map((item) => (
                        <ItemRow key={item.id} $accentColor={color}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.unit}
                            </Typography>
                          </Box>
                          <ItemActions>
                            <IconButton
                              size="small"
                              aria-label="Edit item"
                              onClick={(e) => { e.stopPropagation(); handleEditItem(item.id) }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Remove item"
                              color="error"
                              onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id) }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ItemActions>
                        </ItemRow>
                      ))}
                      </Box>
                    </Collapse>
                  </CategoryGroup>
                )
              })}

              <Button
                variant="outlined"
                size="small"
                onClick={() => setAddingItem(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                + Add item
              </Button>
            </ItemsSection>
          </ModalContent>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAttempt}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addingItem}
        onClose={() => { setAddingItem(false); setEditingItemId(null) }}
        fullWidth
        maxWidth="sm"
        aria-labelledby="item-form-title"
      >
        <DialogTitle id="item-form-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" component="span">
            {editingItemId ? 'Edit Item' : 'Add Item'}
          </Typography>
          <IconButton aria-label="close" onClick={() => { setAddingItem(false); setEditingItemId(null) }} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <ItemSubForm
              categories={categories}
              initialValues={
                editingItem
                  ? {
                      name: editingItem.name,
                      unit: editingItem.unit,
                      category: editingCategory,
                      categoryName: editingItem.categoryName,
                    }
                  : undefined
              }
              onConfirm={(item, categoryName) => {
                handleItemConfirm(item, categoryName)
              }}
              onCancel={() => {
                setAddingItem(false)
                setEditingItemId(null)
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onClose={() => setUnsavedDialogOpen(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
      />
    </>
  )
}
