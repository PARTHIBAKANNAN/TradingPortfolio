import { pnlColorClass } from '../../lib/formatters.ts'

export function StatTile({
  label,
  value,
  colorByValue = false,
  sub,
}: {
  label: string
  value: string
  colorByValue?: boolean
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${colorByValue ? pnlColorClass(parseFloat(value.replace(/[^0-9.-]/g, ''))) : 'text-slate-800'}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}
