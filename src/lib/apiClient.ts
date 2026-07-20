import type {
  StockTransaction,
  MetalTransaction,
  OptionTrade,
  IntradayTrade,
  HoldingSummary,
  DashboardResponse,
  Expense,
  SyncStatus,
  BrokerName,
} from '@shared/types.ts'

export interface SyncRunResult {
  configured: boolean
  summary?: { fetched: number; matched: number; inserted: number; updated: number; skipped: number }
  error?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body
      ? { 'content-type': 'application/json', ...init.headers }
      : init?.headers,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(body.error ?? `Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

// --- Stocks ---

export function listStocks(symbol?: string): Promise<StockTransaction[]> {
  return request(`/api/stocks${symbol ? `?symbol=${encodeURIComponent(symbol)}` : ''}`)
}
export function createStock(input: Partial<StockTransaction>): Promise<StockTransaction> {
  return request('/api/stocks', { method: 'POST', body: JSON.stringify(input) })
}
export function updateStock(id: number, patch: Partial<StockTransaction>): Promise<StockTransaction> {
  return request(`/api/stocks/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
}
export function deleteStock(id: number): Promise<{ deleted: boolean }> {
  return request(`/api/stocks/${id}`, { method: 'DELETE' })
}
export function getStockHoldings(): Promise<HoldingSummary[]> {
  return request('/api/stocks/holdings')
}

// --- Metals ---

export function listMetals(metalType?: string): Promise<MetalTransaction[]> {
  return request(`/api/metals${metalType ? `?metalType=${encodeURIComponent(metalType)}` : ''}`)
}
export function createMetal(input: Partial<MetalTransaction>): Promise<MetalTransaction> {
  return request('/api/metals', { method: 'POST', body: JSON.stringify(input) })
}
export function updateMetal(id: number, patch: Partial<MetalTransaction>): Promise<MetalTransaction> {
  return request(`/api/metals/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
}
export function deleteMetal(id: number): Promise<{ deleted: boolean }> {
  return request(`/api/metals/${id}`, { method: 'DELETE' })
}
export function getMetalHoldings(): Promise<HoldingSummary[]> {
  return request('/api/metals/holdings')
}

// --- Options ---

export function listOptions(): Promise<OptionTrade[]> {
  return request('/api/options')
}
export function createOption(input: Partial<OptionTrade>): Promise<OptionTrade> {
  return request('/api/options', { method: 'POST', body: JSON.stringify(input) })
}
export function updateOption(id: number, patch: Partial<OptionTrade>): Promise<OptionTrade> {
  return request(`/api/options/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
}
export function deleteOption(id: number): Promise<{ deleted: boolean }> {
  return request(`/api/options/${id}`, { method: 'DELETE' })
}

// --- Intraday ---

export function listIntraday(): Promise<IntradayTrade[]> {
  return request('/api/intraday')
}
export function createIntraday(input: Partial<IntradayTrade>): Promise<IntradayTrade> {
  return request('/api/intraday', { method: 'POST', body: JSON.stringify(input) })
}
export function updateIntraday(id: number, patch: Partial<IntradayTrade>): Promise<IntradayTrade> {
  return request(`/api/intraday/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
}
export function deleteIntraday(id: number): Promise<{ deleted: boolean }> {
  return request(`/api/intraday/${id}`, { method: 'DELETE' })
}

// --- Dashboard ---

export function getDashboard(from: string, to: string): Promise<DashboardResponse> {
  return request(`/api/dashboard?from=${from}&to=${to}`)
}

// --- Prices ---

export function getPrice(symbol: string): Promise<{ symbol: string; price: number | null; source: string }> {
  return request(`/api/prices?symbol=${encodeURIComponent(symbol)}`)
}
export function setPrice(symbol: string, price: number): Promise<{ symbol: string; price: number }> {
  return request('/api/prices', { method: 'POST', body: JSON.stringify({ symbol, price }) })
}

// --- CSV import ---

export interface ImportResult<T> {
  insertedCount: number
  skippedCount: number
  errors: { row: number; message: string }[]
  preview: T[]
}

export async function importStocksCsv(file: File, mode: 'preview' | 'commit'): Promise<ImportResult<StockTransaction>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`/api/import/stocks?mode=${mode}`, { method: 'POST', body: formData })
  if (!response.ok) throw new Error('Import failed')
  return response.json()
}

export async function importMetalsCsv(file: File, mode: 'preview' | 'commit'): Promise<ImportResult<MetalTransaction>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`/api/import/metals?mode=${mode}`, { method: 'POST', body: formData })
  if (!response.ok) throw new Error('Import failed')
  return response.json()
}

export async function importExpensesCsv(file: File, mode: 'preview' | 'commit'): Promise<ImportResult<Expense>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`/api/import/expenses?mode=${mode}`, { method: 'POST', body: formData })
  if (!response.ok) throw new Error('Import failed')
  return response.json()
}

// --- Expenses ---

export function listExpenses(): Promise<Expense[]> {
  return request('/api/expenses')
}
export function createExpense(input: Partial<Expense>): Promise<Expense> {
  return request('/api/expenses', { method: 'POST', body: JSON.stringify(input) })
}
export function updateExpense(id: number, patch: Partial<Expense>): Promise<Expense> {
  return request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
}
export function deleteExpense(id: number): Promise<{ deleted: boolean }> {
  return request(`/api/expenses/${id}`, { method: 'DELETE' })
}

// --- Broker sync ---

export function getSyncStatus(): Promise<SyncStatus[]> {
  return request('/api/sync/status')
}
export function triggerBrokerSync(broker: BrokerName): Promise<SyncRunResult> {
  return request(`/api/sync/${broker}`, { method: 'POST' })
}
