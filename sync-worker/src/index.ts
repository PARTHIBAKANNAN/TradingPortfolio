import type { Env } from '../../functions/lib/env.ts'
import { runAliceBlueSync } from '../../functions/lib/sync/syncOptions.ts'
import { runDhanSync } from '../../functions/lib/sync/syncIntraday.ts'

// Import all API handlers
import { onRequestGet as dashboardGet } from '../../functions/api/dashboard.ts'
import { onRequestGet as stocksGet, onRequestPost as stocksPost } from '../../functions/api/stocks/index.ts'
import { onRequestPut as stocksPut, onRequestDelete as stocksDelete } from '../../functions/api/stocks/[id].ts'
import { onRequestGet as stocksHoldingsGet } from '../../functions/api/stocks/holdings.ts'
import { onRequestGet as metalsGet, onRequestPost as metalsPost } from '../../functions/api/metals/index.ts'
import { onRequestPut as metalsPut, onRequestDelete as metalsDelete } from '../../functions/api/metals/[id].ts'
import { onRequestGet as metalsHoldingsGet } from '../../functions/api/metals/holdings.ts'
import { onRequestGet as optionsGet, onRequestPost as optionsPost } from '../../functions/api/options/index.ts'
import { onRequestPut as optionsPut, onRequestDelete as optionsDelete } from '../../functions/api/options/[id].ts'
import { onRequestGet as intradayGet, onRequestPost as intradayPost } from '../../functions/api/intraday/index.ts'
import { onRequestDelete as intradayDelete } from '../../functions/api/intraday/[id].ts'
import { onRequestGet as expensesGet, onRequestPost as expensesPost } from '../../functions/api/expenses/index.ts'
import { onRequestDelete as expensesDelete } from '../../functions/api/expenses/[id].ts'
import { onRequestGet as syncStatusGet } from '../../functions/api/sync/status.ts'
import { onRequestPost as syncAliceBluePost } from '../../functions/api/sync/aliceblue.ts'
import { onRequestPost as syncDhanPost } from '../../functions/api/sync/dhan.ts'
import { onRequestGet as pricesGet } from '../../functions/api/prices/index.ts'

// Helper to extract ID from path
function extractId(pathname: string): string | null {
  const parts = pathname.split('/')
  if (parts.length >= 4) {
    const id = parts[parts.length - 1]
    if (id && !isNaN(Number(id))) {
      return id
    }
  }
  return null
}

// Router helper
async function routeRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname
  const method = request.method

  try {
    // Dashboard endpoint
    if (pathname === '/api/dashboard' && method === 'GET') {
      return await dashboardGet({ request, env } as any)
    }

    // Stocks endpoints
    if (pathname === '/api/stocks/holdings' && method === 'GET') {
      return await stocksHoldingsGet({ request, env } as any)
    }
    if (pathname === '/api/stocks' && method === 'GET') {
      return await stocksGet({ request, env } as any)
    }
    if (pathname === '/api/stocks' && method === 'POST') {
      return await stocksPost({ request, env } as any)
    }
    if (pathname.startsWith('/api/stocks/') && extractId(pathname)) {
      const id = extractId(pathname)
      if (method === 'PUT') {
        return await stocksPut({ request, env, params: { id } } as any)
      }
      if (method === 'DELETE') {
        return await stocksDelete({ request, env, params: { id } } as any)
      }
    }

    // Metals endpoints
    if (pathname === '/api/metals/holdings' && method === 'GET') {
      return await metalsHoldingsGet({ request, env } as any)
    }
    if (pathname === '/api/metals' && method === 'GET') {
      return await metalsGet({ request, env } as any)
    }
    if (pathname === '/api/metals' && method === 'POST') {
      return await metalsPost({ request, env } as any)
    }
    if (pathname.startsWith('/api/metals/') && extractId(pathname)) {
      const id = extractId(pathname)
      if (method === 'PUT') {
        return await metalsPut({ request, env, params: { id } } as any)
      }
      if (method === 'DELETE') {
        return await metalsDelete({ request, env, params: { id } } as any)
      }
    }

    // Options endpoints
    if (pathname === '/api/options' && method === 'GET') {
      return await optionsGet({ request, env } as any)
    }
    if (pathname === '/api/options' && method === 'POST') {
      return await optionsPost({ request, env } as any)
    }
    if (pathname.startsWith('/api/options/') && extractId(pathname)) {
      const id = extractId(pathname)
      if (method === 'PUT') {
        return await optionsPut({ request, env, params: { id } } as any)
      }
      if (method === 'DELETE') {
        return await optionsDelete({ request, env, params: { id } } as any)
      }
    }

    // Intraday endpoints
    if (pathname === '/api/intraday' && method === 'GET') {
      return await intradayGet({ request, env } as any)
    }
    if (pathname === '/api/intraday' && method === 'POST') {
      return await intradayPost({ request, env } as any)
    }
    if (pathname.startsWith('/api/intraday/') && extractId(pathname)) {
      const id = extractId(pathname)
      if (method === 'DELETE') {
        return await intradayDelete({ request, env, params: { id } } as any)
      }
    }

    // Expenses endpoints
    if (pathname === '/api/expenses' && method === 'GET') {
      return await expensesGet({ request, env } as any)
    }
    if (pathname === '/api/expenses' && method === 'POST') {
      return await expensesPost({ request, env } as any)
    }
    if (pathname.startsWith('/api/expenses/') && extractId(pathname)) {
      const id = extractId(pathname)
      if (method === 'DELETE') {
        return await expensesDelete({ request, env, params: { id } } as any)
      }
    }

    // Sync endpoints
    if (pathname === '/api/sync/status' && method === 'GET') {
      return await syncStatusGet({ request, env } as any)
    }
    if (pathname === '/api/sync/aliceblue' && method === 'POST') {
      return await syncAliceBluePost({ request, env } as any)
    }
    if (pathname === '/api/sync/dhan' && method === 'POST') {
      return await syncDhanPost({ request, env } as any)
    }

    // Prices endpoint
    if (pathname === '/api/prices' && method === 'GET') {
      return await pricesGet({ request, env } as any)
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Router error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return routeRequest(request, env)
  },

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
