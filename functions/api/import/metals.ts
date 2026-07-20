import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { createMetalTransaction } from '../../lib/db.ts'
import { recomputeMetalRealizedPnl } from '../../lib/holdings.ts'
import { parseAuraGoldCsv } from '../../lib/parsers/auraGold.ts'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') === 'commit' ? 'commit' : 'preview'

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return errorResponse('file field is required (multipart/form-data)')
  const text = await file.text()

  const { rows, errors } = parseAuraGoldCsv(text)

  if (mode === 'preview') {
    return json({ insertedCount: 0, skippedCount: errors.length, errors, preview: rows })
  }

  const metalTypes = new Set<string>()
  for (const row of rows) {
    await createMetalTransaction(env.DB, row)
    metalTypes.add(row.metalType)
  }
  for (const metalType of metalTypes) {
    await recomputeMetalRealizedPnl(env.DB, metalType)
  }

  return json({ insertedCount: rows.length, skippedCount: errors.length, errors, preview: [] })
}
