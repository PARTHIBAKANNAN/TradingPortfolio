import { useState } from 'react'
import { applyBuy } from '@shared/calc.ts'
import { formatCurrency, formatNumber } from '../../lib/formatters.ts'
import { FormField, NumberInput } from '../shared/FormControls.tsx'

export function CalculatorPanel() {
  const [currentQty, setCurrentQty] = useState('')
  const [currentAvg, setCurrentAvg] = useState('')
  const [buyQty, setBuyQty] = useState('')
  const [buyPrice, setBuyPrice] = useState('')

  const qty = Number(currentQty) || 0
  const avg = Number(currentAvg) || 0
  const nQty = Number(buyQty)
  const nPrice = Number(buyPrice)
  const valid = buyQty !== '' && buyPrice !== '' && Number.isFinite(nQty) && Number.isFinite(nPrice) && nQty > 0 && nPrice >= 0

  const result = valid ? applyBuy({ qty, avgPrice: avg }, nQty, nPrice) : null

  return (
    <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm text-slate-500">
        Work out your new weighted-average buy price after adding more quantity at a different price. This is a
        pure calculation — it doesn't touch any of your saved holdings.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Current quantity you hold">
          <NumberInput min="0" value={currentQty} onChange={(e) => setCurrentQty(e.target.value)} placeholder="5" />
        </FormField>
        <FormField label="Current average price">
          <NumberInput min="0" value={currentAvg} onChange={(e) => setCurrentAvg(e.target.value)} placeholder="2200" />
        </FormField>
        <FormField label="Quantity you're adding">
          <NumberInput required min="0" value={buyQty} onChange={(e) => setBuyQty(e.target.value)} placeholder="3" />
        </FormField>
        <FormField label="Price you're buying at">
          <NumberInput required min="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="2100" />
        </FormField>
      </div>
      {result && (
        <div className="mt-5 rounded-md bg-indigo-50 p-4">
          <div className="text-sm text-slate-600">New position</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-700">
            {formatNumber(result.qty)} qty @ {formatCurrency(result.avgPrice)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Total invested: {formatCurrency(result.qty * result.avgPrice)}
          </div>
        </div>
      )}
    </div>
  )
}
