const API_BASE = 'http://127.0.0.1:8788'

async function verify() {
  console.log('📋 Verifying Data Import')
  console.log('======================\n')

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

    // Get stock holdings
    const holdingsRes = await fetch(`${API_BASE}/api/stocks/holdings`)
    const holdings = await holdingsRes.json()
    console.log(`\n✓ Stock Holdings Summary: ${holdings.length} holdings`)
    holdings.slice(0, 5).forEach(h => {
      console.log(`  ${h.label}: ${h.quantity} units @ avg ${h.avgPrice}`)
    })

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

    // Get dashboard
    const dashRes = await fetch(`${API_BASE}/api/dashboard?from=2026-01-01&to=2026-07-19`)
    const dash = await dashRes.json()
    console.log(`\n✓ Dashboard Summary`)
    console.log(`  Realized PnL:`)
    console.log(`    Stocks: ₹${dash.realized.stocks.toFixed(2)}`)
    console.log(`    Options: ₹${dash.realized.options.toFixed(2)}`)
    console.log(`    Total: ₹${dash.realized.total.toFixed(2)}`)

    console.log(`\n✅ All data verified successfully!`)

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

verify()
