import type { Env } from '../../lib/env.ts'
import { json } from '../../lib/response.ts'
import { runAliceBlueSync } from '../../lib/sync/syncOptions.ts'

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const result = await runAliceBlueSync(env)
  return json(result)
}
