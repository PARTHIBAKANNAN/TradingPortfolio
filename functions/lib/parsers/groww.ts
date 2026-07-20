import { parseCsv, rowsToObjects, type RowError } from '../csv.ts'
import type { CreateStockTxInput } from '../db.ts'

// Placeholder column layout — swap these aliases once a real Groww export is
// available. Everything downstream (API route, importer UI) is unaffected by
// changes here as long as parseGrowwCsv keeps returning { rows, errors }.
const ALIASES: Record<string, string[]> = {
  symbol: ['Symbol', 'Stock Symbol', 'Scrip', 'Stock Name'],
  companyName: ['Stock Name', 'Company Name'],
  tradeType: ['Trade Type', 'Buy/Sell', 'Order Type'],
  quantity: ['Quantity', 'Qty'],
  price: ['Price', 'Trade Price', 'Avg Price'],
  tradeDate: ['Trade Date', 'Date', 'Order Date'],
}

function findColumn(header: string[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    const match = header.find((h) => h.toLowerCase() === candidate.toLowerCase())
    if (match) return match
  }
  return null
}

export function parseGrowwCsv(text: string): {
  rows: CreateStockTxInput[]
  errors: RowError[]
} {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return { rows: [], errors: [{ row: 0, message: 'Empty file' }] }
  const { header, records } = rowsToObjects(parsed)

  const columns = {
    symbol: findColumn(header, ALIASES.symbol),
    companyName: findColumn(header, ALIASES.companyName),
    tradeType: findColumn(header, ALIASES.tradeType),
    quantity: findColumn(header, ALIASES.quantity),
    price: findColumn(header, ALIASES.price),
    tradeDate: findColumn(header, ALIASES.tradeDate),
  }

  const missing = (['symbol', 'tradeType', 'quantity', 'price', 'tradeDate'] as const).filter(
    (key) => !columns[key],
  )
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 0,
          message: `Could not find expected columns: ${missing.join(', ')}. Update functions/lib/parsers/groww.ts with your file's actual column names.`,
        },
      ],
    }
  }

  const rows: CreateStockTxInput[] = []
  const errors: RowError[] = []
  records.forEach((record, idx) => {
    const rowNum = idx + 2 // header is row 1
    const symbol = record[columns.symbol!]
    const tradeTypeRaw = record[columns.tradeType!].toUpperCase()
    const quantity = Number(record[columns.quantity!])
    const price = Number(record[columns.price!])
    const tradeDate = record[columns.tradeDate!]

    if (!symbol) {
      errors.push({ row: rowNum, message: 'Missing symbol' })
      return
    }
    const tradeType = tradeTypeRaw.startsWith('B') ? 'BUY' : tradeTypeRaw.startsWith('S') ? 'SELL' : null
    if (!tradeType) {
      errors.push({ row: rowNum, message: `Unrecognized trade type: "${tradeTypeRaw}"` })
      return
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push({ row: rowNum, message: `Invalid quantity: "${record[columns.quantity!]}"` })
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      errors.push({ row: rowNum, message: `Invalid price: "${record[columns.price!]}"` })
      return
    }
    if (!tradeDate) {
      errors.push({ row: rowNum, message: 'Missing trade date' })
      return
    }

    rows.push({
      symbol,
      companyName: columns.companyName ? record[columns.companyName] : null,
      tradeType,
      quantity,
      price,
      tradeDate,
      source: 'csv_groww',
    })
  })

  return { rows, errors }
}
