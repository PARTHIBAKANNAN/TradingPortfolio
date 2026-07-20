import { useCallback, useEffect, useState } from 'react'
import type { SyncStatus, BrokerName } from '@shared/types.ts'
import * as api from '../lib/apiClient.ts'

export function useSyncStatus() {
  const [statuses, setStatuses] = useState<SyncStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingBroker, setSyncingBroker] = useState<BrokerName | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setStatuses(await api.getSyncStatus())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const triggerSync = useCallback(
    async (broker: BrokerName) => {
      setSyncingBroker(broker)
      try {
        await api.triggerBrokerSync(broker)
      } finally {
        setSyncingBroker(null)
        await refresh()
      }
    },
    [refresh],
  )

  return { statuses, loading, syncingBroker, triggerSync, refresh }
}
