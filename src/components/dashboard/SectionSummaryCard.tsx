import { formatCurrency } from '../../lib/formatters.ts'

interface SectionSummaryCardProps {
  title: string
  icon: string
  // Current holdings only (optional - can be hidden for day trading)
  currentInvested?: number
  currentValue?: number
  currentUnrealizedPnL?: number
  currentActiveCount?: number
  // Overall totals (current + past)
  totalInvested: number
  totalRealizedPnL: number
  totalUnrealizedPnL: number
  // Show current holdings section? (default: true)
  showCurrentSection?: boolean
}

export function SectionSummaryCard({
  title,
  icon,
  currentInvested = 0,
  currentValue = 0,
  currentUnrealizedPnL = 0,
  currentActiveCount = 0,
  totalInvested,
  totalRealizedPnL,
  totalUnrealizedPnL,
  showCurrentSection = true,
}: SectionSummaryCardProps) {
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL
  const returnPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const isPositive = totalPnL >= 0

  return (
    <div className="card-premium space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-sm font-semibold text-[#cbd5e1] uppercase tracking-wide">{title}</h3>
          </div>
          {showCurrentSection && (
            <div className="text-xs text-[#94a3b8]">{currentActiveCount} active position{currentActiveCount !== 1 ? 's' : ''}</div>
          )}
        </div>
        <div className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(returnPercent).toFixed(2)}%</span>
        </div>
      </div>

      {/* Current Holdings Section - Optional */}
      {showCurrentSection && (
        <div className="pt-3 border-t border-[#2a3f5f]">
          <div className="text-xs font-semibold text-[#cbd5e1] mb-3 uppercase tracking-wide">Current Holdings</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#94a3b8] mb-1">Invested</div>
              <div className="text-lg font-bold text-[#f8fafc]">{formatCurrency(currentInvested)}</div>
            </div>
            <div>
              <div className="text-xs text-[#94a3b8] mb-1">Current Value</div>
              <div className="text-lg font-bold text-[#f8fafc]">{formatCurrency(currentValue)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-[#94a3b8] mb-1">P&L (Unrealized)</div>
              <div className={`text-base font-bold ${currentUnrealizedPnL >= 0 ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
                {currentUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(currentUnrealizedPnL)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Section */}
      <div className="pt-3 border-t border-[#2a3f5f]">
        <div className="text-xs font-semibold text-[#cbd5e1] mb-3 uppercase tracking-wide">Overall (Current + Past)</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#94a3b8] mb-1">Total Invested</div>
            <div className="text-lg font-bold text-[#f8fafc]">{formatCurrency(totalInvested)}</div>
          </div>
          <div>
            <div className="text-xs text-[#94a3b8] mb-1">Realized P&L</div>
            <div className={`text-base font-bold ${totalRealizedPnL >= 0 ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
              {totalRealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalRealizedPnL)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#94a3b8] mb-1">Unrealized P&L</div>
            <div className={`text-base font-bold ${totalUnrealizedPnL >= 0 ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnL)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#94a3b8] mb-1">Total P&L</div>
            <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-[#6ee7b7]' : 'text-[#f87171]'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
