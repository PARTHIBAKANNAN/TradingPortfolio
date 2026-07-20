import type { Env } from '../../env.ts'
import { withCachedToken, type CachedToken } from '../tokenCache.ts'
import { aesEcbEncrypt, bytesToHex } from './aes.ts'

const BASE_URL = 'https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api'

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return bytesToHex(new Uint8Array(digest))
}

/**
 * Authenticates against Alice Blue's ANT API. This is a multi-step, scriptable
 * login (no rotating 2FA — the "2FA" answer is the account's static year of
 * birth) rather than a single call. NOTE: the exact request/response field
 * names below are the best available understanding from public docs/community
 * clients and have NOT been verified against a live account — this is the one
 * module in the whole sync feature flagged as needing adjustment once real
 * credentials are available (see the plan's "Open items"). Any failure at any
 * step returns null rather than throwing, so a wrong assumption here degrades
 * to "sync not working yet" rather than breaking anything else.
 */
export async function authenticateAliceBlue(env: Env): Promise<CachedToken | null> {
  return withCachedToken(env.DB, 'aliceblue', async () => {
    const { ALICEBLUE_USERNAME, ALICEBLUE_PASSWORD, ALICEBLUE_YOB, ALICEBLUE_APP_ID, ALICEBLUE_API_SECRET } = env
    if (!ALICEBLUE_USERNAME || !ALICEBLUE_PASSWORD || !ALICEBLUE_YOB || !ALICEBLUE_APP_ID || !ALICEBLUE_API_SECRET) {
      return null
    }
    try {
      // Step 1: fetch an encryption key for this user.
      const encKeyRes = await fetch(`${BASE_URL}/customer/getAPIEncpkey`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: ALICEBLUE_USERNAME }),
      })
      if (!encKeyRes.ok) return null
      const encKeyData = (await encKeyRes.json()) as { encKey?: string }
      if (!encKeyData.encKey) return null

      // Step 2: AES-ECB encrypt the password with that key.
      const keyBytes = new TextEncoder().encode(encKeyData.encKey).slice(0, 32)
      const encryptedPassword = bytesToHex(aesEcbEncrypt(new TextEncoder().encode(ALICEBLUE_PASSWORD), keyBytes))

      // Step 3: web login with the encrypted password.
      const loginRes = await fetch(`${BASE_URL}/customer/webLogin`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: ALICEBLUE_USERNAME, userData: encryptedPassword }),
      })
      if (!loginRes.ok) return null

      // Step 4: submit the static "2FA" answer (year of birth) to get an auth code.
      const twoFaRes = await fetch(`${BASE_URL}/customer/twoFA`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: ALICEBLUE_USERNAME,
          answer1: ALICEBLUE_YOB,
          vendor: ALICEBLUE_APP_ID,
          sIndex: '1',
          sCount: '1',
        }),
      })
      if (!twoFaRes.ok) return null
      const twoFaData = (await twoFaRes.json()) as { redirectUrl?: string; authCode?: string }
      const authCode = twoFaData.authCode ?? extractAuthCode(twoFaData.redirectUrl)
      if (!authCode) return null

      // Step 5: derive the session checksum.
      const checksum = await sha256Hex(ALICEBLUE_USERNAME + authCode + ALICEBLUE_API_SECRET)

      // Step 6: exchange the checksum for a session ID.
      const sessionRes = await fetch(`${BASE_URL}/vendor/getUserDetails`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ checkSum: checksum }),
      })
      if (!sessionRes.ok) return null
      const sessionData = (await sessionRes.json()) as { userSession?: string }
      if (!sessionData.userSession) return null

      return {
        token: sessionData.userSession,
        // Session resets ~7AM IST daily; cache for 23h to force a proactive
        // refresh comfortably before the real ~24h boundary.
        expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
      }
    } catch {
      return null
    }
  })
}

function extractAuthCode(redirectUrl: string | undefined): string | null {
  if (!redirectUrl) return null
  try {
    return new URL(redirectUrl).searchParams.get('authCode')
  } catch {
    return null
  }
}
