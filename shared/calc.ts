export interface Lot {
  qty: number
  avgPrice: number
}

export function applyBuy(current: Lot, buyQty: number, buyPrice: number): Lot {
  const totalQty = current.qty + buyQty
  const newAvg =
    totalQty === 0
      ? 0
      : (current.qty * current.avgPrice + buyQty * buyPrice) / totalQty
  return { qty: totalQty, avgPrice: newAvg }
}

export function applySell(
  current: Lot,
  sellQty: number,
  sellPrice: number,
): { lot: Lot; realizedPnl: number } {
  if (sellQty > current.qty) {
    throw new Error('Sell quantity exceeds held quantity')
  }
  const realizedPnl = sellQty * (sellPrice - current.avgPrice)
  const remainingQty = current.qty - sellQty
  return {
    lot: { qty: remainingQty, avgPrice: remainingQty === 0 ? 0 : current.avgPrice },
    realizedPnl,
  }
}

export interface TxLike {
  type: 'BUY' | 'SELL'
  qty: number
  price: number
  date: string
}

export interface HoldingResult {
  qty: number
  avgPrice: number
  realizedPnl: number
}

export function computeHolding(transactions: TxLike[]): HoldingResult {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  let lot: Lot = { qty: 0, avgPrice: 0 }
  let realizedPnl = 0
  for (const t of sorted) {
    if (t.type === 'BUY') {
      lot = applyBuy(lot, t.qty, t.price)
    } else {
      const result = applySell(lot, t.qty, t.price)
      lot = result.lot
      realizedPnl += result.realizedPnl
    }
  }
  return { qty: lot.qty, avgPrice: lot.avgPrice, realizedPnl }
}

export function unrealizedPnl(
  qty: number,
  avgPrice: number,
  currentPrice: number,
): number {
  return qty * (currentPrice - avgPrice)
}
