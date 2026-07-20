import { useCallback, useEffect, useState } from 'react'
import type { MetalTransaction } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useMetalTransactions() {
  const [transactions, setTransactions] = useState<MetalTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTransactions(await api.listMetals())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load metal transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { transactions, loading, error, refresh }
}
