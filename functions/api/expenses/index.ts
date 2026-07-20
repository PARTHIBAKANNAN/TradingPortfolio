import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { listExpenses, createExpense, type CreateExpenseInput } from '../../lib/db.ts'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const expenses = await listExpenses(env.DB)
  return json(expenses)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as Partial<CreateExpenseInput>
  if (!body.expenseDate || !body.category || body.amount === undefined) {
    return errorResponse('expenseDate, category, and amount are required')
  }
  const created = await createExpense(env.DB, {
    expenseDate: body.expenseDate,
    category: body.category,
    amount: body.amount,
    description: body.description ?? null,
    notes: body.notes ?? null,
    source: body.source ?? 'manual',
  })
  return json(created, { status: 201 })
}
