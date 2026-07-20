import { useState } from 'react'
import { FormField, TextInput, NumberInput, DateInput, PrimaryButton, SecondaryButton } from './FormControls.tsx'

export interface ExpenseFormValues {
  expenseDate: string
  category: string
  amount: string
  description: string
  notes: string
}

const emptyValues: ExpenseFormValues = {
  expenseDate: new Date().toISOString().slice(0, 10),
  category: '',
  amount: '',
  description: '',
  notes: '',
}

export function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Add expense',
}: {
  initial?: Partial<ExpenseFormValues>
  onSubmit: (values: ExpenseFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}) {
  const [values, setValues] = useState<ExpenseFormValues>({ ...emptyValues, ...initial })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      setValues({ ...emptyValues, expenseDate: values.expenseDate })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <FormField label="Date">
        <DateInput required value={values.expenseDate} onChange={(e) => update('expenseDate', e.target.value)} />
      </FormField>
      <FormField label="Category">
        <TextInput required value={values.category} onChange={(e) => update('category', e.target.value)} placeholder="Groceries" />
      </FormField>
      <FormField label="Amount">
        <NumberInput required min="0" value={values.amount} onChange={(e) => update('amount', e.target.value)} />
      </FormField>
      <div className="col-span-2 sm:col-span-3">
        <FormField label="Description (optional)">
          <TextInput value={values.description} onChange={(e) => update('description', e.target.value)} />
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
