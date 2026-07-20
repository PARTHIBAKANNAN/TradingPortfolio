import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { updateExpense, deleteExpense, type CreateExpenseInput } from '../../lib/db.ts'

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const patch = (await request.json()) as Partial<CreateExpenseInput>
  const updated = await updateExpense(env.DB, id, patch)
  if (!updated) return errorResponse('Expense not found', 404)
  return json(updated)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return errorResponse('Invalid id')
  const deleted = await deleteExpense(env.DB, id)
  if (!deleted) return errorResponse('Expense not found', 404)
  return json({ deleted: true })
}
