import { useState } from 'react'
import { PageContainer } from '../components/layout/PageContainer.tsx'
import { SectionSummaryCard } from '../components/dashboard/SectionSummaryCard.tsx'
import { OptionsTradeForm, type OptionsTradeFormValues } from '../components/shared/OptionsTradeForm.tsx'
import { CloseOptionForm } from '../components/shared/CloseOptionForm.tsx'
import { SecondaryButton } from '../components/shared/FormControls.tsx'
import { useOptionsTrades } from '../hooks/useOptionsTrades.ts'
import * as api from '../lib/apiClient.ts'
import { formatCurrency, formatDate, formatNumber, pnlColorClass } from '../lib/formatters.ts'

export function OptionsPage() {
  const { trades, refresh } = useOptionsTrades()
  const [closingId, setClosingId] = useState<number | null>(null)

  const handleCreate = async (values: OptionsTradeFormValues) => {
    await api.createOption({
      underlying: values.underlying,
      strikePrice: Number(values.strikePrice),
      optionType: values.optionType,
      expiryDate: values.expiryDate,
      entryPrice: Number(values.entryPrice),
      quantity: Number(values.quantity),
      entryDate: values.entryDate,
      notes: values.notes || null,
    })
    await refresh()
  }

  const handleClose = async (id: number, values: { exitPrice: string; exitDate: string }) => {
    await api.updateOption(id, { exitPrice: Number(values.exitPrice), exitDate: values.exitDate })
    setClosingId(null)
    await refresh()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this options trade?')) return
    await api.deleteOption(id)
    await refresh()
  }

  const open = trades.filter((t) => t.status === 'OPEN')
  const closed = trades.filter((t) => t.status === 'CLOSED')

  // Note: For options day trading, we don't track current holdings separately
  // since positions open and close on the same day
  const currentUnrealized = open.reduce((sum, t) => {
    if (!t.exitPrice) return sum
    return sum + ((t.exitPrice - (t.entryPrice ?? 0)) * t.quantity)
  }, 0)

  // Overall totals (current + closed)
  // Calculate from all trades (both open and closed) to get accurate total invested
  const totalInvested = trades.reduce((sum, t) => sum + ((t.entryPrice ?? 0) * t.quantity), 0)
  const totalRealized = closed.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0)
  const totalUnrealized = currentUnrealized

  return (
    <PageContainer title="Options">
      <section className="mb-8">
        <SectionSummaryCard
          title="Options Portfolio"
          icon="📉"
          totalInvested={totalInvested}
          totalRealizedPnL={totalRealized}
          totalUnrealizedPnL={totalUnrealized}
          showCurrentSection={false}
        />
      </section>

      <section className="section-container">
        <div className="section-header">
          <span className="text-2xl">➕</span>
          <h2>Add Trade</h2>
        </div>
        <div className="card-premium">
          <OptionsTradeForm onSubmit={handleCreate} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Open positions</h2>
        {open.length === 0 ? (
          <p className="text-sm text-slate-500">No open options trades.</p>
        ) : (
          <div className="space-y-2">
            {open.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-medium text-slate-800">
                      {t.underlying} {t.strikePrice} {t.optionType}
                    </span>
                    <span className="ml-2 text-slate-500">
                      exp {formatDate(t.expiryDate)} · qty {formatNumber(t.quantity)} · entry {formatCurrency(t.entryPrice)} on{' '}
                      {formatDate(t.entryDate)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <SecondaryButton
                      type="button"
                      className="px-2 py-1 text-xs"
                      onClick={() => setClosingId(closingId === t.id ? null : t.id)}
                    >
                      Close
                    </SecondaryButton>
                    <SecondaryButton type="button" className="px-2 py-1 text-xs" onClick={() => handleDelete(t.id)}>
                      Delete
                    </SecondaryButton>
                  </div>
                </div>
                {closingId === t.id && (
                  <div className="mt-3">
                    <CloseOptionForm onCancel={() => setClosingId(null)} onSubmit={(values) => handleClose(t.id, values)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Closed positions</h2>
        {closed.length === 0 ? (
          <p className="text-sm text-slate-500">No closed options trades yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Trade</th>
                  <th className="px-3 py-2 text-right">Entry</th>
                  <th className="px-3 py-2 text-right">Exit</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Realized P&amp;L</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {closed.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0 text-slate-900">
                    <td className="px-3 py-2">
                      {t.underlying} {t.strikePrice} {t.optionType}{' '}
                      <span className="text-slate-500">(exp {formatDate(t.expiryDate)})</span>
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.entryPrice)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.exitPrice)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(t.quantity)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${pnlColorClass(t.realizedPnl)}`}>
                      {formatCurrency(t.realizedPnl)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <SecondaryButton type="button" className="px-2 py-0.5 text-xs" onClick={() => handleDelete(t.id)}>
                        Delete
                      </SecondaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  )
}
