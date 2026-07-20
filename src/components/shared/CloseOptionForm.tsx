import { useState } from 'react'
import { FormField, NumberInput, DateInput, PrimaryButton, SecondaryButton } from './FormControls.tsx'

export function CloseOptionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: { exitPrice: string; exitDate: string }) => Promise<void>
  onCancel: () => void
}) {
  const [exitPrice, setExitPrice] = useState('')
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ exitPrice, exitDate })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close trade')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-md bg-slate-50 p-3">
      <FormField label="Exit price">
        <NumberInput required min="0" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} />
      </FormField>
      <FormField label="Exit date">
        <DateInput required value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
      </FormField>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? 'Closing…' : 'Close trade'}
      </PrimaryButton>
      <SecondaryButton type="button" onClick={onCancel}>
        Cancel
      </SecondaryButton>
    </form>
  )
}
