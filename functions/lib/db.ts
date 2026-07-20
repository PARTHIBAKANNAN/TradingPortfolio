import type {
  StockTransaction,
  MetalTransaction,
  OptionTrade,
  IntradayTrade,
  Expense,
  BrokerName,
  SyncStatus,
  SyncStatusValue,
} from '../../shared/types.ts'

// --- row shapes as they come out of D1 (snake_case) ---

interface StockTxRow {
  id: number
  symbol: string
  company_name: string | null
  trade_type: 'BUY' | 'SELL'
  quantity: number
  price: number
  trade_date: string
  notes: string | null
  source: 'manual' | 'csv_groww'
  realized_pnl: number | null
  created_at: string
}

interface MetalTxRow {
  id: number
  metal_type: 'GOLD' | 'SILVER'
  trade_type: 'BUY' | 'SELL'
  quantity_grams: number
  price_per_gram: number
  tax: number
  spread_charge: number
  other_charges: number
  effective_price_per_gram: number | null
  trade_date: string
  notes: string | null
  source: 'manual' | 'csv_aura'
  realized_pnl: number | null
  created_at: string
}

interface OptionTradeRow {
  id: number
  underlying: string
  strike_price: number
  option_type: 'CE' | 'PE'
  expiry_date: string
  entry_price: number | null
  exit_price: number | null
  quantity: number
  entry_date: string
  exit_date: string | null
  status: 'OPEN' | 'CLOSED'
  realized_pnl: number | null
  notes: string | null
  source: 'manual' | 'aliceblue'
  external_id: string | null
  created_at: string
}

interface IntradayTradeRow {
  id: number
  symbol: string
  buy_price: number | null
  sell_price: number
  quantity: number
  trade_date: string
  realized_pnl: number | null
  notes: string | null
  source: 'manual' | 'dhan'
  external_id: string | null
  created_at: string
}

interface ExpenseRow {
  id: number
  expense_date: string
  category: string
  amount: number
  description: string | null
  source: 'manual' | 'csv_axio'
  notes: string | null
  created_at: string
}

interface BrokerTokenRow {
  broker: BrokerName
  access_token: string
  extra_json: string | null
  expires_at: string
  updated_at: string
}

interface SyncStateRow {
  broker: BrokerName
  status: SyncStatusValue
  last_synced_at: string | null
  last_error: string | null
  last_run_summary: string | null
  updated_at: string
}

function toStockTx(r: StockTxRow): StockTransaction {
  return {
    id: r.id,
    symbol: r.symbol,
    companyName: r.company_name,
    tradeType: r.trade_type,
    quantity: r.quantity,
    price: r.price,
    tradeDate: r.trade_date,
    notes: r.notes,
    source: r.source,
    realizedPnl: r.realized_pnl,
    createdAt: r.created_at,
  }
}

function toMetalTx(r: MetalTxRow): MetalTransaction {
  return {
    id: r.id,
    metalType: r.metal_type,
    tradeType: r.trade_type,
    quantityGrams: r.quantity_grams,
    pricePerGram: r.price_per_gram,
    tax: r.tax,
    spreadCharge: r.spread_charge,
    otherCharges: r.other_charges,
    effectivePricePerGram: r.effective_price_per_gram,
    tradeDate: r.trade_date,
    notes: r.notes,
    source: r.source,
    realizedPnl: r.realized_pnl,
    createdAt: r.created_at,
  }
}

function toOptionTrade(r: OptionTradeRow): OptionTrade {
  return {
    id: r.id,
    underlying: r.underlying,
    strikePrice: r.strike_price,
    optionType: r.option_type,
    expiryDate: r.expiry_date,
    entryPrice: r.entry_price,
    exitPrice: r.exit_price,
    quantity: r.quantity,
    entryDate: r.entry_date,
    exitDate: r.exit_date,
    status: r.status,
    realizedPnl: r.realized_pnl,
    notes: r.notes,
    source: r.source,
    externalId: r.external_id,
    createdAt: r.created_at,
  }
}

function toIntradayTrade(r: IntradayTradeRow): IntradayTrade {
  return {
    id: r.id,
    symbol: r.symbol,
    buyPrice: r.buy_price,
    sellPrice: r.sell_price,
    quantity: r.quantity,
    tradeDate: r.trade_date,
    realizedPnl: r.realized_pnl,
    notes: r.notes,
    source: r.source,
    externalId: r.external_id,
    createdAt: r.created_at,
  }
}

