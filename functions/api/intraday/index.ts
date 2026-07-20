import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { listIntradayTrades, createIntradayTrade, type CreateIntradayTradeInput } from '../../lib/db.ts'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const trades = await listIntradayTrades(env.DB)
  return json(trades)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as Partial<CreateIntradayTradeInput>
  if (
    !body.symbol ||
    body.buyPrice === undefined ||
    body.sellPrice === undefined ||
    !body.quantity ||
    !body.tradeDate
  ) {
    return errorResponse('symbol, buyPrice, sellPrice, quantity, and tradeDate are required')
  }
  const created = await createIntradayTrade(env.DB, {
    symbol: body.symbol,
    buyPrice: body.buyPrice,
    sellPrice: body.sellPrice,
    quantity: body.quantity,
    tradeDate: body.tradeDate,
    notes: body.notes ?? null,
  })
  return json(created, { status: 201 })
}
