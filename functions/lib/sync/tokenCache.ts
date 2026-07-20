import type { BrokerName } from '../../../shared/types.ts'
import { getBrokerToken, setBrokerToken } from '../db.ts'

export interface AuthResult {
  token: string
  expiresAt: string
  extra?: unknown
}

export interface CachedToken {
  token: string
  extra: unknown
}

/**
 * Returns a still-valid cached token for `broker`, or authenticates fresh and
 * caches the result. Both the daily cron and the on-demand "Sync now" button
 * call this, so whichever runs first pays the login cost and the other reuses it.
 */
export async function withCachedToken(
  db: D1Database,
  broker: BrokerName,
  authenticate: () => Promise<AuthResult | null>,
): Promise<CachedToken | null> {
  const cached = await getBrokerToken(db, broker)
  if (cached && cached.expires_at > new Date().toISOString()) {
    return { token: cached.access_token, extra: cached.extra_json ? JSON.parse(cached.extra_json) : null }
  }
  const fresh = await authenticate()
  if (!fresh) return null
  await setBrokerToken(db, broker, fresh.token, fresh.expiresAt, fresh.extra)
  return { token: fresh.token, extra: fresh.extra ?? null }
}
