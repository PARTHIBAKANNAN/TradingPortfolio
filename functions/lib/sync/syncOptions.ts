import type { Env } from '../env.ts'
import { authenticateAliceBlue } from './aliceblue/auth.ts'
import { fetchAliceBlueTradeBook } from './aliceblue/client.ts'
import { normalizeAliceBlueFills } from './aliceblue/normalize.ts'
import { matchFills, type ExistingLot } from './matching.ts'
import { upsertOptionFill, findOpenOptionTradesBySource, setSyncRunning, setSyncResult } from '../db.ts'
import type { SyncSummary, SyncRunResult } from './types.ts'

function contractKeyFor(underlying: string, strikePrice: number, optionType: string, expiryDate: string): string {
  return `${underlying}|${strikePrice}|${optionType}|${expiryDate}`
}

/**
 * Syncs Alice Blue options trades: fetches the trade book, pairs fills into
 * round-trips via the shared FIFO matching engine (seeded with whatever's
 * already OPEN in the DB from prior syncs), and idempotently upserts into
 * options_trades. Unlike intraday, options_trades DOES persist an OPEN status,
 * so unmatched buys are written and kept open until a later sync closes them.
 */
export async function runAliceBlueSync(env: Env): Promise<SyncRunResult> {
  const auth = await authenticateAliceBlue(env)
  if (!auth) {
    return { configured: false }
  }

  await setSyncRunning(env.DB, 'aliceblue')
  try {
    const rawFills = await fetchAliceBlueTradeBook(auth.token)
    const fills = normalizeAliceBlueFills(rawFills)

    const existingOpen = await findOpenOptionTradesBySource(env.DB, 'aliceblue')
    const existingLots = new Map<string, ExistingLot[]>()
    for (const trade of existingOpen) {
      if (trade.entryPrice === null || trade.externalId === null) continue
      const key = contractKeyFor(trade.underlying, trade.strikePrice, trade.optionType, trade.expiryDate)
      const lots = existingLots.get(key) ?? []
      lots.push({
        externalId: trade.externalId,
        remainingQty: trade.quantity,
        entryPrice: trade.entryPrice,
        entryDate: trade.entryDate,
      })
      existingLots.set(key, lots)
    }

    const metaByContract = new Map<string, Record<string, string>>()
    for (const fill of fills) {
      if (fill.meta && !metaByContract.has(fill.contractKey)) metaByContract.set(fill.contractKey, fill.meta)
    }

    const matched = matchFills(fills, existingLots)

    let processed = 0
    for (const trip of matched) {
      const meta = metaByContract.get(trip.contractKey)
      if (!meta) continue // shouldn't happen — every fill carries meta
      await upsertOptionFill(env.DB, {
        underlying: meta.underlying,
        strikePrice: Number(meta.strikePrice),
        optionType: meta.optionType as 'CE' | 'PE',
        expiryDate: meta.expiryDate,
        entryPrice: trip.entryPrice,
        exitPrice: trip.exitPrice,
        quantity: trip.quantity,
        entryDate: trip.entryDate,
        exitDate: trip.exitDate,
        status: trip.status,
        realizedPnl: trip.realizedPnl,
        notes: trip.notes ?? null,
        source: 'aliceblue',
        externalId: trip.externalId,
      })
      processed += 1
    }

    const summary: SyncSummary = {
      fetched: rawFills.length,
      matched: matched.length,
      inserted: processed,
      updated: 0,
      skipped: rawFills.length - fills.length,
    }
    await setSyncResult(env.DB, 'aliceblue', { status: 'success', summary })
    return { configured: true, summary }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown sync error'
    await setSyncResult(env.DB, 'aliceblue', { status: 'error', error: message })
    return { configured: true, error: message }
  }
}
