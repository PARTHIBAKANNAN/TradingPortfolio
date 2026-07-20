import { useCallback, useEffect, useState } from 'react'
import type { HoldingSummary } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useHoldings(category: 'stocks' | 'metals') {
  const [holdings, setHoldings] = useState<HoldingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setHoldings(category === 'stocks' ? await api.getStockHoldings() : await api.getMetalHoldings())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load holdings')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { holdings, loading, error, refresh }
}
