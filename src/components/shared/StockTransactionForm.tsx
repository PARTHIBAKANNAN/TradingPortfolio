import { useState } from 'react'
import type { TradeType } from '@shared/types.ts'
import { FormField, TextInput, NumberInput, DateInput, SelectInput, PrimaryButton, SecondaryButton } from './FormControls.tsx'

export interface StockTransactionFormValues {
  symbol: string
  companyName: string
  tradeType: TradeType
  quantity: string
  price: string
  tradeDate: string
  notes: string
}

const emptyValues: StockTransactionFormValues = {
  symbol: '',
  companyName: '',
  tradeType: 'BUY',
  quantity: '',
  price: '',
  tradeDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

export function StockTransactionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Add transaction',
}: {
  initial?: Partial<StockTransactionFormValues>
  onSubmit: (values: StockTransactionFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}) {
  const [values, setValues] = useState<StockTransactionFormValues>({ ...emptyValues, ...initial })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof StockTransactionFormValues>(key: K, value: StockTransactionFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      setValues({ ...emptyValues, tradeDate: values.tradeDate })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <FormField label="Symbol">
        <TextInput
          required
          value={values.symbol}
          onChange={(e) => update('symbol', e.target.value.toUpperCase())}
          placeholder="TCS"
        />
      </FormField>
      <FormField label="Company name (optional)">
        <TextInput value={values.companyName} onChange={(e) => update('companyName', e.target.value)} />
      </FormField>
      <FormField label="Buy / Sell">
        <SelectInput value={values.tradeType} onChange={(e) => update('tradeType', e.target.value as TradeType)}>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </SelectInput>
      </FormField>
      <FormField label="Quantity">
        <NumberInput required min="0" value={values.quantity} onChange={(e) => update('quantity', e.target.value)} />
      </FormField>
      <FormField label="Price">
        <NumberInput required min="0" value={values.price} onChange={(e) => update('price', e.target.value)} />
      </FormField>
      <FormField label="Trade date">
        <DateInput required value={values.tradeDate} onChange={(e) => update('tradeDate', e.target.value)} />
      </FormField>
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