function toExpense(r: ExpenseRow): Expense {
  return {
    id: r.id,
    expenseDate: r.expense_date,
    category: r.category,
    amount: r.amount,
    description: r.description,
    source: r.source,
    notes: r.notes,
    createdAt: r.created_at,
  }
}

// --- Stock transactions ---

export interface CreateStockTxInput {
  symbol: string
  companyName?: string | null
  tradeType: 'BUY' | 'SELL'
  quantity: number
  price: number
  tradeDate: string
  notes?: string | null
  source?: 'manual' | 'csv_groww'
}

export async function listStockTransactions(
  db: D1Database,
  symbol?: string,
): Promise<StockTransaction[]> {
  const stmt = symbol
    ? db
        .prepare(
          'SELECT * FROM stock_transactions WHERE symbol = ? ORDER BY trade_date ASC, id ASC',
        )
        .bind(symbol)
    : db.prepare('SELECT * FROM stock_transactions ORDER BY trade_date ASC, id ASC')
  const { results } = await stmt.all<StockTxRow>()
  return results.map(toStockTx)
}

export async function createStockTransaction(
  db: D1Database,
  input: CreateStockTxInput,
): Promise<StockTransaction> {
  const result = await db
    .prepare(
      `INSERT INTO stock_transactions (symbol, company_name, trade_type, quantity, price, trade_date, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .bind(
      input.symbol,
      input.companyName ?? null,
      input.tradeType,
      input.quantity,
      input.price,
      input.tradeDate,
      input.notes ?? null,
      input.source ?? 'manual',
    )
    .first<StockTxRow>()
  return toStockTx(result!)
}

export async function updateStockTransaction(
  db: D1Database,
  id: number,
  patch: Partial<CreateStockTxInput>,
): Promise<StockTransaction | null> {
  const existing = await db
    .prepare('SELECT * FROM stock_transactions WHERE id = ?')
    .bind(id)
    .first<StockTxRow>()
  if (!existing) return null
  const merged = { ...toStockTx(existing), ...patch }
  const result = await db
    .prepare(
      `UPDATE stock_transactions SET symbol = ?, company_name = ?, trade_type = ?, quantity = ?, price = ?, trade_date = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .bind(
      merged.symbol,
      merged.companyName ?? null,
      merged.tradeType,
      merged.quantity,
      merged.price,
      merged.tradeDate,
      merged.notes ?? null,
      id,
    )
    .first<StockTxRow>()
  return result ? toStockTx(result) : null
}

export async function getStockTransaction(db: D1Database, id: number): Promise<StockTransaction | null> {
  const result = await db.prepare('SELECT * FROM stock_transactions WHERE id = ?').bind(id).first<StockTxRow>()
  return result ? toStockTx(result) : null
}

export async function deleteStockTransaction(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM stock_transactions WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

export async function bulkUpdateStockRealizedPnl(
  db: D1Database,
  updates: { id: number; realizedPnl: number | null }[],
): Promise<void> {
  if (updates.length === 0) return
  const stmts = updates.map((u) =>
    db.prepare('UPDATE stock_transactions SET realized_pnl = ? WHERE id = ?').bind(u.realizedPnl, u.id),
  )
  await db.batch(stmts)
}

// --- Metal transactions ---

export interface CreateMetalTxInput {
  metalType: 'GOLD' | 'SILVER'
  tradeType: 'BUY' | 'SELL'
  quantityGrams: number
  pricePerGram: number
  tax?: number
  spreadCharge?: number
  otherCharges?: number
  tradeDate: string
  notes?: string | null
  source?: 'manual' | 'csv_aura'
}

export async function listMetalTransactions(
  db: D1Database,
  metalType?: string,
): Promise<MetalTransaction[]> {
  const stmt = metalType
    ? db
        .prepare(
          'SELECT * FROM metal_transactions WHERE metal_type = ? ORDER BY trade_date ASC, id ASC',
        )
        .bind(metalType)
    : db.prepare('SELECT * FROM metal_transactions ORDER BY trade_date ASC, id ASC')
  const { results } = await stmt.all<MetalTxRow>()
  return results.map(toMetalTx)
}

export async function createMetalTransaction(
  db: D1Database,
  input: CreateMetalTxInput,
): Promise<MetalTransaction> {
  const tax = input.tax ?? 0
  const spreadCharge = input.spreadCharge ?? 0
  const otherCharges = input.otherCharges ?? 0
  const totalCharges = tax + spreadCharge + otherCharges
  const effectivePrice = input.quantityGrams > 0
    ? (input.pricePerGram * input.quantityGrams + totalCharges) / input.quantityGrams
    : input.pricePerGram

  const result = await db
    .prepare(
      `INSERT INTO metal_transactions (metal_type, trade_type, quantity_grams, price_per_gram, tax, spread_charge, other_charges, effective_price_per_gram, trade_date, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .bind(
      input.metalType,
      input.tradeType,
      input.quantityGrams,
      input.pricePerGram,
      tax,
      spreadCharge,
      otherCharges,
      effectivePrice,
      input.tradeDate,
      input.notes ?? null,
      input.source ?? 'manual',
    )
    .first<MetalTxRow>()
  return toMetalTx(result!)
}

export async function updateMetalTransaction(
  db: D1Database,
  id: number,
  patch: Partial<CreateMetalTxInput>,
): Promise<MetalTransaction | null> {
  const existing = await db
    .prepare('SELECT * FROM metal_transactions WHERE id = ?')
    .bind(id)
    .first<MetalTxRow>()
  if (!existing) return null
  const merged = { ...toMetalTx(existing), ...patch }

  const tax = merged.tax ?? 0
  const spreadCharge = merged.spreadCharge ?? 0
  const otherCharges = merged.otherCharges ?? 0
  const totalCharges = tax + spreadCharge + otherCharges
  const effectivePrice = merged.quantityGrams > 0
    ? (merged.pricePerGram * merged.quantityGrams + totalCharges) / merged.quantityGrams
    : merged.pricePerGram

  const result = await db
    .prepare(
      `UPDATE metal_transactions SET metal_type = ?, trade_type = ?, quantity_grams = ?, price_per_gram = ?, tax = ?, spread_charge = ?, other_charges = ?, effective_price_per_gram = ?, trade_date = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .bind(
      merged.metalType,
      merged.tradeType,
      merged.quantityGrams,
      merged.pricePerGram,
      tax,
      spreadCharge,
      otherCharges,
      effectivePrice,
      merged.tradeDate,
      merged.notes ?? null,
      id,
    )
    .first<MetalTxRow>()
  return result ? toMetalTx(result) : null
}

export async function getMetalTransaction(db: D1Database, id: number): Promise<MetalTransaction | null> {
  const result = await db.prepare('SELECT * FROM metal_transactions WHERE id = ?').bind(id).first<MetalTxRow>()
  return result ? toMetalTx(result) : null
}

export async function deleteMetalTransaction(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM metal_transactions WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

export async function bulkUpdateMetalRealizedPnl(
  db: D1Database,
  updates: { id: number; realizedPnl: number | null }[],
): Promise<void> {
  if (updates.length === 0) return
  const stmts = updates.map((u) =>
    db.prepare('UPDATE metal_transactions SET realized_pnl = ? WHERE id = ?').bind(u.realizedPnl, u.id),
  )
  await db.batch(stmts)
}

// --- Options trades ---

export interface CreateOptionTradeInput {
  underlying: string
  strikePrice: number
  optionType: 'CE' | 'PE'
  expiryDate: string
  entryPrice: number
  quantity: number
  entryDate: string
  notes?: string | null
}

export interface CloseOptionTradeInput {
  exitPrice: number
  exitDate: string
}

export async function listOptionTrades(db: D1Database): Promise<OptionTrade[]> {
  const { results } = await db
    .prepare('SELECT * FROM options_trades ORDER BY entry_date DESC, id DESC')
    .all<OptionTradeRow>()
  return results.map(toOptionTrade)
}

export async function createOptionTrade(
  db: D1Database,
  input: CreateOptionTradeInput,
): Promise<OptionTrade> {
  const result = await db
    .prepare(
      `INSERT INTO options_trades (underlying, strike_price, option_type, expiry_date, entry_price, quantity, entry_date, status, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, 'manual') RETURNING *`,
    )
    .bind(
      input.underlying,
      input.strikePrice,
      input.optionType,
      input.expiryDate,
      input.entryPrice,
      input.quantity,
      input.entryDate,
      input.notes ?? null,
    )
    .first<OptionTradeRow>()
  return toOptionTrade(result!)
}

export async function updateOptionTrade(
  db: D1Database,
  id: number,
  patch: Partial<CreateOptionTradeInput> & Partial<CloseOptionTradeInput>,
): Promise<OptionTrade | null> {
  const existing = await db
    .prepare('SELECT * FROM options_trades WHERE id = ?')
    .bind(id)
    .first<OptionTradeRow>()
  if (!existing) return null
  const current = toOptionTrade(existing)
  const merged = { ...current, ...patch }

  const isClosing = patch.exitPrice !== undefined && patch.exitDate !== undefined
  const status = isClosing ? 'CLOSED' : current.status
  const realizedPnl = isClosing && merged.entryPrice !== null
    ? merged.quantity * (patch.exitPrice! - merged.entryPrice)
    : current.realizedPnl

  const result = await db
    .prepare(
      `UPDATE options_trades SET underlying = ?, strike_price = ?, option_type = ?, expiry_date = ?, entry_price = ?, exit_price = ?, quantity = ?, entry_date = ?, exit_date = ?, status = ?, realized_pnl = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .bind(
      merged.underlying,
      merged.strikePrice,
      merged.optionType,
      merged.expiryDate,
      merged.entryPrice,
      merged.exitPrice ?? null,
      merged.quantity,
      merged.entryDate,
      merged.exitDate ?? null,
      status,
      realizedPnl,
      merged.notes ?? null,
      id,
    )
    .first<OptionTradeRow>()
  return result ? toOptionTrade(result) : null
}

export async function deleteOptionTrade(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM options_trades WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

// --- Intraday trades ---

export interface CreateIntradayTradeInput {
  symbol: string
  buyPrice: number
  sellPrice: number
  quantity: number
  tradeDate: string
  notes?: string | null
}

export async function listIntradayTrades(db: D1Database): Promise<IntradayTrade[]> {
  const { results } = await db
    .prepare('SELECT * FROM intraday_trades ORDER BY trade_date DESC, id DESC')
    .all<IntradayTradeRow>()
  return results.map(toIntradayTrade)
}

export async function createIntradayTrade(
  db: D1Database,
  input: CreateIntradayTradeInput,
): Promise<IntradayTrade> {
  const realizedPnl = input.quantity * (input.sellPrice - input.buyPrice)
  const result = await db
    .prepare(
      `INSERT INTO intraday_trades (symbol, buy_price, sell_price, quantity, trade_date, realized_pnl, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'manual') RETURNING *`,
    )
    .bind(
      input.symbol,
      input.buyPrice,
      input.sellPrice,
      input.quantity,
      input.tradeDate,
      realizedPnl,
      input.notes ?? null,
    )
    .first<IntradayTradeRow>()
  return toIntradayTrade(result!)
}

export async function updateIntradayTrade(
  db: D1Database,
  id: number,
  patch: Partial<CreateIntradayTradeInput>,
): Promise<IntradayTrade | null> {
  const existing = await db
    .prepare('SELECT * FROM intraday_trades WHERE id = ?')
    .bind(id)
    .first<IntradayTradeRow>()
  if (!existing) return null
  const merged = { ...toIntradayTrade(existing), ...patch }
  const realizedPnl = merged.buyPrice !== null
    ? merged.quantity * (merged.sellPrice - merged.buyPrice)
    : existing.realized_pnl
  const result = await db
    .prepare(
      `UPDATE intraday_trades SET symbol = ?, buy_price = ?, sell_price = ?, quantity = ?, trade_date = ?, realized_pnl = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .bind(
      merged.symbol,
      merged.buyPrice,
      merged.sellPrice,
      merged.quantity,
      merged.tradeDate,
      realizedPnl,
      merged.notes ?? null,
      id,
    )
    .first<IntradayTradeRow>()
  return result ? toIntradayTrade(result) : null
}

export async function deleteIntradayTrade(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM intraday_trades WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

// --- Price cache ---

export interface PriceCacheRow {
  symbol: string
  price: number
  source: 'manual' | 'fyers'
  updated_at: string
}

export async function getCachedPrice(db: D1Database, symbol: string): Promise<PriceCacheRow | null> {
  const result = await db
    .prepare('SELECT * FROM price_cache WHERE symbol = ?')
    .bind(symbol)
    .first<PriceCacheRow>()
  return result ?? null
}

export async function setCachedPrice(
  db: D1Database,
  symbol: string,
  price: number,
  source: 'manual' | 'fyers',
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO price_cache (symbol, price, source, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(symbol) DO UPDATE SET price = excluded.price, source = excluded.source, updated_at = excluded.updated_at`,
    )
    .bind(symbol, price, source)
    .run()
}

// --- Broker-synced fills (idempotent upsert, keyed on source+externalId) ---

export interface OptionFillInput {
  underlying: string
  strikePrice: number
  optionType: 'CE' | 'PE'
  expiryDate: string
  entryPrice: number | null
  exitPrice: number | null
  quantity: number
  entryDate: string
  exitDate: string | null
  status: 'OPEN' | 'CLOSED'
  realizedPnl: number | null
  notes?: string | null
  source: 'aliceblue'
  externalId: string
}

export async function upsertOptionFill(db: D1Database, fill: OptionFillInput): Promise<OptionTrade> {
  const result = await db
    .prepare(
      `INSERT INTO options_trades (underlying, strike_price, option_type, expiry_date, entry_price, exit_price, quantity, entry_date, exit_date, status, realized_pnl, notes, source, external_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source, external_id) DO UPDATE SET
         underlying = excluded.underlying, strike_price = excluded.strike_price, option_type = excluded.option_type,
         expiry_date = excluded.expiry_date, entry_price = excluded.entry_price, exit_price = excluded.exit_price,
         quantity = excluded.quantity, entry_date = excluded.entry_date, exit_date = excluded.exit_date,
         status = excluded.status, realized_pnl = excluded.realized_pnl, notes = excluded.notes
       RETURNING *`,
    )
    .bind(
      fill.underlying,
      fill.strikePrice,
      fill.optionType,
      fill.expiryDate,
      fill.entryPrice,
      fill.exitPrice,
      fill.quantity,
      fill.entryDate,
      fill.exitDate,
      fill.status,
      fill.realizedPnl,
      fill.notes ?? null,
      fill.source,
      fill.externalId,
    )
    .first<OptionTradeRow>()
  return toOptionTrade(result!)
}

export async function findOpenOptionTradesBySource(
  db: D1Database,
  source: 'aliceblue',
): Promise<OptionTrade[]> {
  const { results } = await db
    .prepare("SELECT * FROM options_trades WHERE source = ? AND status = 'OPEN' ORDER BY entry_date ASC, id ASC")
    .bind(source)
    .all<OptionTradeRow>()
  return results.map(toOptionTrade)
}

export interface IntradayFillInput {
  symbol: string
  buyPrice: number | null
  sellPrice: number
  quantity: number
  tradeDate: string
  realizedPnl: number | null
  notes?: string | null
  source: 'dhan'
  externalId: string
}

export async function upsertIntradayFill(db: D1Database, fill: IntradayFillInput): Promise<IntradayTrade> {
  const result = await db
    .prepare(
      `INSERT INTO intraday_trades (symbol, buy_price, sell_price, quantity, trade_date, realized_pnl, notes, source, external_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source, external_id) DO UPDATE SET
         symbol = excluded.symbol, buy_price = excluded.buy_price, sell_price = excluded.sell_price,
         quantity = excluded.quantity, trade_date = excluded.trade_date, realized_pnl = excluded.realized_pnl,
         notes = excluded.notes
       RETURNING *`,
    )
    .bind(
      fill.symbol,
      fill.buyPrice,
      fill.sellPrice,
      fill.quantity,
      fill.tradeDate,
      fill.realizedPnl,
      fill.notes ?? null,
      fill.source,
      fill.externalId,
    )
    .first<IntradayTradeRow>()
  return toIntradayTrade(result!)
}

// --- Expenses ---

export interface CreateExpenseInput {
  expenseDate: string
  category: string
  amount: number
  description?: string | null
  notes?: string | null
  source?: 'manual' | 'csv_axio'
}

export async function listExpenses(db: D1Database): Promise<Expense[]> {
  const { results } = await db
    .prepare('SELECT * FROM expenses ORDER BY expense_date DESC, id DESC')
    .all<ExpenseRow>()
  return results.map(toExpense)
}

export async function createExpense(db: D1Database, input: CreateExpenseInput): Promise<Expense> {
  const result = await db
    .prepare(
      `INSERT INTO expenses (expense_date, category, amount, description, notes, source)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .bind(
      input.expenseDate,
      input.category,
      input.amount,
      input.description ?? null,
      input.notes ?? null,
      input.source ?? 'manual',
    )
    .first<ExpenseRow>()
  return toExpense(result!)
}

export async function updateExpense(
  db: D1Database,
  id: number,
  patch: Partial<CreateExpenseInput>,
): Promise<Expense | null> {
  const existing = await db.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first<ExpenseRow>()
  if (!existing) return null
  const merged = { ...toExpense(existing), ...patch }
  const result = await db
    .prepare(
      `UPDATE expenses SET expense_date = ?, category = ?, amount = ?, description = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .bind(merged.expenseDate, merged.category, merged.amount, merged.description ?? null, merged.notes ?? null, id)
    .first<ExpenseRow>()
  return result ? toExpense(result) : null
}

export async function deleteExpense(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}

// --- Broker token cache ---

export async function getBrokerToken(db: D1Database, broker: BrokerName): Promise<BrokerTokenRow | null> {
  const result = await db.prepare('SELECT * FROM broker_tokens WHERE broker = ?').bind(broker).first<BrokerTokenRow>()
  return result ?? null
}

export async function setBrokerToken(
  db: D1Database,
  broker: BrokerName,
  accessToken: string,
  expiresAt: string,
  extra?: unknown,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO broker_tokens (broker, access_token, extra_json, expires_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(broker) DO UPDATE SET access_token = excluded.access_token, extra_json = excluded.extra_json,
         expires_at = excluded.expires_at, updated_at = excluded.updated_at`,
    )
    .bind(broker, accessToken, extra !== undefined ? JSON.stringify(extra) : null, expiresAt)
    .run()
}

// --- Sync state (for the dashboard's Broker Sync panel) ---

export async function getSyncState(db: D1Database, broker: BrokerName): Promise<SyncStatus | null> {
  const result = await db.prepare('SELECT * FROM sync_state WHERE broker = ?').bind(broker).first<SyncStateRow>()
  return result ? toSyncStatus(result) : null
}

export async function listSyncStates(db: D1Database): Promise<SyncStatus[]> {
  const { results } = await db.prepare('SELECT * FROM sync_state').all<SyncStateRow>()
  return results.map(toSyncStatus)
}

function toSyncStatus(r: SyncStateRow): SyncStatus {
  return {
    broker: r.broker,
    status: r.status,
    lastSyncedAt: r.last_synced_at,
    lastError: r.last_error,
    lastRunSummary: r.last_run_summary ? JSON.parse(r.last_run_summary) : null,
  }
}

export async function setSyncRunning(db: D1Database, broker: BrokerName): Promise<void> {
  await db
    .prepare(
      `INSERT INTO sync_state (broker, status, updated_at) VALUES (?, 'running', datetime('now'))
       ON CONFLICT(broker) DO UPDATE SET status = 'running', updated_at = datetime('now')`,
    )
    .bind(broker)
    .run()
}

export async function setSyncResult(
  db: D1Database,
  broker: BrokerName,
  result: { status: 'success' | 'error'; error?: string | null; summary?: unknown },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO sync_state (broker, status, last_synced_at, last_error, last_run_summary, updated_at)
       VALUES (?, ?, datetime('now'), ?, ?, datetime('now'))
       ON CONFLICT(broker) DO UPDATE SET status = excluded.status, last_synced_at = excluded.last_synced_at,
         last_error = excluded.last_error, last_run_summary = excluded.last_run_summary, updated_at = excluded.updated_at`,
    )
    .bind(broker, result.status, result.error ?? null, result.summary !== undefined ? JSON.stringify(result.summary) : null)
    .run()
}
