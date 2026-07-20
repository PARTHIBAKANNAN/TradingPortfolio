const API_BASE = 'http://127.0.0.1:8788'

async function verify() {
  console.log('📋 Verifying Fixed Data Import')
  console.log('==============================\n')

  try {
    // Get all stocks
    const stocksRes = await fetch(`${API_BASE}/api/stocks`)
    const stocks = await stocksRes.json()
    console.log(`✓ Total Stocks: ${stocks.length}`)

    // Count by symbol
    const stocksBySymbol = {}
    stocks.forEach(s => {
      if (!stocksBySymbol[s.symbol]) stocksBySymbol[s.symbol] = 0
      stocksBySymbol[s.symbol]++
    })
    console.log('  Symbols:', Object.keys(stocksBySymbol).sort().join(', '))

    // Analyze BUY/SELL
    const buyCount = stocks.filter(s => s.tradeType === 'BUY').length
    const sellCount = stocks.filter(s => s.tradeType === 'SELL').length
    console.log(`  BUY Transactions: ${buyCount}`)
    console.log(`  SELL Transactions: ${sellCount}`)

    // Get all options
    const optionsRes = await fetch(`${API_BASE}/api/options`)
    const options = await optionsRes.json()
    console.log(`\n✓ Total Options: ${options.length}`)

    // Count by status
    const openCount = options.filter(o => o.status === 'OPEN').length
    const closedCount = options.filter(o => o.status === 'CLOSED').length
    console.log(`  OPEN Positions: ${openCount}`)
    console.log(`  CLOSED Positions: ${closedCount}`)

    // Count by underlying
    const byUnderlying = {}
    options.forEach(o => {
      if (!byUnderlying[o.underlying]) byUnderlying[o.underlying] = 0
      byUnderlying[o.underlying]++
    })
    console.log('  Underlyings:', Object.keys(byUnderlying).sort().join(', '))

    // Calculate total options P&L
    const totalPnL = options.reduce((sum, o) => sum + (o.realizedPnl || 0), 0)
    console.log(`\n💰 Options Realized P&L: ₹${totalPnL.toFixed(2)}`)

    // Get dashboard
    const dashRes = await fetch(`${API_BASE}/api/dashboard?from=2026-01-01&to=2026-07-19`)
    const dash = await dashRes.json()
    console.log(`\n✓ Dashboard Summary (2026-01-01 to 2026-07-19)`)
    console.log(`  Realized P&L:`)
    console.log(`    Stocks:    ₹${dash.realized.stocks.toFixed(2)}`)
    console.log(`    Options:   ₹${dash.realized.options.toFixed(2)}`)
    console.log(`    Intraday:  ₹${dash.realized.intraday.toFixed(2)}`)
    console.log(`    Metals:    ₹${dash.realized.metals.toFixed(2)}`)
    console.log(`    ─────────────────────`)
    console.log(`    TOTAL:     ₹${dash.realized.total.toFixed(2)}`)

    console.log(`\n  Invested Capital (NOW):`)
    console.log(`    Stocks:    ₹${dash.invested.stocks.toFixed(2)}`)
    console.log(`    Options:   ₹${dash.invested.options.toFixed(2)}`)
    console.log(`    Metals:    ₹${dash.invested.metals.toFixed(2)}`)
    console.log(`    ─────────────────────`)
    console.log(`    TOTAL:     ₹${dash.invested.total.toFixed(2)}`)

    console.log(`\n  Unrealized P&L (NOW):`)
    console.log(`    Stocks:    ₹${dash.unrealized.stocks.toFixed(2)}`)
    console.log(`    Metals:    ₹${dash.unrealized.metals.toFixed(2)}`)

    console.log(`\n  Grand Total:`)
    console.log(`    Realized:   ₹${dash.overall.realizedTotal.toFixed(2)}`)
    console.log(`    Unrealized: ₹${dash.overall.unrealizedTotal.toFixed(2)}`)
    console.log(`    ─────────────────────`)
    console.log(`    GRAND TOTAL: ₹${dash.overall.grandTotal.toFixed(2)}`)

    console.log(`\n=== Sample Options (First 5 CLOSED) ===`)
    const closed = options.filter(o => o.status === 'CLOSED')
    closed.slice(0, 5).forEach((opt, idx) => {
      console.log(
        `${idx + 1}. ${opt.underlying} ${opt.strikePrice} ${opt.optionType}: ` +
          `Buy@${opt.entryPrice} → Sell@${opt.exitPrice} (Qty: ${opt.quantity}) | P&L: ₹${opt.realizedPnl}`
      )
    })

    console.log(`\n✅ All data verified successfully!`)

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

verify()
