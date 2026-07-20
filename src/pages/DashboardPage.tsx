import { PageContainer } from '../components/layout/PageContainer.tsx'
import { PremiumKPICard } from '../components/dashboard/PremiumKPICard.tsx'
import { MetricsPanel } from '../components/dashboard/MetricsPanel.tsx'
import { MetricsPanelSkeleton } from '../components/dashboard/LoadingSkeletons.tsx'
import { DateRangePicker } from '../components/shared/DateRangePicker.tsx'
import { BrokerSyncPanel } from '../components/dashboard/BrokerSyncPanel.tsx'
import { PnLWaterfallChart, PortfolioAllocationChart, PerformanceTimelineChart, AssetClassComparisonChart } from '../components/dashboard/PnLCharts.tsx'
import { useDashboard } from '../hooks/useDashboard.ts'
import { formatCurrency } from '../lib/formatters.ts'

export function DashboardPage() {
  const { data, loading, error, from, to, setFrom, setTo } = useDashboard()

  const waterfallData = data ? [
    { category: 'Stocks', value: data.realized.stocks },
    { category: 'Options', value: data.realized.options },
    { category: 'Metals', value: data.realized.metals },
    { category: 'Intraday', value: data.realized.intraday },
  ] : []

  const allocationData = data ? [
    { name: 'Stocks', value: Math.abs(data.invested.stocks) },
    { name: 'Options', value: Math.abs(data.invested.options) },
    { name: 'Metals', value: Math.abs(data.invested.metals) },
  ].filter(d => d.value > 0) : []

  const timelineData = data ? [
    { date: data.range.from, realized: data.realized.stocks, cumulative: data.realized.stocks },
    { date: data.range.to, realized: data.realized.stocks + data.realized.options + data.realized.metals, cumulative: data.overall.realizedTotal },
  ] : []

  const assetComparisonData = data ? [
    { name: 'Stocks', invested: data.invested.stocks, current: data.invested.stocks + data.unrealized.stocks, pnl: data.unrealized.stocks + data.realized.stocks },
    { name: 'Options', invested: data.invested.options, current: data.invested.options, pnl: data.realized.options },
    { name: 'Metals', invested: data.invested.metals, current: data.invested.metals + data.unrealized.metals, pnl: data.unrealized.metals + data.realized.metals },
  ] : []

  return (
    <PageContainer title="Premium Trading Dashboard">
      <BrokerSyncPanel />

      <div className="mb-8">
        <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t) }} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#dc2626] bg-[#dc2626]/10 p-4 text-[#fca5a5]">
          {error}
        </div>
      )}

      {loading && !data ? (
        <MetricsPanelSkeleton />
      ) : data ? (
        <>
          {/* Portfolio Overview */}
          <MetricsPanel title="Portfolio Overview" description="Your complete trading portfolio snapshot" icon="💼">
            <PremiumKPICard
              label="Total P&L"
              value={formatCurrency(data.overall.grandTotal)}
              trend={(data.overall.grandTotal / (data.invested.total || 1)) * 100}
              colorByValue={true}
              animated={true}
              delay={0}
            />
            <PremiumKPICard
              label="Realized P&L"
              value={formatCurrency(data.overall.realizedTotal)}
              subtitle={`${data.range.from} → ${data.range.to}`}
              colorByValue={true}
              animated={true}
              delay={50}
            />
            <PremiumKPICard
              label="Unrealized P&L"
              value={formatCurrency(data.overall.unrealizedTotal)}
              colorByValue={true}
              animated={true}
              delay={100}
            />
            <PremiumKPICard
              label="Total Invested"
              value={formatCurrency(data.invested.total)}
              animated={true}
              delay={150}
            />
          </MetricsPanel>

          {/* Asset-wise Breakdown */}
          <MetricsPanel title="Asset Class Performance" description="Detailed breakdown by investment type" icon="📊">
            <PremiumKPICard
              label="Stocks P&L"
              value={formatCurrency(data.realized.stocks + data.unrealized.stocks)}
              subtitle={`Invested: ${formatCurrency(data.invested.stocks)}`}
              colorByValue={true}
              animated={true}
              delay={0}
            />
            <PremiumKPICard
              label="Options P&L"
              value={formatCurrency(data.realized.options)}
              subtitle={`Invested: ${formatCurrency(data.invested.options)}`}
              colorByValue={true}
              animated={true}
              delay={50}
            />
            <PremiumKPICard
              label="Metals P&L"
              value={formatCurrency(data.realized.metals + data.unrealized.metals)}
              subtitle={`Invested: ${formatCurrency(data.invested.metals)}`}
              colorByValue={true}
              animated={true}
              delay={100}
            />
            <PremiumKPICard
              label="Intraday Trades"
              value={formatCurrency(data.realized.intraday)}
              colorByValue={true}
              animated={true}
              delay={150}
            />
          </MetricsPanel>

          {/* Charts Section */}
          <div className="mb-8 space-y-6">
            <h2 className="text-2xl font-bold text-[#e0f2fe]">📈 Detailed Analytics</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="animate-slide-in-up">
                <PnLWaterfallChart data={waterfallData} />
              </div>
              <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                {allocationData.length > 0 && <PortfolioAllocationChart data={allocationData} />}
              </div>
              <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                <PerformanceTimelineChart data={timelineData} />
              </div>
              <div className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
                <AssetClassComparisonChart data={assetComparisonData} />
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <MetricsPanel title="Expense Tracking" description="Monitor your trading costs" icon="💰">
            <PremiumKPICard
              label="Total Expenses"
              value={formatCurrency(data.expenses.total)}
              subtitle={`${data.range.from} → ${data.range.to}`}
              animated={true}
              delay={0}
            />
          </MetricsPanel>
        </>
      ) : null}
    </PageContainer>
  )
}
