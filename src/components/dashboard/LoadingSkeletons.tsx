export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-[#475569] bg-[#1e293b] p-6">
      <div className="skeleton h-4 w-24 mb-4" />
      <div className="skeleton h-10 w-32 mb-3" />
      <div className="skeleton h-3 w-20" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[#475569] bg-[#1e293b] p-6">
      <div className="skeleton h-6 w-40 mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-8 w-12 rounded" />
            <div className="skeleton h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MetricsPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
