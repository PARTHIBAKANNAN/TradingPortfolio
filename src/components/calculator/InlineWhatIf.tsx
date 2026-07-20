import { useState } from 'react'
import type { HoldingSummary } from '@shared/types.ts'
import { applyBuy } from '@shared/calc.ts'
import { formatCurrency, formatNumber } from '../../lib/formatters.ts'
import { NumberInput, PrimaryButton } from '../shared/FormControls.tsx'

export function InlineWhatIf({
  holding,
  onApply,
}: {
  holding: HoldingSummary
  onApply?: (qty: number, price: number) => Promise<void>
}) {
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [applying, setApplying] = useState(false)

  const buyQty = Number(qty)
  const buyPrice = Number(price)
  const valid = qty !== '' && price !== '' && Number.isFinite(buyQty) && Number.isFinite(buyPrice) && buyQty > 0 && buyPrice >= 0

  const result = valid ? applyBuy({ qty: holding.quantity, avgPrice: holding.avgPrice }, buyQty, buyPrice) : null

  const handleApply = async () => {
    if (!valid || !onApply) return
    setApplying(true)
    try {
      await onApply(buyQty, buyPrice)
      setQty('')
      setPrice('')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="text-xs text-slate-500">
        Current: {formatNumber(holding.quantity)} @ {formatCurrency(holding.avgPrice)}
      </div>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-slate-600">Add qty</span>
        <NumberInput className="w-24" value={qty} onChange={(e) => setQty(e.target.value)} min="0" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-slate-600">At price</span>
        <NumberInput className="w-28" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
      </label>
      {result && (
        <div className="text-sm">
          New avg: <span className="font-semibold text-indigo-700">{formatCurrency(result.avgPrice)}</span>{' '}
          <span className="text-slate-500">({formatNumber(result.qty)} qty)</span>
        </div>
      )}
      {onApply && (
        <PrimaryButton type="button" disabled={!valid || applying} onClick={handleApply} className="px-3 py-1 text-xs">
          {applying ? 'Applying…' : 'Apply as real buy'}
        </PrimaryButton>
      )}
    </div>
  )
}
