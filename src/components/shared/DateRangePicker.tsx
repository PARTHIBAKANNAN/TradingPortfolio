import { getPresetRange, RANGE_PRESET_LABELS, type RangePreset } from '@shared/dateUtils.ts'
import { DateInput } from './FormControls.tsx'

const PRESETS: RangePreset[] = ['today', 'thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'thisYear', 'allTime']

export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => {
          const range = getPresetRange(preset)
          const active = range.from === from && range.to === to
          return (
            <button
              key={preset}
              onClick={() => onChange(range.from, range.to)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {RANGE_PRESET_LABELS[preset]}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <DateInput value={from} onChange={(e) => onChange(e.target.value, to)} />
        <span className="text-slate-400">to</span>
        <DateInput value={to} onChange={(e) => onChange(from, e.target.value)} />
      </div>
    </div>
  )
}

