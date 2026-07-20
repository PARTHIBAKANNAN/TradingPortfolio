import type { NormalizedFill } from '../types.ts'
import type { DhanTradeFill } from './client.ts'

function toDateOnly(value: string | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.slice(0, 10)
}

export function normalizeDhanFills(fills: DhanTradeFill[]): NormalizedFill[] {
  return fills.map((fill) => {
    const date = toDateOnly(fill.exchangeTime ?? fill.tradeDate)
    const externalId = fill.exchangeOrderId ?? fill.orderId ?? `${fill.tradingSymbol}-${date}-${fill.tradedPrice}`
    return {
      externalId,
      contractKey: `${fill.tradingSymbol}|${date}`,
      side: fill.transactionType,
      quantity: fill.tradedQuantity,
      price: fill.tradedPrice,
      date,
    }
  })
}
