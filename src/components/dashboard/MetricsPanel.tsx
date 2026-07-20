import type { ReactNode } from 'react'

interface MetricsPanelProps {
  title: string
  description?: string
  children: ReactNode
  icon?: ReactNode
}

export function MetricsPanel({ title, description, children, icon }: MetricsPanelProps) {
  return (
    <div className="animate-slide-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {icon && <div className="text-2xl text-[#3b82f6]">{icon}</div>}
          <h2 className="text-xl font-bold text-[#e0f2fe]">{title}</h2>
        </div>
        {description && <p className="text-sm text-[#94a3b8]">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  )
}
