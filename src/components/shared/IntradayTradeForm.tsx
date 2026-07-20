import { useState } from 'react'
import { FormField, TextInput, NumberInput, DateInput, PrimaryButton, SecondaryButton } from './FormControls.tsx'

export interface IntradayTradeFormValues {
  symbol: string
  buyPrice: string
  sellPrice: string
  quantity: string
  tradeDate: string
  notes: string
}

const emptyValues: IntradayTradeFormValues = {
  symbol: '',
  buyPrice: '',
  sellPrice: '',
  quantity: '',
  tradeDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

export function IntradayTradeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: IntradayTradeFormValues) => Promise<void>
  onCancel?: () => void
}) {
  const [values, setValues] = useState<IntradayTradeFormValues>(emptyValues)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof IntradayTradeFormValues>(key: K, value: IntradayTradeFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      setValues({ ...emptyValues, tradeDate: values.tradeDate })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <FormField label="Symbol">
        <TextInput required value={values.symbol} onChange={(e) => update('symbol', e.target.value.toUpperCase())} />
      </FormField>
      <FormField label="Buy price">
        <NumberInput required min="0" value={values.buyPrice} onChange={(e) => update('buyPrice', e.target.value)} />
      </FormField>
      <FormField label="Sell price">
        <NumberInput required min="0" value={values.sellPrice} onChange={(e) => update('sellPrice', e.target.value)} />
      </FormField>
      <FormField label="Quantity">
        <NumberInput required min="0" value={values.quantity} onChange={(e) => update('quantity', e.target.value)} />
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
          {submitting ? 'Saving…' : 'Add trade'}
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
