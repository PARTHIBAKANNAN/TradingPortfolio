export function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type RangePreset =
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'allTime'

export interface DateRange {
  from: string
  to: string
}

const ALL_TIME_START = '1970-01-01'

export function getPresetRange(preset: RangePreset, now: Date = new Date()): DateRange {
  const today = toISODate(now)
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'thisWeek': {
      const day = now.getDay() // 0 = Sunday
      const mondayOffset = day === 0 ? 6 : day - 1
      const monday = new Date(now)
      monday.setDate(now.getDate() - mondayOffset)
      return { from: toISODate(monday), to: today }
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: toISODate(start), to: today }
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: toISODate(start), to: toISODate(end) }
    }
    case 'thisQuarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      const start = new Date(now.getFullYear(), quarterStartMonth, 1)
      return { from: toISODate(start), to: today }
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { from: toISODate(start), to: today }
    }
    case 'allTime':
      return { from: ALL_TIME_START, to: today }
  }
}

export const RANGE_PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisQuarter: 'This Quarter',
  thisYear: 'This Year',
  allTime: 'All Time',
}
