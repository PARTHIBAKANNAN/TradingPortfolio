import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import {
  updateMetalTransaction,
  deleteMetalTransaction,
  getMetalTransaction,
  type CreateMetalTxInput,
} from '../../lib/db.ts'
import { recomputeMetalRealizedPnl } from '../../lib/holdings.ts'

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const patch = (await request.json()) as Partial<CreateMetalTxInput>
  const updated = await updateMetalTransaction(env.DB, id, patch)
  if (!updated) return errorResponse('Transaction not found', 404)
  await recomputeMetalRealizedPnl(env.DB, updated.metalType)
  return json(updated)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const existing = await getMetalTransaction(env.DB, id)
  if (!existing) return errorResponse('Transaction not found', 404)
  await deleteMetalTransaction(env.DB, id)
  await recomputeMetalRealizedPnl(env.DB, existing.metalType)
  return json({ deleted: true })
}
