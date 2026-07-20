import type { Env } from '../../env.ts'
import { withCachedToken, type CachedToken } from '../tokenCache.ts'
import { currentTotp } from '../totp.ts'

export interface DhanAuthExtra {
  dhanClientId: string
}

/**
 * Authenticates against Dhan's generateAccessToken endpoint using a live TOTP
 * code computed from a stored seed — no human has to click through a login.
 * Returns null (never throws) if secrets aren't configured or the call fails,
 * mirroring the existing Fyers placeholder-first convention.
 */
export async function authenticateDhan(env: Env): Promise<CachedToken | null> {
  return withCachedToken(env.DB, 'dhan', async () => {
    if (!env.DHAN_CLIENT_ID || !env.DHAN_PIN || !env.DHAN_TOTP_SEED) return null
    try {
      const totp = await currentTotp(env.DHAN_TOTP_SEED)
      const url = new URL('https://auth.dhan.co/app/generateAccessToken')
      url.searchParams.set('dhanClientId', env.DHAN_CLIENT_ID)
      url.searchParams.set('pin', env.DHAN_PIN)
      url.searchParams.set('totp', totp)

      const response = await fetch(url, { method: 'POST' })
      if (!response.ok) return null
      const data = (await response.json()) as {
        accessToken?: string
        expiryTime?: string
        dhanClientId?: string
      }
      if (!data.accessToken) return null

      return {
        token: data.accessToken,
        expiresAt: data.expiryTime ?? new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        extra: { dhanClientId: data.dhanClientId ?? env.DHAN_CLIENT_ID } satisfies DhanAuthExtra,
      }
    } catch {
      return null
    }
  })
}
