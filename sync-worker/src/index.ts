import type { Env } from '../../functions/lib/env.ts'
import { runAliceBlueSync } from '../../functions/lib/sync/syncOptions.ts'
import { runDhanSync } from '../../functions/lib/sync/syncIntraday.ts'

export default {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    // Each broker's sync is independently try/caught so one failing never
    // blocks the other — same orchestrators the "Sync now" button calls.
    try {
      await runAliceBlueSync(env)
    } catch {
      // runAliceBlueSync already records failures into sync_state itself;
      // this guards against a truly unexpected throw outside that handling.
    }
    try {
      await runDhanSync(env)
    } catch {
      // see above
    }
  },
} satisfies ExportedHandler<Env>
