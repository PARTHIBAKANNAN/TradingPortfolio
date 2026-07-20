import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

interface WaterfallChartProps {
  data: Array<{
    category: string
    value: number
  }>
}

export function PnLWaterfallChart({ data }: WaterfallChartProps) {
  const chartData = data.map((item, idx) => ({
    ...item,
    cumulative: data.slice(0, idx + 1).reduce((sum, d) => sum + d.value, 0),
  }))

  return (
    <div className="chart-container">
      <h3 className="text-lg font-bold text-[#e0f2fe] mb-4">P&L Breakdown by Asset Class</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="category" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e0f2fe',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value > 0 ? '#10b981' : '#dc2626'}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PortfolioAllocationProps {
  data: Array<{
    name: string
    value: number
  }>
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export function PortfolioAllocationChart({ data }: PortfolioAllocationProps) {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-bold text-[#e0f2fe] mb-4">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e0f2fe',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PerformanceTimelineProps {
  data: Array<{
    date: string
    realized: number
    cumulative: number
  }>
}

export function PerformanceTimelineChart({ data }: PerformanceTimelineProps) {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-bold text-[#e0f2fe] mb-4">Cumulative P&L Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="date" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e0f2fe',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Cumulative P&L"
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AssetClassComparisonProps {
  data: Array<{
    name: string
    invested: number
    current: number
    pnl: number
  }>
}

export function AssetClassComparisonChart({ data }: AssetClassComparisonProps) {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-bold text-[#e0f2fe] mb-4">Asset Class Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis type="number" stroke="#cbd5e1" />
          <YAxis dataKey="name" type="category" stroke="#cbd5e1" width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e0f2fe',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Bar dataKey="invested" fill="#3b82f6" name="Invested" radius={[0, 8, 8, 0]} />
          <Bar dataKey="current" fill="#10b981" name="Current Value" radius={[0, 8, 8, 0]} />
          <Bar
            dataKey="pnl"
            fill="#ec4899"
            name="P&L"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
