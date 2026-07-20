import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { createExpense } from '../../lib/db.ts'
import { parseAxioCsv } from '../../lib/parsers/axio.ts'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') === 'commit' ? 'commit' : 'preview'

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return errorResponse('file field is required (multipart/form-data)')
  const text = await file.text()

  const { rows, errors } = parseAxioCsv(text)

  if (mode === 'preview') {
    return json({ insertedCount: 0, skippedCount: errors.length, errors, preview: rows })
  }

  for (const row of rows) {
    await createExpense(env.DB, row)
  }

  return json({ insertedCount: rows.length, skippedCount: errors.length, errors, preview: [] })
}
