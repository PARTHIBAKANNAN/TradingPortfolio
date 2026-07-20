/**
 * Minimal RFC4180-ish CSV parser: handles quoted fields, embedded commas,
 * embedded newlines inside quotes, and "" as an escaped quote. Returns rows
 * as arrays of raw string cells (no header handling — callers combine with
 * a header row to build column-indexed objects).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  while (i < normalized.length) {
    const char = normalized[i]
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += char
      i += 1
      continue
    }
    if (char === '"') {
      inQuotes = true
      i += 1
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i += 1
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }
    field += char
    i += 1
  }
  // last field/row (file may or may not end with a newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}

export interface RowError {
  row: number
  message: string
}

export function rowsToObjects(rows: string[][]): { header: string[]; records: Record<string, string>[] } {
  const [header, ...rest] = rows
  const records = rest.map((r) => {
    const record: Record<string, string> = {}
    header.forEach((col, idx) => {
      record[col.trim()] = (r[idx] ?? '').trim()
    })
    return record
  })
  return { header, records }
}
