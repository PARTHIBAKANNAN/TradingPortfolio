import type { Env } from '../../lib/env.ts'
import { json } from '../../lib/response.ts'
import { listSyncStates } from '../../lib/db.ts'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const states = await listSyncStates(env.DB)
  return json(states)
}
