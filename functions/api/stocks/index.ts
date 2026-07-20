import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { listStockTransactions, createStockTransaction, type CreateStockTxInput } from '../../lib/db.ts'
import { recomputeStockRealizedPnl } from '../../lib/holdings.ts'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const symbol = url.searchParams.get('symbol') ?? undefined
  const transactions = await listStockTransactions(env.DB, symbol)
  return json(transactions)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as Partial<CreateStockTxInput>
  if (!body.symbol || !body.tradeType || !body.quantity || body.price === undefined || !body.tradeDate) {
    return errorResponse('symbol, tradeType, quantity, price, and tradeDate are required')
  }
  const created = await createStockTransaction(env.DB, {
    symbol: body.symbol,
    companyName: body.companyName ?? null,
    tradeType: body.tradeType,
    quantity: body.quantity,
    price: body.price,
    tradeDate: body.tradeDate,
    notes: body.notes ?? null,
    source: body.source ?? 'manual',
  })
  await recomputeStockRealizedPnl(env.DB, created.symbol)
  return json(created, { status: 201 })
}
