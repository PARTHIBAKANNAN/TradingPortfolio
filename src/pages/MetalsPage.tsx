import { PageContainer } from '../components/layout/PageContainer.tsx'
import { SectionSummaryCard } from '../components/dashboard/SectionSummaryCard.tsx'
import { HoldingsTable } from '../components/shared/HoldingsTable.tsx'
import { MetalTransactionForm, type MetalTransactionFormValues } from '../components/shared/MetalTransactionForm.tsx'
import { TransactionsList } from '../components/shared/TransactionsList.tsx'
import { CsvUploadWidget } from '../components/shared/CsvUploadWidget.tsx'
import { useHoldings } from '../hooks/useHoldings.ts'
import { useMetalTransactions } from '../hooks/useMetalTransactions.ts'
import * as api from '../lib/apiClient.ts'
import { formatCurrency, formatDate, formatNumber, pnlColorClass } from '../lib/formatters.ts'
import type { MetalTransaction } from '@shared/types.ts'

export function MetalsPage() {
  const { holdings, refresh: refreshHoldings } = useHoldings('metals')
  const { transactions, refresh: refreshTransactions } = useMetalTransactions()

  const refreshAll = () => Promise.all([refreshHoldings(), refreshTransactions()])

  const handleSetPrice = async (metalType: string, price: number) => {
    await api.setPrice(metalType, price)
    await refreshHoldings()
  }

  const handleApplyWhatIf = async (metalType: string, qty: number, price: number) => {
    await api.createMetal({
      metalType: metalType as 'GOLD' | 'SILVER',
      tradeType: 'BUY',
      quantityGrams: qty,
      pricePerGram: price,
      tradeDate: new Date().toISOString().slice(0, 10),
    })
    await refreshAll()
  }

  const handleCreate = async (values: MetalTransactionFormValues) => {
    await api.createMetal({
      metalType: values.metalType,
      tradeType: values.tradeType,
      quantityGrams: Number(values.quantityGrams),
      pricePerGram: Number(values.pricePerGram),
      tax: Number(values.tax) || 0,
      spreadCharge: Number(values.spreadCharge) || 0,
      otherCharges: Number(values.otherCharges) || 0,
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
    .reduce((sum, t) => sum + t.quantityGrams * (t.effectivePricePerGram ?? 0), 0)
  const totalRealized = holdings.reduce((sum, h) => sum + (h.realizedPnl ?? 0), 0)
  const totalUnrealized = activeHoldings.reduce((sum, h) => sum + (h.unrealizedPnl ?? 0), 0)

  return (
    <PageContainer title="Gold & Silver (Aura Gold)">
      <section className="mb-8">
        <SectionSummaryCard
          title="Metals Portfolio"
          icon="🏆"
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
          <span className="text-2xl">💎</span>
          <h2>Current Holdings</h2>
          <span className="badge">{activeHoldings.length} active</span>
        </div>
        <HoldingsTable
          holdings={holdings}
          quantityLabel="Grams"
          transactions={transactions.map((t) => ({
            symbol: t.metalType,
            tradeType: t.tradeType,
            quantity: t.quantityGrams,
            price: t.effectivePricePerGram ?? 0,
          }))}
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
          <MetalTransactionForm onSubmit={handleCreate} />
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <span className="text-2xl">📥</span>
          <h2>Import from Aura Gold (CSV)</h2>
        </div>
        <CsvUploadWidget
          importFn={api.importMetalsCsv}
          onImported={refreshAll}
          renderPreviewRow={(row: Partial<MetalTransaction>) =>
            `${row.metalType} — ${row.tradeType} ${row.quantityGrams}g @ ${row.pricePerGram} on ${row.tradeDate}`
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
            await api.deleteMetal(t.id)
            await refreshAll()
          }}
          renderEditForm={(t, close) => (
            <MetalTransactionForm
              submitLabel="Save changes"
              initial={{
                metalType: t.metalType,
                tradeType: t.tradeType,
                quantityGrams: String(t.quantityGrams),
                pricePerGram: String(t.pricePerGram),
                tax: String(t.tax || 0),
                spreadCharge: String(t.spreadCharge || 0),
                otherCharges: String(t.otherCharges || 0),
                tradeDate: t.tradeDate,
                notes: t.notes ?? '',
              }}
              onCancel={close}
              onSubmit={async (values) => {
                await api.updateMetal(t.id, {
                  metalType: values.metalType,
                  tradeType: values.tradeType,
                  quantityGrams: Number(values.quantityGrams),
                  pricePerGram: Number(values.pricePerGram),
                  tax: Number(values.tax) || 0,
                  spreadCharge: Number(values.spreadCharge) || 0,
                  otherCharges: Number(values.otherCharges) || 0,
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
            { header: 'Metal', render: (t) => (t.metalType === 'GOLD' ? 'Gold' : 'Silver') },
            { header: 'Type', render: (t) => t.tradeType },
            { header: 'Grams', align: 'right', render: (t) => formatNumber(t.quantityGrams) },
            { header: 'Price/g', align: 'right', render: (t) => formatCurrency(t.pricePerGram) },
            {
              header: 'Charges',
              align: 'right',
              render: (t) => {
                const total = (t.tax || 0) + (t.spreadCharge || 0) + (t.otherCharges || 0)
                return total > 0 ? `₹${total.toFixed(2)}` : '—'
              },
            },
            { header: 'Eff. Price/g', align: 'right', render: (t) => formatCurrency(t.effectivePricePerGram) },
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
