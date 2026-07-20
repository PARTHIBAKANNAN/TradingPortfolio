import { useState } from 'react'
import { applySell } from '@shared/calc.ts'
import { formatCurrency, formatNumber, pnlColorClass } from '../../lib/formatters.ts'
import { FormField, NumberInput } from '../shared/FormControls.tsx'

export function SellCalculatorPanel() {
  const [currentQty, setCurrentQty] = useState('')
  const [currentAvg, setCurrentAvg] = useState('')
  const [sellQty, setSellQty] = useState('')
  const [sellPrice, setSellPrice] = useState('')

  const qty = Number(currentQty) || 0
  const avg = Number(currentAvg) || 0
  const nQty = Number(sellQty)
  const nPrice = Number(sellPrice)
  const valid =
    sellQty !== '' &&
    sellPrice !== '' &&
    Number.isFinite(nQty) &&
    Number.isFinite(nPrice) &&
    nQty > 0 &&
    nPrice >= 0 &&
    nQty <= qty

  const exceedsHolding = sellQty !== '' && Number.isFinite(nQty) && nQty > qty

  const result = valid ? applySell({ qty, avgPrice: avg }, nQty, nPrice) : null
  const proceeds = result ? nQty * nPrice : null
  const costBasis = result ? nQty * avg : null

  return (
    <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-5">
      <p className="mb-4 text-sm text-slate-500">
        Work out realized profit/loss and what's left after selling part of a holding. This is a pure calculation —
        it doesn't touch any of your saved holdings.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Current quantity you hold">
          <NumberInput min="0" value={currentQty} onChange={(e) => setCurrentQty(e.target.value)} placeholder="140" />
        </FormField>
        <FormField label="Current average price">
          <NumberInput min="0" value={currentAvg} onChange={(e) => setCurrentAvg(e.target.value)} placeholder="214.64" />
        </FormField>
        <FormField label="Quantity you're selling">
          <NumberInput required min="0" value={sellQty} onChange={(e) => setSellQty(e.target.value)} placeholder="40" />
        </FormField>
        <FormField label="Price you're selling at">
          <NumberInput required min="0" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="290" />
        </FormField>
      </div>

      {exceedsHolding && (
        <p className="mt-3 text-sm text-red-600">Sell quantity can't exceed the {formatNumber(qty)} you hold.</p>
      )}

      {result && (
        <div className="mt-5 space-y-3 rounded-md bg-indigo-50 p-4">
          <div>
            <div className="text-sm text-slate-600">Realized P&amp;L</div>
            <div className={`mt-1 text-2xl font-semibold ${pnlColorClass(result.realizedPnl)}`}>
              {formatCurrency(result.realizedPnl)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Proceeds {formatCurrency(proceeds)} − cost basis {formatCurrency(costBasis)}
            </div>
          </div>
          <div className="border-t border-indigo-100 pt-3">
            <div className="text-sm text-slate-600">Remaining position</div>
            <div className="mt-1 text-lg font-semibold text-indigo-700">
              {formatNumber(result.lot.qty)} qty @ {formatCurrency(result.lot.avgPrice)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Remaining invested: {formatCurrency(result.lot.qty * result.lot.avgPrice)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
