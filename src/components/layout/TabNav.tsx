export type TabKey = 'dashboard' | 'stocks' | 'metals' | 'options' | 'intraday' | 'expenses' | 'calculator'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'stocks', label: 'Stocks', icon: '📈' },
  { key: 'metals', label: 'Gold & Silver', icon: '🏆' },
  { key: 'options', label: 'Options', icon: '📉' },
  { key: 'intraday', label: 'Intraday', icon: '⚡' },
  { key: 'expenses', label: 'Expenses', icon: '💳' },
  { key: 'calculator', label: 'Calculator', icon: '🧮' },
]

export function TabNav({
  active,
  onChange,
  onLogout,
  userEmail,
}: {
  active: TabKey
  onChange: (tab: TabKey) => void
  onLogout?: () => void
  userEmail?: string
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#475569] bg-gradient-to-r from-[#1e293b] to-[#0f172a] backdrop-blur-md shadow-lg">
      <div className="mx-auto flex max-w-full justify-between items-center px-6 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`group relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                active === tab.key
                  ? 'text-[#e0f2fe]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {active === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full" />
              )}
            </button>
          ))}
        </div>
        {userEmail && onLogout && (
          <div className="flex items-center gap-4 ml-4">
            <span className="text-sm text-[#94a3b8]">{userEmail}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-sm font-semibold text-[#cbd5e1] hover:text-[#f8fafc] border border-[#475569] hover:border-[#60a5fa] rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
