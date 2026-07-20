import { useCallback, useEffect, useState } from 'react'
import type { DashboardResponse } from '@shared/types.ts'
import { getPresetRange } from '@shared/dateUtils.ts'
import * as api from '../lib/apiClient.ts'

export function useDashboard() {
  const defaultRange = getPresetRange('thisMonth')
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await api.getDashboard(from, to))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, from, to, setFrom, setTo, refresh }
}
