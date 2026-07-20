const API_BASE = 'http://127.0.0.1:8788'

async function makeRequest(method, path, data = null) {
  const url = `${API_BASE}${path}`
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)
    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      throw new Error(`${response.status}: ${result?.error || response.statusText}`)
    }

    return result
  } catch (err) {
    throw new Error(`${method} ${path}: ${err.message}`)
  }
}

async function importAuraGoldData() {
  console.log('🏆 Importing Aura Gold Data')
  console.log('=============================\n')

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

  let imported = 0
  let failed = 0

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i]

    try {
      const result = await makeRequest('POST', '/api/metals', tx)
      const charges = tx.tax + tx.spreadCharge + tx.otherCharges
      console.log(
        `✓ ${tx.tradeDate} - ${tx.metalType} ${tx.tradeType} ${tx.quantityGrams}g @ ₹${tx.pricePerGram}/g (Charges: ₹${charges.toFixed(2)})`
      )
      imported++
    } catch (err) {
      console.log(`✗ Failed: ${tx.tradeDate} - ${tx.metalType} - ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Import complete: ${imported} transactions added, ${failed} failed`)

  // Show summary
  console.log('\n📊 PORTFOLIO SUMMARY')
  console.log('====================')
  console.log('Current Holdings:')
  console.log('  • Gold: 2g @ ₹14,514.56/g = ₹29,029.12')
  console.log('  • Silver: 2.1340g @ ₹228.53/g = ₹487.61')
  console.log('\nInvestment Breakdown:')
  console.log('  Gold purchased: 2g @ ₹13,257.03/g + ₹795.42 tax = ₹27,309.48')
  console.log('  Silver purchased: 93.8394g for ₹25,000.00')
  console.log('  Silver sold: 91.7054g @ ₹316.23/g = ₹29,000.00')
  console.log('\nRemaining Investment:')
  console.log('  Gold: ₹27,309.48 (no sales)')
  console.log('  Silver: ₹25,000.00 - ₹29,000.00 = -₹4,000.00 (profit!)')
}

importAuraGoldData()
