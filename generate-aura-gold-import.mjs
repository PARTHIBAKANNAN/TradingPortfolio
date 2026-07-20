import fs from 'fs'

// Exact replica of functions/lib/db.ts createMetalTransaction's effective price formula
function computeEffectivePrice(pricePerGram, quantityGrams, tax, spreadCharge, otherCharges) {
  const totalCharges = tax + spreadCharge + otherCharges
  return quantityGrams > 0 ? (pricePerGram * quantityGrams + totalCharges) / quantityGrams : pricePerGram
}

// Exact replica of shared/calc.ts applyBuy/applySell (weighted avg cost, ignores charges — matches
// functions/lib/holdings.ts recomputeMetalRealizedPnl which replays on raw price_per_gram)
function applyBuy(current, buyQty, buyPrice) {
  const totalQty = current.qty + buyQty
  const newAvg = totalQty === 0 ? 0 : (current.qty * current.avgPrice + buyQty * buyPrice) / totalQty
  return { qty: totalQty, avgPrice: newAvg }
}

function applySell(current, sellQty, sellPrice) {
  const realizedPnl = sellQty * (sellPrice - current.avgPrice)
  const remainingQty = current.qty - sellQty
  return { lot: { qty: remainingQty, avgPrice: remainingQty === 0 ? 0 : current.avgPrice }, realizedPnl }
}

// The 4 Aura Gold transactions (from import-aura-gold.js — never successfully persisted to any D1)
const transactions = [
  {
    metalType: 'GOLD',
    tradeType: 'BUY',
    quantityGrams: 2,
    pricePerGram: 13257.03,
    tax: 795.42,
    spreadCharge: 0,
    otherCharges: 0,
    tradeDate: '2025-10-21',
    notes: 'Aura Gold - Initial gold purchase',
  },
  {
    metalType: 'SILVER',
    tradeType: 'BUY',
    quantityGrams: 40.4008,
    pricePerGram: 240.31,
    tax: 291.26,
    spreadCharge: 0,
    otherCharges: 0,
    tradeDate: '2026-01-05',
    notes: 'Aura Gold - Silver purchase',
  },
  {
    metalType: 'SILVER',
    tradeType: 'BUY',
    quantityGrams: 53.4386,
    pricePerGram: 272.52,
    tax: 436.89,
    spreadCharge: 0,
    otherCharges: 0,
    tradeDate: '2026-01-12',
    notes: 'Aura Gold - Additional silver purchase',
  },
  {
    metalType: 'SILVER',
    tradeType: 'SELL',
    quantityGrams: 91.7054,
    pricePerGram: 316.23,
    tax: 0,
    spreadCharge: 0,
    otherCharges: 0,
    tradeDate: '2026-01-24',
    notes: 'Aura Gold - Silver sale',
  },
]

// Assign ids in insertion order (matches how the app's AUTOINCREMENT would number them)
const withIds = transactions.map((t, idx) => ({ ...t, id: idx + 1 }))

// Compute effective_price_per_gram per row (as createMetalTransaction does)
for (const t of withIds) {
  t.effectivePricePerGram = computeEffectivePrice(t.pricePerGram, t.quantityGrams, t.tax, t.spreadCharge, t.otherCharges)
}

// Compute realized_pnl per SELL row, grouped by metalType, sorted by date then id (as recomputeMetalRealizedPnl does)
const byMetal = new Map()
for (const t of withIds) {
  const list = byMetal.get(t.metalType) ?? []
  list.push(t)
  byMetal.set(t.metalType, list)
}

for (const [, txs] of byMetal) {
  const sorted = [...txs].sort((a, b) => a.tradeDate.localeCompare(b.tradeDate) || a.id - b.id)
  let lot = { qty: 0, avgPrice: 0 }
  for (const t of sorted) {
    if (t.tradeType === 'BUY') {
      lot = applyBuy(lot, t.quantityGrams, t.pricePerGram)
    } else {
      const result = applySell(lot, t.quantityGrams, t.pricePerGram)
      lot = result.lot
      t.realizedPnl = result.realizedPnl
    }
  }
}

console.log('Computed values:\n')
for (const t of withIds) {
  console.log(
    `  ${t.metalType} ${t.tradeType} ${t.quantityGrams}g @ ${t.pricePerGram} | effective=${t.effectivePricePerGram.toFixed(4)} | realizedPnl=${t.realizedPnl !== undefined ? t.realizedPnl.toFixed(4) : 'N/A (BUY)'}`,
  )
}

// Generate SQL
let sql = '-- Aura Gold metal transactions (computed effective_price_per_gram and realized_pnl match app logic)\n\n'
for (const t of withIds) {
  const notes = t.notes ? `'${t.notes.replace(/'/g, "''")}'` : 'NULL'
  const realizedPnl = t.realizedPnl !== undefined ? t.realizedPnl : 'NULL'
  sql += `INSERT INTO metal_transactions (metal_type, trade_type, quantity_grams, price_per_gram, tax, spread_charge, other_charges, effective_price_per_gram, trade_date, notes, source, realized_pnl) VALUES ('${t.metalType}', '${t.tradeType}', ${t.quantityGrams}, ${t.pricePerGram}, ${t.tax}, ${t.spreadCharge}, ${t.otherCharges}, ${t.effectivePricePerGram}, '${t.tradeDate}', ${notes}, 'csv_aura', ${realizedPnl});\n`
}

fs.writeFileSync('seed-aura-gold.sql', sql)
console.log('\nGenerated seed-aura-gold.sql with', withIds.length, 'transactions')
