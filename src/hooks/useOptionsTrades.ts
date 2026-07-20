import { useCallback, useEffect, useState } from 'react'
import type { OptionTrade } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useOptionsTrades() {
  const [trades, setTrades] = useState<OptionTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTrades(await api.listOptions())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load options trades')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { trades, loading, error, refresh }
}
