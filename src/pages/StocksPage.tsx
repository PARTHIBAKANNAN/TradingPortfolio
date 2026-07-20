import { PageContainer } from '../components/layout/PageContainer.tsx'
import { SectionSummaryCard } from '../components/dashboard/SectionSummaryCard.tsx'
import { HoldingsTable } from '../components/shared/HoldingsTable.tsx'
import { StockTransactionForm, type StockTransactionFormValues } from '../components/shared/StockTransactionForm.tsx'
import { TransactionsList } from '../components/shared/TransactionsList.tsx'
import { CsvUploadWidget } from '../components/shared/CsvUploadWidget.tsx'
import { useHoldings } from '../hooks/useHoldings.ts'
import { useStockTransactions } from '../hooks/useStockTransactions.ts'
import * as api from '../lib/apiClient.ts'
import { formatCurrency, formatDate, formatNumber, pnlColorClass } from '../lib/formatters.ts'
import type { StockTransaction } from '@shared/types.ts'

export function StocksPage() {
  const { holdings, refresh: refreshHoldings } = useHoldings('stocks')
  const { transactions, refresh: refreshTransactions } = useStockTransactions()

  const refreshAll = () => Promise.all([refreshHoldings(), refreshTransactions()])

  const handleSetPrice = async (symbol: string, price: number) => {
    await api.setPrice(symbol, price)
    await refreshHoldings()
  }

  const handleApplyWhatIf = async (symbol: string, qty: number, price: number) => {
    await api.createStock({
      symbol,
      tradeType: 'BUY',
      quantity: qty,
      price,
      tradeDate: new Date().toISOString().slice(0, 10),
    })
    await refreshAll()
  }

  const handleCreate = async (values: StockTransactionFormValues) => {
    await api.createStock({
      symbol: values.symbol,
      companyName: values.companyName || null,
      tradeType: values.tradeType,
      quantity: Number(values.quantity),
      price: Number(values.price),
      tradeDate: values.tradeDate,
      notes: values.notes || null,
    })
    await refreshAll()
  }

  // Calculate section summary
  const activeHoldings = holdings.filter(h => h.quantity > 0)

  // Current holdings (active positions only)
  const currentInvested = activeHoldings.reduce((sum, h) => sum + h.investedValue, 0)
  const currentValue = activeHoldings.reduce((sum, h) => sum + (h.currentValue ?? 0), 0)
  const currentUnrealized = activeHoldings.reduce((sum, h) => sum + (h.unrealizedPnl ?? 0), 0)

  // Overall totals (current + closed) - calculate from transactions since API doesn't provide invested values for closed positions
  const totalInvested = transactions
    .filter(t => t.tradeType === 'BUY')
    .reduce((sum, t) => sum + t.quantity * t.price, 0)
  const totalRealized = holdings.reduce((sum, h) => sum + (h.realizedPnl ?? 0), 0)
  const totalUnrealized = activeHoldings.reduce((sum, h) => sum + (h.unrealizedPnl ?? 0), 0)

  return (
    <PageContainer title="Stocks">
      <section className="mb-8">
        <SectionSummaryCard
          title="Stock Portfolio"
          icon="📈"
          currentInvested={currentInvested}
          currentValue={currentValue}
          currentUnrealizedPnL={currentUnrealized}
          currentActiveCount={activeHoldings.length}
          totalInvested={totalInvested}
          totalRealizedPnL={totalRealized}
          totalUnrealizedPnL={totalUnrealized}
        />
      </section>

      <section className="mb-8 section-container">
        <div className="section-header">
          <span className="text-2xl">📊</span>
          <h2>Current Holdings</h2>
          <span className="badge">{activeHoldings.length} active</span>
        </div>
        <HoldingsTable
          holdings={holdings}
          transactions={transactions}
          onSetPrice={handleSetPrice}
          onApplyWhatIf={handleApplyWhatIf}
        />
      </section>

      <section className="section-container">
        <div className="section-header">
          <span className="text-2xl">➕</span>
          <h2>Add Transaction</h2>
        </div>
        <div className="card-premium">
          <StockTransactionForm onSubmit={handleCreate} />
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <span className="text-2xl">📥</span>
          <h2>Import from Groww (CSV)</h2>
        </div>
        <CsvUploadWidget
          importFn={api.importStocksCsv}
          onImported={refreshAll}
          renderPreviewRow={(row: Partial<StockTransaction>) =>
            `${row.symbol} — ${row.tradeType} ${row.quantity} @ ${row.price} on ${row.tradeDate}`
          }
        />
      </section>

      <section className="section-container">
        <div className="section-header">
          <span className="text-2xl">📋</span>
          <h2>Transaction History</h2>
        </div>
        <TransactionsList
          transactions={transactions}
          onDelete={async (t) => {
            await api.deleteStock(t.id)
            await refreshAll()
          }}
          renderEditForm={(t, close) => (
            <StockTransactionForm
              submitLabel="Save changes"
              initial={{
                symbol: t.symbol,
                companyName: t.companyName ?? '',
                tradeType: t.tradeType,
                quantity: String(t.quantity),
                price: String(t.price),
                tradeDate: t.tradeDate,
                notes: t.notes ?? '',
              }}
              onCancel={close}
              onSubmit={async (values) => {
                await api.updateStock(t.id, {
                  symbol: values.symbol,
                  companyName: values.companyName || null,
                  tradeType: values.tradeType,
                  quantity: Number(values.quantity),
                  price: Number(values.price),
                  tradeDate: values.tradeDate,
                  notes: values.notes || null,
                })
                await refreshAll()
                close()
              }}
            />
          )}
          columns={[
            { header: 'Date', render: (t) => formatDate(t.tradeDate) },
            { header: 'Symbol', render: (t) => t.symbol },
            { header: 'Type', render: (t) => t.tradeType },
            { header: 'Qty', align: 'right', render: (t) => formatNumber(t.quantity) },
            { header: 'Price', align: 'right', render: (t) => formatCurrency(t.price) },
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
