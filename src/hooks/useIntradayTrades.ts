import { useCallback, useEffect, useState } from 'react'
import type { IntradayTrade } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useIntradayTrades() {
  const [trades, setTrades] = useState<IntradayTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTrades(await api.listIntraday())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load intraday trades')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { trades, loading, error, refresh }
}
