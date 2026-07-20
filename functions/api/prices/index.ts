import type { Env } from '../../lib/env.ts'
import { json, errorResponse } from '../../lib/response.ts'
import { getCurrentPrice, setManualPrice } from '../../lib/prices.ts'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const symbol = url.searchParams.get('symbol')
  if (!symbol) return errorResponse('symbol query param is required')
  const tryLive = symbol !== 'GOLD' && symbol !== 'SILVER'
  const result = await getCurrentPrice(env, symbol, { tryLive })
  return json({ symbol, ...result })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json()) as { symbol?: string; price?: number }
  if (!body.symbol || body.price === undefined) {
    return errorResponse('symbol and price are required')
  }
  await setManualPrice(env, body.symbol, body.price)
  return json({ symbol: body.symbol, price: body.price, source: 'manual' })
}
