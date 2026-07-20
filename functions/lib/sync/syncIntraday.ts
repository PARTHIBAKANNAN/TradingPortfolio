import type { Env } from '../env.ts'
import { authenticateDhan, type DhanAuthExtra } from './dhan/auth.ts'
import { fetchDhanTradeBook } from './dhan/client.ts'
import { normalizeDhanFills } from './dhan/normalize.ts'
import { matchFills } from './matching.ts'
import { upsertIntradayFill, setSyncRunning, setSyncResult } from '../db.ts'
import type { SyncSummary, SyncRunResult } from './types.ts'

/**
 * Syncs Dhan intraday trades: fetches the trade book, pairs individual fills
 * into completed round-trips via the shared FIFO matching engine, and
 * idempotently upserts them into intraday_trades. intraday_trades has no
 * persisted "open" concept, so unmatched (still-open) fills are simply not
 * written yet — they're picked up on a later sync once their closing fill appears.
 */
export async function runDhanSync(env: Env): Promise<SyncRunResult> {
  const auth = await authenticateDhan(env)
  if (!auth) {
    return { configured: false }
  }

  await setSyncRunning(env.DB, 'dhan')
  try {
    const { dhanClientId } = auth.extra as DhanAuthExtra
    const rawFills = await fetchDhanTradeBook(auth.token, dhanClientId)
    const fills = normalizeDhanFills(rawFills)
    const matched = matchFills(fills, new Map())
    const closed = matched.filter((m) => m.status === 'CLOSED')

    for (const trip of closed) {
      const [symbol] = trip.contractKey.split('|')
      await upsertIntradayFill(env.DB, {
        symbol,
        buyPrice: trip.entryPrice,
        sellPrice: trip.exitPrice ?? 0,
        quantity: trip.quantity,
        tradeDate: trip.exitDate ?? trip.entryDate,
        realizedPnl: trip.realizedPnl,
        notes: trip.notes ?? null,
        source: 'dhan',
        externalId: trip.externalId,
      })
    }

    // Upserts don't distinguish insert-vs-update at the D1 layer, so this
    // summary reports rows processed rather than a precise inserted/updated split.
    const summary: SyncSummary = {
      fetched: rawFills.length,
      matched: matched.length,
      inserted: closed.length,
      updated: 0,
      skipped: rawFills.length - fills.length,
    }
    await setSyncResult(env.DB, 'dhan', { status: 'success', summary })
    return { configured: true, summary }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown sync error'
    await setSyncResult(env.DB, 'dhan', { status: 'error', error: message })
    return { configured: true, error: message }
  }
}
