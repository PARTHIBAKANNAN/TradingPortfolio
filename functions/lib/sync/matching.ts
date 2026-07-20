import type { NormalizedFill } from './types.ts'

export interface ExistingLot {
  externalId: string
  remainingQty: number
  entryPrice: number
  entryDate: string
}

export interface MatchedRoundTrip {
  contractKey: string
  externalId: string
  entryPrice: number | null
  entryDate: string
  exitPrice: number | null
  exitDate: string | null
  quantity: number
  status: 'OPEN' | 'CLOSED'
  realizedPnl: number | null
  notes?: string | null
}

const UNMATCHED_NOTE =
  'Unmatched opening fill — entry price unknown, sync started after this position was already open.'

/**
 * Turns a stream of individual broker fills into round-trip rows (one row per
 * open position / closed trade), FIFO-matching sells against the oldest open
 * lot for the same contract. `existingOpenLots` seeds each contract with
 * whatever's already open in the DB from prior sync runs, keyed by contractKey.
 */
export function matchFills(
  fills: NormalizedFill[],
  existingOpenLots: Map<string, ExistingLot[]>,
): MatchedRoundTrip[] {
  const byContract = new Map<string, NormalizedFill[]>()
  for (const fill of fills) {
    const list = byContract.get(fill.contractKey) ?? []
    list.push(fill)
    byContract.set(fill.contractKey, list)
  }

  const results: MatchedRoundTrip[] = []
  for (const [contractKey, contractFills] of byContract) {
    const lots: ExistingLot[] = [...(existingOpenLots.get(contractKey) ?? [])]
    const sorted = [...contractFills].sort(
      (a, b) => a.date.localeCompare(b.date) || a.externalId.localeCompare(b.externalId),
    )

    for (const fill of sorted) {
      if (fill.side === 'BUY') {
        lots.push({
          externalId: fill.externalId,
          remainingQty: fill.quantity,
          entryPrice: fill.price,
          entryDate: fill.date,
        })
        continue
      }

      let remainingToSell = fill.quantity
      while (remainingToSell > 0 && lots.length > 0) {
        const lot = lots[0]
        const consumeQty = Math.min(remainingToSell, lot.remainingQty)
        const fullyConsumesLot = consumeQty === lot.remainingQty
        const externalId = fullyConsumesLot ? lot.externalId : `${lot.externalId}:split:${fill.externalId}`

        results.push({
          contractKey,
          externalId,
          entryPrice: lot.entryPrice,
          entryDate: lot.entryDate,
          exitPrice: fill.price,
          exitDate: fill.date,
          quantity: consumeQty,
          status: 'CLOSED',
          realizedPnl: consumeQty * (fill.price - lot.entryPrice),
        })

        lot.remainingQty -= consumeQty
        remainingToSell -= consumeQty
        if (fullyConsumesLot) lots.shift()
      }

      if (remainingToSell > 0) {
        results.push({
          contractKey,
          externalId: fill.externalId,
          entryPrice: null,
          entryDate: fill.date,
          exitPrice: fill.price,
          exitDate: fill.date,
          quantity: remainingToSell,
          status: 'CLOSED',
          realizedPnl: null,
          notes: UNMATCHED_NOTE,
        })
      }
    }

    for (const lot of lots) {
      if (lot.remainingQty > 0) {
        results.push({
          contractKey,
          externalId: lot.externalId,
          entryPrice: lot.entryPrice,
          entryDate: lot.entryDate,
          exitPrice: null,
          exitDate: null,
          quantity: lot.remainingQty,
          status: 'OPEN',
          realizedPnl: null,
        })
      }
    }
  }

  return results
}
