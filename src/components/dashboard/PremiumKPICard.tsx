import type { ReactNode } from 'react'
import { pnlColorClass } from '../../lib/formatters.ts'

interface PremiumKPICardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: number
  subtitle?: string
  colorByValue?: boolean
  animated?: boolean
  delay?: number
}

export function PremiumKPICard({
  label,
  value,
  icon,
  trend,
  subtitle,
  colorByValue = false,
  animated = true,
  delay = 0,
}: PremiumKPICardProps) {
  const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
  const textColorClass = colorByValue ? pnlColorClass(numValue) : 'text-[#e0f2fe]'

  return (
    <div
      className={`kpi-card relative ${animated ? 'animate-slide-in-up' : ''}`}
      style={animated ? { animationDelay: `${delay}ms` } : {}}
    >
      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-widest text-[#cbd5e1]">{label}</div>
          {icon && <div className="text-[#3b82f6] group-hover:text-[#60a5fa] transition-colors">{icon}</div>}
        </div>

        {/* Main Value */}
        <div className={`mb-2 text-4xl font-bold font-mono tracking-tight ${textColorClass}`}>
          {value}
        </div>

        {/* Trend Indicator */}
        {trend !== undefined && (
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
                trend > 0
                  ? 'bg-[#10b981]/20 text-[#86efac]'
                  : trend < 0
                    ? 'bg-[#dc2626]/20 text-[#fca5a5]'
                    : 'bg-[#475569]/20 text-[#cbd5e1]'
              }`}
            >
              <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
              <span>{Math.abs(trend).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* Subtitle */}
        {subtitle && <div className="text-xs text-[#94a3b8]">{subtitle}</div>}
      </div>

      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3b82f6]/20 to-[#60a5fa]/20 blur-xl" />
      </div>
    </div>
  )
}
