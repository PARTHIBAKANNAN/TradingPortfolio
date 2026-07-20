import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { createStockTransaction } from '../../lib/db.ts'
import { recomputeStockRealizedPnl } from '../../lib/holdings.ts'
import { parseGrowwCsv } from '../../lib/parsers/groww.ts'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') === 'commit' ? 'commit' : 'preview'

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return errorResponse('file field is required (multipart/form-data)')
  const text = await file.text()

  const { rows, errors } = parseGrowwCsv(text)

  if (mode === 'preview') {
    return json({ insertedCount: 0, skippedCount: errors.length, errors, preview: rows })
  }

  const symbols = new Set<string>()
  for (const row of rows) {
    await createStockTransaction(env.DB, row)
    symbols.add(row.symbol)
  }
  for (const symbol of symbols) {
    await recomputeStockRealizedPnl(env.DB, symbol)
  }

  return json({ insertedCount: rows.length, skippedCount: errors.length, errors, preview: [] })
}
