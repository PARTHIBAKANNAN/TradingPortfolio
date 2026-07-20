import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { listMetalTransactions, createMetalTransaction, type CreateMetalTxInput } from '../../lib/db.ts'
import { recomputeMetalRealizedPnl } from '../../lib/holdings.ts'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const metalType = url.searchParams.get('metalType') ?? undefined
  const transactions = await listMetalTransactions(env.DB, metalType)
  return json(transactions)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as Partial<CreateMetalTxInput>
  if (
    !body.metalType ||
    !body.tradeType ||
    !body.quantityGrams ||
    body.pricePerGram === undefined ||
    !body.tradeDate
  ) {
    return errorResponse('metalType, tradeType, quantityGrams, pricePerGram, and tradeDate are required')
  }
  const created = await createMetalTransaction(env.DB, {
    metalType: body.metalType,
    tradeType: body.tradeType,
    quantityGrams: body.quantityGrams,
    pricePerGram: body.pricePerGram,
    tradeDate: body.tradeDate,
    notes: body.notes ?? null,
    source: body.source ?? 'manual',
  })
  await recomputeMetalRealizedPnl(env.DB, created.metalType)
  return json(created, { status: 201 })
}
