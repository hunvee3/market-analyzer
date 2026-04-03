import { useAtomValue } from 'jotai'
import { purchaseTotalAtom } from '@store/purchase.store'
import { formatPrice } from '@presentation/utils/formatPrice'
import {
  summaryBar,
  totalLabel,
  totalAmount,
  barActions,
  btnExit,
  btnSave,
} from './PurchaseSummaryBar.styles'

interface PurchaseSummaryBarProps {
  onSave: () => void
  onExit: () => void
  saveDisabled?: boolean
}

export function PurchaseSummaryBar({ onSave, onExit, saveDisabled }: PurchaseSummaryBarProps) {
  const total = useAtomValue(purchaseTotalAtom)

  return (
    <div className={summaryBar}>
      <div className="flex items-center">
        <span className={totalLabel}>Total:</span>
        <span className={totalAmount}>{formatPrice(total)}</span>
      </div>
      <div className={barActions}>
        <button className={btnExit} onClick={onExit}>
          Exit
        </button>
        <button
          className={btnSave}
          onClick={onSave}
          disabled={saveDisabled}
        >
          Save
        </button>
      </div>
    </div>
  )
}
