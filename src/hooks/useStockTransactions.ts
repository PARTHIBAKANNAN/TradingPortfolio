import { useCallback, useEffect, useState } from 'react'
import type { StockTransaction } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useStockTransactions() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTransactions(await api.listStocks())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stock transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { transactions, loading, error, refresh }
}
