import fs from 'fs'

// Exact replica of shared/calc.ts logic used by the app
function applyBuy(current, buyQty, buyPrice) {
  const totalQty = current.qty + buyQty
  const newAvg = totalQty === 0 ? 0 : (current.qty * current.avgPrice + buyQty * buyPrice) / totalQty
  return { qty: totalQty, avgPrice: newAvg }
}

function applySell(current, sellQty, sellPrice) {
  if (sellQty > current.qty + 1e-9) {
    throw new Error(`Sell quantity ${sellQty} exceeds held quantity ${current.qty}`)
  }
  const realizedPnl = sellQty * (sellPrice - current.avgPrice)
  const remainingQty = current.qty - sellQty
  return {
    lot: { qty: remainingQty, avgPrice: remainingQty === 0 ? 0 : current.avgPrice },
    realizedPnl,
  }
}

// Exact replica of functions/lib/holdings.ts replayWithPerSellPnl
function replayWithPerSellPnl(transactions) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
  let lot = { qty: 0, avgPrice: 0 }
  const sellPnlById = new Map()
  for (const t of sorted) {
    if (t.type === 'BUY') {
      lot = applyBuy(lot, t.qty, t.price)
    } else {
      const result = applySell(lot, t.qty, t.price)
      lot = result.lot
      sellPnlById.set(t.id, result.realizedPnl)
    }
  }
  return sellPnlById
}

console.log('Loading stocks_import_fixed.json (id = array index + 1, confirmed against prod)...\n')
const stocksData = JSON.parse(fs.readFileSync('./stocks_import_fixed.json', 'utf-8'))

// Attach id = index + 1 (matches confirmed production/local insert order)
const stockTxs = stocksData.map((s, idx) => ({
  id: idx + 1,
  type: s.tradeType,
  qty: s.quantity,
  price: s.price,
  date: s.tradeDate,
  symbol: s.symbol,
}))

// Group by symbol and replay per-symbol (same as recomputeStockRealizedPnl)
const bySymbol = new Map()
for (const t of stockTxs) {
  const list = bySymbol.get(t.symbol) ?? []
  list.push(t)
  bySymbol.set(t.symbol, list)
}

const stockUpdates = []
for (const [symbol, txs] of bySymbol) {
  const sellPnlById = replayWithPerSellPnl(txs)
  for (const [id, pnl] of sellPnlById) {
    stockUpdates.push({ id, realizedPnl: Math.round(pnl * 10000) / 10000 })
  }
}

console.log(`Computed realized_pnl for ${stockUpdates.length} stock SELL transactions:\n`)
stockUpdates.forEach((u) => console.log(`  id=${u.id}: realized_pnl=${u.realizedPnl}`))

console.log('\nLoading options_import_fixed.json (realizedPnl already computed from broker data)...\n')
const optionsData = JSON.parse(fs.readFileSync('./options_import_fixed.json', 'utf-8'))
const optionUpdates = optionsData.map((o, idx) => ({ id: idx + 1, realizedPnl: o.realizedPnl }))

console.log(`Prepared realized_pnl for ${optionUpdates.length} options rows.\n`)

// Generate SQL
let sql = '-- Fix realized_pnl for stock_transactions (SELL rows) and options_trades\n\n'
for (const u of stockUpdates) {
  sql += `UPDATE stock_transactions SET realized_pnl = ${u.realizedPnl} WHERE id = ${u.id};\n`
}
sql += '\n'
for (const u of optionUpdates) {
  const val = u.realizedPnl === null || u.realizedPnl === undefined ? 'NULL' : u.realizedPnl
  sql += `UPDATE options_trades SET realized_pnl = ${val} WHERE id = ${u.id};\n`
}

fs.writeFileSync('fix-realized-pnl.sql', sql)
console.log('✅ Generated fix-realized-pnl.sql')
console.log(`   - ${stockUpdates.length} stock_transactions UPDATE statements`)
console.log(`   - ${optionUpdates.length} options_trades UPDATE statements`)

// Also generate the full local DB seed (schema already applied via migrations, just need data)
let seedSql = '-- Full data import for LOCAL D1 (stocks + options with correct realized_pnl)\n\n'
for (const stock of stocksData) {
  const notes = stock.notes ? `'${stock.notes.replace(/'/g, "''")}'` : 'NULL'
  const companyName = stock.companyName ? `'${stock.companyName.replace(/'/g, "''")}'` : 'NULL'
  seedSql += `INSERT INTO stock_transactions (symbol, company_name, trade_type, quantity, price, trade_date, notes, source) VALUES ('${stock.symbol}', ${companyName}, '${stock.tradeType}', ${stock.quantity}, ${stock.price}, '${stock.tradeDate}', ${notes}, '${stock.source || 'csv_groww'}');\n`
}
seedSql += '\n'
for (const opt of optionsData) {
  const exitPrice = opt.exitPrice !== null && opt.exitPrice !== undefined ? opt.exitPrice : 'NULL'
  const exitDate = opt.exitDate ? `'${opt.exitDate}'` : 'NULL'
  const notes = opt.notes ? `'${opt.notes.replace(/'/g, "''")}'` : 'NULL'
  const realizedPnl = opt.realizedPnl !== null && opt.realizedPnl !== undefined ? opt.realizedPnl : 'NULL'
  seedSql += `INSERT INTO options_trades (underlying, strike_price, option_type, expiry_date, entry_price, exit_price, quantity, entry_date, exit_date, status, source, notes, realized_pnl) VALUES ('${opt.underlying}', ${opt.strikePrice}, '${opt.optionType}', '${opt.expiryDate}', ${opt.entryPrice}, ${exitPrice}, ${opt.quantity}, '${opt.entryDate}', ${exitDate}, '${opt.status || 'OPEN'}', '${opt.source || 'manual'}', ${notes}, ${realizedPnl});\n`
}

fs.writeFileSync('seed-local-db.sql', seedSql)
console.log('\n✅ Generated seed-local-db.sql (for local D1, includes correct realized_pnl from the start)')
