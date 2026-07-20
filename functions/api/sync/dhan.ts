import type { Env } from '../../lib/env.ts'
import { json } from '../../lib/response.ts'
import { runDhanSync } from '../../lib/sync/syncIntraday.ts'

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const result = await runDhanSync(env)
  return json(result)
}
