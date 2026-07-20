import { parseCsv, rowsToObjects, type RowError } from '../csv.ts'
import type { CreateMetalTxInput } from '../db.ts'

// Placeholder column layout — swap these aliases once a real Aura Gold
// statement export is available.
const ALIASES: Record<string, string[]> = {
  metalType: ['Metal', 'Metal Type', 'Product'],
  tradeType: ['Trade Type', 'Buy/Sell', 'Order Type'],
  quantityGrams: ['Grams', 'Quantity (g)', 'Weight'],
  pricePerGram: ['Price per Gram', 'Rate per Gram', 'Price/g'],
  tradeDate: ['Trade Date', 'Date', 'Order Date'],
}

function findColumn(header: string[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    const match = header.find((h) => h.toLowerCase() === candidate.toLowerCase())
    if (match) return match
  }
  return null
}

export function parseAuraGoldCsv(text: string): {
  rows: CreateMetalTxInput[]
  errors: RowError[]
} {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return { rows: [], errors: [{ row: 0, message: 'Empty file' }] }
  const { header, records } = rowsToObjects(parsed)

  const columns = {
    metalType: findColumn(header, ALIASES.metalType),
    tradeType: findColumn(header, ALIASES.tradeType),
    quantityGrams: findColumn(header, ALIASES.quantityGrams),
    pricePerGram: findColumn(header, ALIASES.pricePerGram),
    tradeDate: findColumn(header, ALIASES.tradeDate),
  }

  const missing = (['metalType', 'tradeType', 'quantityGrams', 'pricePerGram', 'tradeDate'] as const).filter(
    (key) => !columns[key],
  )
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 0,
          message: `Could not find expected columns: ${missing.join(', ')}. Update functions/lib/parsers/auraGold.ts with your file's actual column names.`,
        },
      ],
    }
  }

  const rows: CreateMetalTxInput[] = []
  const errors: RowError[] = []
  records.forEach((record, idx) => {
    const rowNum = idx + 2
    const metalTypeRaw = record[columns.metalType!].toUpperCase()
    const tradeTypeRaw = record[columns.tradeType!].toUpperCase()
    const quantityGrams = Number(record[columns.quantityGrams!])
    const pricePerGram = Number(record[columns.pricePerGram!])
    const tradeDate = record[columns.tradeDate!]

    const metalType = metalTypeRaw.startsWith('G') ? 'GOLD' : metalTypeRaw.startsWith('S') ? 'SILVER' : null
    if (!metalType) {
      errors.push({ row: rowNum, message: `Unrecognized metal type: "${metalTypeRaw}"` })
      return
    }
    const tradeType = tradeTypeRaw.startsWith('B') ? 'BUY' : tradeTypeRaw.startsWith('S') ? 'SELL' : null
    if (!tradeType) {
      errors.push({ row: rowNum, message: `Unrecognized trade type: "${tradeTypeRaw}"` })
      return
    }
    if (!Number.isFinite(quantityGrams) || quantityGrams <= 0) {
      errors.push({ row: rowNum, message: `Invalid grams: "${record[columns.quantityGrams!]}"` })
      return
    }
    if (!Number.isFinite(pricePerGram) || pricePerGram < 0) {
      errors.push({ row: rowNum, message: `Invalid price per gram: "${record[columns.pricePerGram!]}"` })
      return
    }
    if (!tradeDate) {
      errors.push({ row: rowNum, message: 'Missing trade date' })
      return
    }

    rows.push({
      metalType,
      tradeType,
      quantityGrams,
      pricePerGram,
      tradeDate,
      source: 'csv_aura',
    })
  })

  return { rows, errors }
}
