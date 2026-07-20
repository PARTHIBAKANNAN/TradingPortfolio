const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return currencyFormatter.format(value)
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return numberFormatter.format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function pnlColorClass(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'text-slate-400'
  if (value > 0) return 'text-emerald-600'
  if (value < 0) return 'text-red-600'
  return 'text-slate-500'
}
