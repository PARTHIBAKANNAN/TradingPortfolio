import { applyBuy, applySell, type Lot } from '../../shared/calc.ts'
import type { HoldingSummary, PriceSource } from '../../shared/types.ts'
import {
  listStockTransactions,
  listMetalTransactions,
  bulkUpdateStockRealizedPnl,
  bulkUpdateMetalRealizedPnl,
  getCachedPrice,
} from './db.ts'
import { getCurrentPrice } from './prices.ts'
import type { Env } from './env.ts'

interface ReplayTx {
  id: number
  type: 'BUY' | 'SELL'
  qty: number
  price: number
  date: string
}

function replayWithPerSellPnl(transactions: ReplayTx[]) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
  let lot: Lot = { qty: 0, avgPrice: 0 }
  let totalRealizedPnl = 0
  const sellPnlById = new Map<number, number>()
  for (const t of sorted) {
    if (t.type === 'BUY') {
      lot = applyBuy(lot, t.qty, t.price)
    } else {
      const result = applySell(lot, t.qty, t.price)
      lot = result.lot
      totalRealizedPnl += result.realizedPnl
      sellPnlById.set(t.id, result.realizedPnl)
    }
  }
  return { qty: lot.qty, avgPrice: lot.avgPrice, totalRealizedPnl, sellPnlById }
}

export async function recomputeStockRealizedPnl(db: D1Database, symbol: string): Promise<void> {
  const transactions = await listStockTransactions(db, symbol)
  const { sellPnlById } = replayWithPerSellPnl(
    transactions.map((t) => ({ id: t.id, type: t.tradeType, qty: t.quantity, price: t.price, date: t.tradeDate })),
  )
  const updates = transactions
    .filter((t) => t.tradeType === 'SELL')
    .map((t) => ({ id: t.id, realizedPnl: sellPnlById.get(t.id) ?? 0 }))
  await bulkUpdateStockRealizedPnl(db, updates)
}

export async function recomputeMetalRealizedPnl(db: D1Database, metalType: string): Promise<void> {
  const transactions = await listMetalTransactions(db, metalType)
  const { sellPnlById } = replayWithPerSellPnl(
    transactions.map((t) => ({
      id: t.id,
      type: t.tradeType,
      qty: t.quantityGrams,
      price: t.pricePerGram,
      date: t.tradeDate,
    })),
  )
  const updates = transactions
    .filter((t) => t.tradeType === 'SELL')
    .map((t) => ({ id: t.id, realizedPnl: sellPnlById.get(t.id) ?? 0 }))
  await bulkUpdateMetalRealizedPnl(db, updates)
}

export async function computeStockHoldings(env: Env): Promise<HoldingSummary[]> {
  const all = await listStockTransactions(env.DB)
  const bySymbol = new Map<string, typeof all>()
  for (const t of all) {
    const list = bySymbol.get(t.symbol) ?? []
    list.push(t)
    bySymbol.set(t.symbol, list)
  }

  const summaries: HoldingSummary[] = []
  for (const [symbol, txs] of bySymbol) {
    const { qty, avgPrice, totalRealizedPnl } = replayWithPerSellPnl(
      txs.map((t) => ({ id: t.id, type: t.tradeType, qty: t.quantity, price: t.price, date: t.tradeDate })),
    )
    const investedValue = qty * avgPrice
    let currentPrice: number | null = null
    let priceSource: PriceSource = 'none'
    if (qty > 0) {
      const priceResult = await getCurrentPrice(env, symbol, { tryLive: true })
      currentPrice = priceResult.price
      priceSource = priceResult.source
    }
    const currentValue = currentPrice !== null ? qty * currentPrice : null
    const unrealized = currentPrice !== null ? qty * (currentPrice - avgPrice) : null
    summaries.push({
      key: symbol,
      label: symbol,
      quantity: qty,
      avgPrice,
      investedValue,
      currentPrice,
      priceSource,
      currentValue,
      unrealizedPnl: unrealized,
      realizedPnl: totalRealizedPnl,
    })
  }
  return summaries.sort((a, b) => a.label.localeCompare(b.label))
}

export async function computeMetalHoldings(env: Env): Promise<HoldingSummary[]> {
  const all = await listMetalTransactions(env.DB)
  const byMetal = new Map<string, typeof all>()
  for (const t of all) {
    const list = byMetal.get(t.metalType) ?? []
    list.push(t)
    byMetal.set(t.metalType, list)
  }

  const summaries: HoldingSummary[] = []
  for (const [metalType, txs] of byMetal) {
    const { qty, avgPrice, totalRealizedPnl } = replayWithPerSellPnl(
      txs.map((t) => ({ id: t.id, type: t.tradeType, qty: t.quantityGrams, price: t.pricePerGram, date: t.tradeDate })),
    )
    const investedValue = qty * avgPrice
    let currentPrice: number | null = null
    let priceSource: PriceSource = 'none'
    if (qty > 0) {
      const priceResult = await getCurrentPrice(env, metalType, { tryLive: false })
      currentPrice = priceResult.price
      priceSource = priceResult.source
    }
    const currentValue = currentPrice !== null ? qty * currentPrice : null
    const unrealized = currentPrice !== null ? qty * (currentPrice - avgPrice) : null
    summaries.push({
      key: metalType,
      label: metalType === 'GOLD' ? 'Gold' : 'Silver',
      quantity: qty,
      avgPrice,
      investedValue,
      currentPrice,
      priceSource,
      currentValue,
      unrealizedPnl: unrealized,
      realizedPnl: totalRealizedPnl,
    })
  }
  return summaries.sort((a, b) => a.label.localeCompare(b.label))
}

export { getCachedPrice }
