import { useState } from 'react'
import {
  Card,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { format, parseISO } from 'date-fns'
import type { GroceryList } from '@domain/grocery-list/GroceryList'
import { CardActions, CardHeader, DateText } from './GroceryListCard.styles'

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
      <Card>
        <CardContent>
          <CardHeader>
            <Typography variant="h6" component="h2">
              {list.name}
            </Typography>
            <DateText>{formattedDate}</DateText>
          </CardHeader>
          <CardActions>
            <Button size="small" onClick={() => onPurchase(list.id)} aria-label="Purchase">
              Purchase
            </Button>
            <Button size="small" onClick={() => onEdit(list.id)} aria-label="Edit">
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="Delete"
            >
              Delete
            </Button>
          </CardActions>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete List</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{list.name}&quot;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            aria-label="Confirm"
            onClick={() => {
              setDeleteDialogOpen(false)
              onDelete(list.id)
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
