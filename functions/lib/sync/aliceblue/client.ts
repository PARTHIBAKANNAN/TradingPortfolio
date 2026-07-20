export interface AliceBlueTradeFill {
  Nstordno?: string // exchange order number — used as the fill's external id
  Trsym: string // trading symbol, e.g. "NIFTY27MAR25C22000"
  Trantype: 'B' | 'S'
  Fillamount?: string
  Filledqty: string
  Avgprc: string
  Exchtime?: string
  Optt?: 'CE' | 'PE'
  Strprc?: string
  Expdate?: string
}

const BASE_URL = 'https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api'

/**
 * Fetches Alice Blue's trade book (individual fills). Returns [] on any
 * non-2xx response rather than throwing.
 */
export async function fetchAliceBlueTradeBook(sessionId: string): Promise<AliceBlueTradeFill[]> {
  const response = await fetch(`${BASE_URL}/placeOrder/tradeBook`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${sessionId}`,
    },
    body: JSON.stringify({}),
  })
  if (!response.ok) return []
  const data = (await response.json()) as AliceBlueTradeFill[] | { data?: AliceBlueTradeFill[] }
  return Array.isArray(data) ? data : (data.data ?? [])
}
