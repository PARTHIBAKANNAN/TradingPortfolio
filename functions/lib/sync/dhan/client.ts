export interface DhanTradeFill {
  exchangeOrderId?: string
  orderId?: string
  tradingSymbol: string
  transactionType: 'BUY' | 'SELL'
  tradedQuantity: number
  tradedPrice: number
  exchangeTime?: string
  tradeDate?: string
}

/**
 * Fetches Dhan's trade book (individual fills), used to reconstruct intraday
 * round-trips via the shared matching engine. Returns [] on any non-2xx
 * response rather than throwing — the orchestrator treats an empty fetch the
 * same as "nothing new to sync".
 */
export async function fetchDhanTradeBook(accessToken: string, dhanClientId: string): Promise<DhanTradeFill[]> {
  const response = await fetch('https://api.dhan.co/v2/trades', {
    headers: {
      'access-token': accessToken,
      'client-id': dhanClientId,
    },
  })
  if (!response.ok) return []
  const data = (await response.json()) as DhanTradeFill[] | { data?: DhanTradeFill[] }
  return Array.isArray(data) ? data : (data.data ?? [])
}
