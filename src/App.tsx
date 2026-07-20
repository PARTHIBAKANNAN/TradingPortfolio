import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { TabNav, type TabKey } from './components/layout/TabNav.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { StocksPage } from './pages/StocksPage.tsx'
import { MetalsPage } from './pages/MetalsPage.tsx'
import { OptionsPage } from './pages/OptionsPage.tsx'
import { IntradayPage } from './pages/IntradayPage.tsx'
import { ExpensesPage } from './pages/ExpensesPage.tsx'
import { CalculatorPage } from './pages/CalculatorPage.tsx'

function initialTab(): TabKey {
  const hash = window.location.hash.replace('#', '')
  const valid: TabKey[] = ['dashboard', 'stocks', 'metals', 'options', 'intraday', 'expenses', 'calculator']
  return (valid as string[]).includes(hash) ? (hash as TabKey) : 'dashboard'
}

function AppContent() {
  const [tab, setTab] = useState<TabKey>(initialTab())
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1e293b] to-[#0a0e27] flex items-center justify-center">
        <div className="text-[#cbd5e1]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  const handleChange = (next: TabKey) => {
    setTab(next)
    window.location.hash = next
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <TabNav active={tab} onChange={handleChange} onLogout={handleLogout} userEmail={user.email} />
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'stocks' && <StocksPage />}
      {tab === 'metals' && <MetalsPage />}
      {tab === 'options' && <OptionsPage />}
      {tab === 'intraday' && <IntradayPage />}
      {tab === 'expenses' && <ExpensesPage />}
      {tab === 'calculator' && <CalculatorPage />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
