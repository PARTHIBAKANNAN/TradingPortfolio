import { Fragment, useState } from 'react'
import type { HoldingSummary } from '@shared/types.ts'
import { formatCurrency, formatNumber } from '../../lib/formatters.ts'
import { NumberInput } from './FormControls.tsx'
import { InlineWhatIf } from '../calculator/InlineWhatIf.tsx'

interface Transaction {
  symbol: string
  tradeType: 'BUY' | 'SELL'
  quantity: number
  price: number
}

export function HoldingsTable({
  holdings,
  quantityLabel = 'Qty',
  transactions = [],
  onSetPrice,
  onApplyWhatIf,
}: {
  holdings: HoldingSummary[]
  quantityLabel?: string
  transactions?: Transaction[]
  onSetPrice: (key: string, price: number) => Promise<void>
  onApplyWhatIf?: (key: string, qty: number, price: number) => Promise<void>
}) {
  const [editingPriceKey, setEditingPriceKey] = useState<string | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [whatIfKey, setWhatIfKey] = useState<string | null>(null)

  // Helper to calculate transaction stats for a symbol
  const getTransactionStats = (symbol: string) => {
    const buyTxns = transactions.filter((t) => t.symbol === symbol && t.tradeType === 'BUY')
    const sellTxns = transactions.filter((t) => t.symbol === symbol && t.tradeType === 'SELL')

    const totalBuyQty = buyTxns.reduce((sum, t) => sum + t.quantity, 0)
    const totalBuyValue = buyTxns.reduce((sum, t) => sum + t.quantity * t.price, 0)
    const buyAvg = totalBuyQty > 0 ? totalBuyValue / totalBuyQty : 0

    const totalSellQty = sellTxns.reduce((sum, t) => sum + t.quantity, 0)
    const totalSellValue = sellTxns.reduce((sum, t) => sum + t.quantity * t.price, 0)
    const sellAvg = totalSellQty > 0 ? totalSellValue / totalSellQty : 0

    return {
      buyQty: totalBuyQty,
      buyValue: totalBuyValue,
      buyAvg,
      sellQty: totalSellQty,
      sellValue: totalSellValue,
      sellAvg,
    }
  }

  // Separate active holdings (qty > 0) from closed positions (qty = 0)
  const activeHoldings = holdings.filter((h) => h.quantity > 0)
  const closedPositions = holdings.filter((h) => h.quantity === 0)

  if (activeHoldings.length === 0 && closedPositions.length === 0) {
    return <p className="text-sm text-[#94a3b8]">No open holdings yet — add a buy transaction below to get started.</p>
  }

  const startEditingPrice = (h: HoldingSummary) => {
    setEditingPriceKey(h.key)
    setPriceInput(h.currentPrice !== null ? String(h.currentPrice) : '')
  }

  const savePrice = async (key: string) => {
    const price = Number(priceInput)
    if (Number.isFinite(price) && price >= 0) {
      await onSetPrice(key, price)
    }
    setEditingPriceKey(null)
  }

  const ActiveTable = ({ data }: { data: HoldingSummary[] }) => (
    <div className="animate-slide-in-up table-premium overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr>
            <th className="text-left">Symbol</th>
            <th className="text-right">{quantityLabel}</th>
            <th className="text-right">Avg Price</th>
            <th className="text-right">Invested</th>
            <th className="text-right">Current Price</th>
            <th className="text-right">Current Value</th>
            <th className="text-right">Unrealized P&L</th>
            <th className="text-right">Realized P&L</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((h, idx) => {
            const unrealizedIsGain = (h.unrealizedPnl ?? 0) >= 0
            const realizedIsGain = (h.realizedPnl ?? 0) >= 0

            return (
              <Fragment key={h.key}>
                <tr style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className="font-semibold text-[#f8fafc]">{h.label}</td>
                  <td className="text-right text-[#cbd5e1]">{formatNumber(h.quantity)}</td>
                  <td className="text-right text-[#cbd5e1]">{formatCurrency(h.avgPrice)}</td>
                  <td className="text-right text-[#cbd5e1]">{formatCurrency(h.investedValue)}</td>
                  <td className="text-right">
                    {editingPriceKey === h.key ? (
                      <div className="flex items-center justify-end gap-2">
                        <NumberInput
                          autoFocus
                          className="w-24 rounded-lg border border-[#2a3f5f] bg-[#111d3c] px-2 py-1 text-sm text-[#f8fafc] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && savePrice(h.key)}
                        />
                        <button onClick={() => savePrice(h.key)} className="text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd] transition-colors">
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingPrice(h)}
                        className="text-[#60a5fa] hover:text-[#93c5fd] font-medium transition-colors underline decoration-dotted underline-offset-2"
                      >
                        {h.currentPrice !== null ? formatCurrency(h.currentPrice) : 'Set price'}
                        {h.priceSource === 'fyers' && <span className="ml-2 text-xs text-[#6ee7b7] font-semibold">(live)</span>}
                      </button>
                    )}
                  </td>
                  <td className="text-right font-semibold text-[#f8fafc]">{formatCurrency(h.currentValue)}</td>
                  <td className={`text-right font-semibold ${unrealizedIsGain ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
                    {unrealizedIsGain ? '+' : ''}{formatCurrency(h.unrealizedPnl)}
                  </td>
                  <td className={`text-right font-semibold ${realizedIsGain ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
                    {realizedIsGain ? '+' : ''}{formatCurrency(h.realizedPnl)}
                  </td>
                  <td className="text-center">
                    {h.quantity > 0 && (
                      <button
                        type="button"
                        onClick={() => setWhatIfKey(whatIfKey === h.key ? null : h.key)}
                        className="btn-secondary px-3 py-1 text-xs"
                      >
                        What-if
                      </button>
                    )}
                  </td>
                </tr>
                {whatIfKey === h.key && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 border-t border-[#2a3f5f]">
                      <InlineWhatIf
                        holding={h}
                        onApply={onApplyWhatIf ? (qty, price) => onApplyWhatIf(h.key, qty, price) : undefined}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const ClosedPositionsTable = ({ data }: { data: HoldingSummary[] }) => (
    <div className="animate-slide-in-up section-container" style={{ animationDelay: '200ms' }}>
      <div className="section-header">
        <span className="text-2xl">📊</span>
        <h3>Closed Positions (History)</h3>
        <span className="badge">{data.length} closed</span>
      </div>
      <div className="table-premium overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr>
              <th className="text-left">Symbol</th>
              <th className="text-right">Sold Qty</th>
              <th className="text-right">Buy Avg</th>
              <th className="text-right">Sell Avg</th>
              <th className="text-right">Invested</th>
              <th className="text-right">Proceeds</th>
              <th className="text-right">Realized P&L</th>
              <th className="text-right">Return %</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((h, idx) => {
                const stats = getTransactionStats(h.key)
                const isGain = h.realizedPnl >= 0
                const returnPercent = stats.buyValue > 0 ? ((h.realizedPnl / stats.buyValue) * 100) : 0

                return (
                  <tr key={h.key} style={{ animationDelay: `${(idx + 1) * 30}ms` }}>
                    <td className="font-semibold text-[#f8fafc]">{h.label}</td>
                    <td className="text-right text-[#cbd5e1]">{formatNumber(stats.sellQty)}</td>
                    <td className="text-right text-[#cbd5e1]">{formatCurrency(stats.buyAvg)}</td>
                    <td className="text-right text-[#cbd5e1]">{formatCurrency(stats.sellAvg)}</td>
                    <td className="text-right text-[#cbd5e1]">{formatCurrency(stats.buyValue)}</td>
                    <td className="text-right text-[#cbd5e1]">{formatCurrency(stats.sellValue)}</td>
                    <td className={`text-right font-semibold ${isGain ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
                      {isGain ? '+' : ''}{formatCurrency(h.realizedPnl)}
                    </td>
                    <td className={`text-right font-semibold ${isGain ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
                      {isGain ? '+' : ''}{returnPercent.toFixed(2)}%
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[#94a3b8]">
                  No closed positions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {activeHoldings.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <h3 className="text-xl font-bold text-[#e0f2fe]">Active Holdings</h3>
          </div>
          <ActiveTable data={activeHoldings} />
        </div>
      ) : (
        <p className="text-sm text-[#94a3b8]">No active holdings.</p>
      )}

      {closedPositions.length > 0 && <ClosedPositionsTable data={closedPositions} />}
    </div>
  )
}
