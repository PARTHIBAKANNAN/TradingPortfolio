export interface NormalizedFill {
  externalId: string
  contractKey: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: string
  /** Broker-specific identity fields needed to reconstruct a DB row from a
   *  contractKey (e.g. options need underlying/strike/type/expiry separately,
   *  not just the opaque grouping key). Unused by the generic matching engine. */
  meta?: Record<string, string>
}

export interface SyncSummary {
  fetched: number
  matched: number
  inserted: number
  updated: number
  skipped: number
}

export interface SyncRunResult {
  configured: boolean
  summary?: SyncSummary
  error?: string
}
