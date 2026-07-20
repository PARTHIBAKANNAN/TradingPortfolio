import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import {
  updateOptionTrade,
  deleteOptionTrade,
  type CreateOptionTradeInput,
  type CloseOptionTradeInput,
} from '../../lib/db.ts'

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const patch = (await request.json()) as Partial<CreateOptionTradeInput> & Partial<CloseOptionTradeInput>
  const updated = await updateOptionTrade(env.DB, id, patch)
  if (!updated) return errorResponse('Trade not found', 404)
  return json(updated)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const deleted = await deleteOptionTrade(env.DB, id)
  if (!deleted) return errorResponse('Trade not found', 404)
  return json({ deleted: true })
}
