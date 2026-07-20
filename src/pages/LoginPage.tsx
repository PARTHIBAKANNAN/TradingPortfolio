import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      // Auth state change will trigger re-render via AuthProvider
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1e293b] to-[#0a0e27] flex items-center justify-center p-4 relative z-0">
      <div className="card-premium w-full max-w-md relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f8fafc] mb-2">Trade Portfolio</h1>
          <p className="text-[#94a3b8]">{isSignUp ? 'Create account' : 'Sign in to dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#2a3f5f] bg-[#111d3c] px-4 py-2 text-[#f8fafc] placeholder-[#475569] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2a3f5f] bg-[#111d3c] px-4 py-2 text-[#f8fafc] placeholder-[#475569] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/30 p-3 text-sm text-[#f87171]">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-2 font-semibold text-white shadow-lg shadow-[#2563eb]/50 hover:shadow-lg hover:shadow-[#2563eb]/75 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2a3f5f]">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="w-full text-sm text-[#60a5fa] hover:text-[#93c5fd] transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
