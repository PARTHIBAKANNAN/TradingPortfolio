import type { Env } from './env.ts'

// Fyers quote endpoint expects symbols like "NSE:TCS-EQ". This maps our plain
// stock symbols to that format; adjust if you trade other exchanges/segments.
function toFyersSymbol(symbol: string): string {
  return `NSE:${symbol}-EQ`
}

/**
 * Returns the last traded price from Fyers, or null if credentials aren't
 * configured yet, or the request fails for any reason. Never throws — callers
 * fall back to the cached/manual price seamlessly.
 */
export async function fetchFyersPrice(env: Env, symbol: string): Promise<number | null> {
  if (!env.FYERS_APP_ID || !env.FYERS_ACCESS_TOKEN) {
    return null
  }
  try {
    const fyersSymbol = toFyersSymbol(symbol)
    const url = `https://api-t1.fyers.in/data/quotes?symbols=${encodeURIComponent(fyersSymbol)}`
    const response = await fetch(url, {
      headers: {
        Authorization: `${env.FYERS_APP_ID}:${env.FYERS_ACCESS_TOKEN}`,
      },
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      d?: { v?: { lp?: number } }[]
    }
    const lastPrice = data.d?.[0]?.v?.lp
    return typeof lastPrice === 'number' ? lastPrice : null
  } catch {
    return null
  }
}
