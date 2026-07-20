import type { Env } from '../../lib/env.ts'
import { json } from '../../lib/response.ts'
import { computeMetalHoldings } from '../../lib/holdings.ts'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const holdings = await computeMetalHoldings(env)
  return json(holdings)
}
