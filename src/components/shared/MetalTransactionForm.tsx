import { useState } from 'react'
import type { TradeType, MetalType } from '@shared/types.ts'
import { FormField, NumberInput, DateInput, SelectInput, TextInput, PrimaryButton, SecondaryButton } from './FormControls.tsx'

export interface MetalTransactionFormValues {
  metalType: MetalType
  tradeType: TradeType
  quantityGrams: string
  pricePerGram: string
  tax: string
  spreadCharge: string
  otherCharges: string
  tradeDate: string
  notes: string
}

const emptyValues: MetalTransactionFormValues = {
  metalType: 'GOLD',
  tradeType: 'BUY',
  quantityGrams: '',
  pricePerGram: '',
  tax: '',
  spreadCharge: '',
  otherCharges: '',
  tradeDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

export function MetalTransactionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Add transaction',
}: {
  initial?: Partial<MetalTransactionFormValues>
  onSubmit: (values: MetalTransactionFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}) {
  const [values, setValues] = useState<MetalTransactionFormValues>({ ...emptyValues, ...initial })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof MetalTransactionFormValues>(key: K, value: MetalTransactionFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      setValues({ ...emptyValues, tradeDate: values.tradeDate, metalType: values.metalType })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const totalCharges = (Number(values.tax) || 0) + (Number(values.spreadCharge) || 0) + (Number(values.otherCharges) || 0)
  const quantityGrams = Number(values.quantityGrams) || 0
  const effectivePrice = quantityGrams > 0
    ? ((Number(values.pricePerGram) || 0) * quantityGrams + totalCharges) / quantityGrams
    : 0

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <FormField label="Metal">
        <SelectInput value={values.metalType} onChange={(e) => update('metalType', e.target.value as MetalType)}>
          <option value="GOLD">Gold</option>
          <option value="SILVER">Silver</option>
        </SelectInput>
      </FormField>
      <FormField label="Buy / Sell">
        <SelectInput value={values.tradeType} onChange={(e) => update('tradeType', e.target.value as TradeType)}>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </SelectInput>
      </FormField>
      <FormField label="Trade date">
        <DateInput required value={values.tradeDate} onChange={(e) => update('tradeDate', e.target.value)} />
      </FormField>
      <FormField label="Grams">
        <NumberInput required min="0" value={values.quantityGrams} onChange={(e) => update('quantityGrams', e.target.value)} />
      </FormField>
      <FormField label="Price per gram">
        <NumberInput required min="0" value={values.pricePerGram} onChange={(e) => update('pricePerGram', e.target.value)} />
      </FormField>
      <FormField label="Effective price/g">
        <input type="text" disabled value={effectivePrice.toFixed(2)} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" />
      </FormField>

      <div className="col-span-2 sm:col-span-3 border-t border-slate-200 pt-3">
        <h3 className="mb-3 text-xs font-semibold text-slate-500">CHARGES & TAX</h3>
      </div>

      <FormField label="Tax (₹)">
        <NumberInput min="0" step="0.01" value={values.tax} onChange={(e) => update('tax', e.target.value)} />
      </FormField>
      <FormField label="Spread charge (₹)">
        <NumberInput min="0" step="0.01" value={values.spreadCharge} onChange={(e) => update('spreadCharge', e.target.value)} />
      </FormField>
      <FormField label="Other charges (₹)">
        <NumberInput min="0" step="0.01" value={values.otherCharges} onChange={(e) => update('otherCharges', e.target.value)} />
      </FormField>

      <div className="col-span-2 sm:col-span-3 rounded bg-blue-50 p-2">
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Total charges:</span> ₹{totalCharges.toFixed(2)}
        </p>
      </div>

      <div className="col-span-2 sm:col-span-3">
        <FormField label="Notes (optional)">
          <TextInput value={values.notes} onChange={(e) => update('notes', e.target.value)} />
        </FormField>
      </div>
      {error && <div className="col-span-2 text-sm text-red-600 sm:col-span-3">{error}</div>}
      <div className="col-span-2 flex gap-2 sm:col-span-3">
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </PrimaryButton>
        {onCancel && (
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        )}
      </div>
    </form>
  )
}
