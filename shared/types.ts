export type TradeType = 'BUY' | 'SELL'
export type MetalType = 'GOLD' | 'SILVER'
export type OptionType = 'CE' | 'PE'
export type OptionStatus = 'OPEN' | 'CLOSED'
export type PriceSource = 'manual' | 'fyers' | 'none'

export interface StockTransaction {
  id: number
  symbol: string
  companyName: string | null
  tradeType: TradeType
  quantity: number
  price: number
  tradeDate: string
  notes: string | null
  source: 'manual' | 'csv_groww'
  realizedPnl: number | null
  createdAt: string
}

export interface MetalTransaction {
  id: number
  metalType: MetalType
  tradeType: TradeType
  quantityGrams: number
  pricePerGram: number
  tax: number
  spreadCharge: number
  otherCharges: number
  effectivePricePerGram: number | null
  tradeDate: string
  notes: string | null
  source: 'manual' | 'csv_aura'
  realizedPnl: number | null
  createdAt: string
}

export type BrokerName = 'aliceblue' | 'dhan'
export type SyncStatusValue = 'idle' | 'running' | 'success' | 'error'

export interface OptionTrade {
  id: number
  underlying: string
  strikePrice: number
  optionType: OptionType
  expiryDate: string
  entryPrice: number | null // null = unreconciled: a synced closing fill had no matching open
  exitPrice: number | null
  quantity: number
  entryDate: string
  exitDate: string | null
  status: OptionStatus
  realizedPnl: number | null
  notes: string | null
  source: 'manual' | 'aliceblue'
  externalId: string | null
  createdAt: string
}

export interface IntradayTrade {
  id: number
  symbol: string
  buyPrice: number | null // null = unreconciled: a synced sell fill had no matching buy
  sellPrice: number
  quantity: number
  tradeDate: string
  realizedPnl: number | null
  notes: string | null
  source: 'manual' | 'dhan'
  externalId: string | null
  createdAt: string
}

export interface Expense {
  id: number
  expenseDate: string
  category: string
  amount: number
  description: string | null
  source: 'manual' | 'csv_axio'
  notes: string | null
  createdAt: string
}

export interface SyncStatus {
  broker: BrokerName
  status: SyncStatusValue
  lastSyncedAt: string | null
  lastError: string | null
  lastRunSummary: { fetched: number; matched: number; inserted: number; updated: number; skipped: number } | null
}

export interface HoldingSummary {
  key: string // symbol or metalType
  label: string
  quantity: number
  avgPrice: number
  investedValue: number
  currentPrice: number | null
  priceSource: PriceSource
  currentValue: number | null
  unrealizedPnl: number | null
  realizedPnl: number
}

export interface DashboardResponse {
  range: { from: string; to: string }
  realized: {
    stocks: number
    metals: number
    options: number
    intraday: number
    total: number
  }
  unrealized: {
    stocks: number
    metals: number
    total: number
    asOf: string
  }
  invested: {
    stocks: number
    metals: number
    options: number
    total: number
  }
  expenses: {
    total: number
  }
  overall: {
    realizedTotal: number
    unrealizedTotal: number
    grandTotal: number
  }
}
