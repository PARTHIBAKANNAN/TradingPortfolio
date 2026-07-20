import type { Env } from '../lib/env.ts'
import { json, errorResponse } from '../lib/response.ts'
import {
  listStockTransactions,
  listMetalTransactions,
  listOptionTrades,
  listIntradayTrades,
  listExpenses,
} from '../lib/db.ts'
import { computeStockHoldings, computeMetalHoldings } from '../lib/holdings.ts'
import type { DashboardResponse } from '../../shared/types.ts'
import { getPresetRange } from '../../shared/dateUtils.ts'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const defaultRange = getPresetRange('thisMonth')
  const from = url.searchParams.get('from') ?? defaultRange.from
  const to = url.searchParams.get('to') ?? defaultRange.to

  if (from > to) return errorResponse('"from" date must not be after "to" date')

  const inRange = (date: string) => date >= from && date <= to

  const [stockTxs, metalTxs, optionTrades, intradayTrades, expenses, stockHoldings, metalHoldings] =
    await Promise.all([
      listStockTransactions(env.DB),
      listMetalTransactions(env.DB),
      listOptionTrades(env.DB),
      listIntradayTrades(env.DB),
      listExpenses(env.DB),
      computeStockHoldings(env),
      computeMetalHoldings(env),
    ])

  const realizedStocks = stockTxs
    .filter((t) => t.tradeType === 'SELL' && inRange(t.tradeDate))
    .reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0)

  const realizedMetals = metalTxs
    .filter((t) => t.tradeType === 'SELL' && inRange(t.tradeDate))
    .reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0)

  const realizedOptions = optionTrades
    .filter((t) => t.status === 'CLOSED' && t.exitDate && inRange(t.exitDate))
    .reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0)

  const realizedIntraday = intradayTrades
    .filter((t) => inRange(t.tradeDate))
    .reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0)

  const realizedTotal = realizedStocks + realizedMetals + realizedOptions + realizedIntraday

  const unrealizedStocks = stockHoldings.reduce((sum, h) => sum + (h.unrealizedPnl ?? 0), 0)
  const unrealizedMetals = metalHoldings.reduce((sum, h) => sum + (h.unrealizedPnl ?? 0), 0)
  const unrealizedTotal = unrealizedStocks + unrealizedMetals

  const investedStocks = stockHoldings.reduce((sum, h) => sum + h.investedValue, 0)
  const investedMetals = metalHoldings.reduce((sum, h) => sum + h.investedValue, 0)
  const investedOptions = optionTrades
    .filter((t) => t.status === 'OPEN' && t.entryPrice !== null)
    .reduce((sum, t) => sum + t.quantity * (t.entryPrice ?? 0), 0)
  const investedTotal = investedStocks + investedMetals + investedOptions

  const expensesTotal = expenses.filter((e) => inRange(e.expenseDate)).reduce((sum, e) => sum + e.amount, 0)

  const response: DashboardResponse = {
    range: { from, to },
    realized: {
      stocks: realizedStocks,
      metals: realizedMetals,
      options: realizedOptions,
      intraday: realizedIntraday,
      total: realizedTotal,
    },
    unrealized: {
      stocks: unrealizedStocks,
      metals: unrealizedMetals,
      total: unrealizedTotal,
      asOf: new Date().toISOString(),
    },
    invested: {
      stocks: investedStocks,
      metals: investedMetals,
      options: investedOptions,
      total: investedTotal,
    },
    expenses: {
      total: expensesTotal,
    },
    overall: {
      realizedTotal,
      unrealizedTotal,
      grandTotal: realizedTotal + unrealizedTotal,
    },
  }

  return json(response)
}
