import type { Env } from '../../lib/env.ts'
import { json } from '../../lib/response.ts'
import { computeStockHoldings } from '../../lib/holdings.ts'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const holdings = await computeStockHoldings(env)
  return json(holdings)
}
