import { useState } from 'react'
import type { OptionType } from '@shared/types.ts'
import { FormField, NumberInput, DateInput, SelectInput, TextInput, PrimaryButton, SecondaryButton } from './FormControls.tsx'

export interface OptionsTradeFormValues {
  underlying: string
  strikePrice: string
  optionType: OptionType
  expiryDate: string
  entryPrice: string
  quantity: string
  entryDate: string
  notes: string
}

const emptyValues: OptionsTradeFormValues = {
  underlying: '',
  strikePrice: '',
  optionType: 'CE',
  expiryDate: '',
  entryPrice: '',
  quantity: '',
  entryDate: new Date().toISOString().slice(0, 10),
  notes: '',
}

export function OptionsTradeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: OptionsTradeFormValues) => Promise<void>
  onCancel?: () => void
}) {
  const [values, setValues] = useState<OptionsTradeFormValues>(emptyValues)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof OptionsTradeFormValues>(key: K, value: OptionsTradeFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      setValues(emptyValues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <FormField label="Underlying">
        <TextInput
          required
          value={values.underlying}
          onChange={(e) => update('underlying', e.target.value.toUpperCase())}
          placeholder="NIFTY"
        />
      </FormField>
      <FormField label="Strike price">
        <NumberInput required min="0" value={values.strikePrice} onChange={(e) => update('strikePrice', e.target.value)} />
      </FormField>
      <FormField label="Type">
        <SelectInput value={values.optionType} onChange={(e) => update('optionType', e.target.value as OptionType)}>
          <option value="CE">CE (Call)</option>
          <option value="PE">PE (Put)</option>
        </SelectInput>
      </FormField>
      <FormField label="Expiry date">
        <DateInput required value={values.expiryDate} onChange={(e) => update('expiryDate', e.target.value)} />
      </FormField>
      <FormField label="Entry price (premium)">
        <NumberInput required min="0" value={values.entryPrice} onChange={(e) => update('entryPrice', e.target.value)} />
      </FormField>
      <FormField label="Quantity (lots x lot size)">
        <NumberInput required min="0" value={values.quantity} onChange={(e) => update('quantity', e.target.value)} />
      </FormField>
      <FormField label="Entry date">
        <DateInput required value={values.entryDate} onChange={(e) => update('entryDate', e.target.value)} />
      </FormField>
      <div className="col-span-2 sm:col-span-4">
        <FormField label="Notes (optional)">
          <TextInput value={values.notes} onChange={(e) => update('notes', e.target.value)} />
        </FormField>
      </div>
      {error && <div className="col-span-2 text-sm text-red-600 sm:col-span-4">{error}</div>}
      <div className="col-span-2 flex gap-2 sm:col-span-4">
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
