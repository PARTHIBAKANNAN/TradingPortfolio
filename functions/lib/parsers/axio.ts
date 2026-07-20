import { parseCsv, rowsToObjects, type RowError } from '../csv.ts'
import type { CreateExpenseInput } from '../db.ts'

// Placeholder column layout — swap these aliases once a real Axio emailed
// export is available.
const ALIASES: Record<string, string[]> = {
  expenseDate: ['Date', 'Transaction Date', 'Txn Date'],
  category: ['Category', 'Tag'],
  amount: ['Amount', 'Debit', 'Value'],
  description: ['Description', 'Merchant', 'Narration'],
}

function findColumn(header: string[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    const match = header.find((h) => h.toLowerCase() === candidate.toLowerCase())
    if (match) return match
  }
  return null
}

export function parseAxioCsv(text: string): {
  rows: CreateExpenseInput[]
  errors: RowError[]
} {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return { rows: [], errors: [{ row: 0, message: 'Empty file' }] }
  const { header, records } = rowsToObjects(parsed)

  const columns = {
    expenseDate: findColumn(header, ALIASES.expenseDate),
    category: findColumn(header, ALIASES.category),
    amount: findColumn(header, ALIASES.amount),
    description: findColumn(header, ALIASES.description),
  }

  const missing = (['expenseDate', 'amount'] as const).filter((key) => !columns[key])
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 0,
          message: `Could not find expected columns: ${missing.join(', ')}. Update functions/lib/parsers/axio.ts with your file's actual column names.`,
        },
      ],
    }
  }

  const rows: CreateExpenseInput[] = []
  const errors: RowError[] = []
  records.forEach((record, idx) => {
    const rowNum = idx + 2
    const expenseDate = record[columns.expenseDate!]
    const amount = Number(record[columns.amount!])

    if (!expenseDate) {
      errors.push({ row: rowNum, message: 'Missing date' })
      return
    }
    if (!Number.isFinite(amount) || amount < 0) {
      errors.push({ row: rowNum, message: `Invalid amount: "${record[columns.amount!]}"` })
      return
    }

    rows.push({
      expenseDate,
      category: columns.category ? record[columns.category] || 'Uncategorized' : 'Uncategorized',
      amount,
      description: columns.description ? record[columns.description] : null,
      source: 'csv_axio',
    })
  })

  return { rows, errors }
}
