import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

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
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6 flex flex-col gap-4">
          <DialogTitle className="text-base font-semibold text-gray-100">
            Unsaved Changes
          </DialogTitle>
          <p className="text-sm text-gray-300 leading-relaxed">
            You have unsaved changes. What would you like to do?
          </p>
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={onExitWithoutSaving}
              aria-label="Exit Without Saving"
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-red-400 bg-red-900/30 hover:bg-red-900/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Exit Without Saving
            </button>
            <button
              onClick={onSaveAndExit}
              aria-label="Save and Exit"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Save and Exit
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
