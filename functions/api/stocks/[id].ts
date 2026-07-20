import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import {
  updateStockTransaction,
  deleteStockTransaction,
  getStockTransaction,
  type CreateStockTxInput,
} from '../../lib/db.ts'
import { recomputeStockRealizedPnl } from '../../lib/holdings.ts'

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const patch = (await request.json()) as Partial<CreateStockTxInput>
  const updated = await updateStockTransaction(env.DB, id, patch)
  if (!updated) return errorResponse('Transaction not found', 404)
  await recomputeStockRealizedPnl(env.DB, updated.symbol)
  return json(updated)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const existing = await getStockTransaction(env.DB, id)
  if (!existing) return errorResponse('Transaction not found', 404)
  await deleteStockTransaction(env.DB, id)
  await recomputeStockRealizedPnl(env.DB, existing.symbol)
  return json({ deleted: true })
}
