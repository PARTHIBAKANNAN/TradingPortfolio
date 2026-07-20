import type { Env } from './env.ts'
import { getCachedPrice, setCachedPrice } from './db.ts'
import { fetchFyersPrice } from './fyers.ts'
import type { PriceSource } from '../../shared/types.ts'

export interface PriceResult {
  price: number | null
  source: PriceSource
  updatedAt: string | null
}

export async function getCurrentPrice(
  env: Env,
  symbol: string,
  opts: { tryLive: boolean },
): Promise<PriceResult> {
  if (opts.tryLive) {
    const livePrice = await fetchFyersPrice(env, symbol)
    if (livePrice !== null) {
      await setCachedPrice(env.DB, symbol, livePrice, 'fyers')
      return { price: livePrice, source: 'fyers', updatedAt: new Date().toISOString() }
    }
  }
  const cached = await getCachedPrice(env.DB, symbol)
  if (cached) {
    return { price: cached.price, source: cached.source, updatedAt: cached.updated_at }
  }
  return { price: null, source: 'none', updatedAt: null }
}

export async function setManualPrice(env: Env, symbol: string, price: number): Promise<void> {
  await setCachedPrice(env.DB, symbol, price, 'manual')
}
