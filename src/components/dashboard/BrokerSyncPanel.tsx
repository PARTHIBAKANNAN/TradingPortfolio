import { useSyncStatus } from '../../hooks/useSyncStatus.ts'
import { SecondaryButton } from '../shared/FormControls.tsx'
import type { BrokerName, SyncStatusValue } from '@shared/types.ts'

const BROKER_LABELS: Record<BrokerName, string> = {
  aliceblue: 'Alice Blue (Options)',
  dhan: 'Dhan (Intraday)',
}

function statusPillClass(status: SyncStatusValue): string {
  switch (status) {
    case 'success':
      return 'bg-[#10b981]/20 text-[#6ee7b7] border border-[#10b981]/30'
    case 'error':
      return 'bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30'
    case 'running':
      return 'bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30'
    default:
      return 'bg-[#475569]/20 text-[#cbd5e1] border border-[#475569]/30'
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const diffMs = Date.now() - new Date(iso.replace(' ', 'T') + 'Z').getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function BrokerSyncPanel() {
  const { statuses, syncingBroker, triggerSync } = useSyncStatus()
  const brokers: BrokerName[] = ['aliceblue', 'dhan']

  return (
    <div className="card-premium">
      <h2 className="mb-4 text-lg font-bold text-[#f8fafc]">Broker Sync</h2>
      <div className="space-y-3">
        {brokers.map((broker) => {
          const state = statuses.find((s) => s.broker === broker)
          const status = state?.status ?? 'idle'
          const notConfigured = status === 'idle' && !state?.lastSyncedAt
          return (
            <div key={broker} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#111d3c] p-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#f8fafc]">{BROKER_LABELS[broker]}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(status)}`}>
                  {status}
                </span>
                <span
                  className="text-xs text-[#94a3b8]"
                  title={state?.lastError ?? undefined}
                >
                  {notConfigured ? 'not configured yet' : `last synced ${relativeTime(state?.lastSyncedAt ?? null)}`}
                  {state?.lastError ? ` — ${state.lastError}` : ''}
                </span>
              </div>
              <SecondaryButton
                type="button"
                className="px-2 py-1 text-xs"
                disabled={syncingBroker === broker}
                onClick={() => triggerSync(broker)}
              >
                {syncingBroker === broker ? 'Syncing…' : 'Sync now'}
              </SecondaryButton>
            </div>
          )
        })}
      </div>
    </div>
  )
}
