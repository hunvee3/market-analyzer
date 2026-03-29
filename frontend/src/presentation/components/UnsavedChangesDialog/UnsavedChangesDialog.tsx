import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

interface UnsavedChangesDialogProps {
  open: boolean
  onClose: () => void
  onSaveAndExit: () => void
  onExitWithoutSaving: () => void
}

export function UnsavedChangesDialog({
  open,
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="unsaved-changes-title">
      <DialogTitle id="unsaved-changes-title">Unsaved Changes</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have unsaved changes. What would you like to do?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onExitWithoutSaving} color="error" aria-label="Exit Without Saving">
          Exit Without Saving
        </Button>
        <Button onClick={onSaveAndExit} variant="contained" aria-label="Save and Exit">
          Save and Exit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
