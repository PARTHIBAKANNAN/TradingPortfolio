import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { listOptionTrades, createOptionTrade, type CreateOptionTradeInput } from '../../lib/db.ts'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const trades = await listOptionTrades(env.DB)
  return json(trades)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as Partial<CreateOptionTradeInput>
  if (
    !body.underlying ||
    body.strikePrice === undefined ||
    !body.optionType ||
    !body.expiryDate ||
    body.entryPrice === undefined ||
    !body.quantity ||
    !body.entryDate
  ) {
    return errorResponse(
      'underlying, strikePrice, optionType, expiryDate, entryPrice, quantity, and entryDate are required',
    )
  }
  const created = await createOptionTrade(env.DB, {
    underlying: body.underlying,
    strikePrice: body.strikePrice,
    optionType: body.optionType,
    expiryDate: body.expiryDate,
    entryPrice: body.entryPrice,
    quantity: body.quantity,
    entryDate: body.entryDate,
    notes: body.notes ?? null,
  })
  return json(created, { status: 201 })
}
