import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setExpenses(await api.listExpenses())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { expenses, loading, error, refresh }
}
