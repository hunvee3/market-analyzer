import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { format, parseISO } from 'date-fns'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import {
  card,
  cardHeader,
  cardTitle,
  cardDate,
  cardActions,
  btnPurchase,
  btnEdit,
  btnDelete,
  dialogPanel,
  dialogTitle,
  dialogBody,
  dialogActions,
  btnConfirmCancel,
  btnConfirmDelete,
} from './GroceryListCard.styles'

interface GroceryListCardProps {
  list: GroceryList
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPurchase: (id: string) => void
}

export function GroceryListCard({ list, onEdit, onDelete, onPurchase }: GroceryListCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const formattedDate = format(parseISO(list.createdAt), 'dd MMM yyyy')

  return (
    <>
      <article className={card}>
        <div className={cardHeader}>
          <h2 className={cardTitle}>{list.name}</h2>
          <span className={cardDate}>{formattedDate}</span>
        </div>
        <div className={cardActions}>
          <button
            className={btnPurchase}
            onClick={() => onPurchase(list.id)}
            aria-label="Purchase"
          >
            Purchase
          </button>
          <button
            className={btnEdit}
            onClick={() => onEdit(list.id)}
            aria-label="Edit"
          >
            Edit
          </button>
          <button
            className={btnDelete}
            onClick={() => setDeleteDialogOpen(true)}
            aria-label="Delete"
          >
            Delete
          </button>
        </div>
      </article>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        {/* Panel container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className={dialogPanel}>
            <DialogTitle className={dialogTitle}>Delete List</DialogTitle>
            <p className={dialogBody}>
              Are you sure you want to delete &quot;{list.name}&quot;? This cannot be undone.
            </p>
            <div className={dialogActions}>
              <button
                className={btnConfirmCancel}
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className={btnConfirmDelete}
                aria-label="Confirm"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  onDelete(list.id)
                }}
              >
                Confirm
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
