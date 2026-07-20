import { PageContainer } from '../components/layout/PageContainer.tsx'
import { IntradayTradeForm, type IntradayTradeFormValues } from '../components/shared/IntradayTradeForm.tsx'
import { TransactionsList } from '../components/shared/TransactionsList.tsx'
import { useIntradayTrades } from '../hooks/useIntradayTrades.ts'
import * as api from '../lib/apiClient.ts'
import { formatCurrency, formatDate, formatNumber, pnlColorClass } from '../lib/formatters.ts'

export function IntradayPage() {
  const { trades, refresh } = useIntradayTrades()

  const handleCreate = async (values: IntradayTradeFormValues) => {
    await api.createIntraday({
      symbol: values.symbol,
      buyPrice: Number(values.buyPrice),
      sellPrice: Number(values.sellPrice),
      quantity: Number(values.quantity),
      tradeDate: values.tradeDate,
      notes: values.notes || null,
    })
    await refresh()
  }

  return (
    <PageContainer title="Intraday">
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Add trade</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <IntradayTradeForm onSubmit={handleCreate} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-600">Trade history</h2>
        <TransactionsList
          transactions={trades}
          onDelete={async (t) => {
            await api.deleteIntraday(t.id)
            await refresh()
          }}
          renderEditForm={(t, close) => (
            <IntradayTradeForm
              onCancel={close}
              onSubmit={async (values) => {
                await api.updateIntraday(t.id, {
                  symbol: values.symbol,
                  buyPrice: Number(values.buyPrice),
                  sellPrice: Number(values.sellPrice),
                  quantity: Number(values.quantity),
                  tradeDate: values.tradeDate,
                  notes: values.notes || null,
                })
                await refresh()
                close()
              }}
            />
          )}
          columns={[
            { header: 'Date', render: (t) => formatDate(t.tradeDate) },
            { header: 'Symbol', render: (t) => t.symbol },
            { header: 'Qty', align: 'right', render: (t) => formatNumber(t.quantity) },
            { header: 'Buy', align: 'right', render: (t) => formatCurrency(t.buyPrice) },
            { header: 'Sell', align: 'right', render: (t) => formatCurrency(t.sellPrice) },
            {
              header: 'Realized P&L',
              align: 'right',
              render: (t) => <span className={pnlColorClass(t.realizedPnl)}>{formatCurrency(t.realizedPnl)}</span>,
            },
          ]}
        />
      </section>
    </PageContainer>
  )
}
