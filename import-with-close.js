import fs from 'fs'

const API_BASE = 'http://127.0.0.1:8788'

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

async function importOptions() {
  console.log('\n📈 Importing options (with close updates)...')

  const data = JSON.parse(fs.readFileSync('options_import_fixed.json', 'utf8'))
  console.log(`  Total options to import: ${data.length}`)

  let imported = 0
  let closed = 0
  let failed = 0

  for (let i = 0; i < data.length; i++) {
    const option = data[i]

    try {
      // Step 1: Create the option with entry data
      const createPayload = {
        underlying: option.underlying,
        strikePrice: option.strikePrice,
        optionType: option.optionType,
        expiryDate: option.expiryDate,
        entryPrice: option.entryPrice || 0,
        quantity: option.quantity,
        entryDate: option.entryDate,
        notes: option.notes || null,
      }

      const created = await makeRequest('POST', '/api/options', createPayload)
      imported++

      // Step 2: If option has exit price and exit date, close it
      if (option.exitPrice && option.exitDate && option.status === 'CLOSED') {
        const closePayload = {
          exitPrice: option.exitPrice,
          exitDate: option.exitDate,
        }

        const updated = await makeRequest('PUT', `/api/options/${created.id}`, closePayload)
        closed++
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ ${imported} created, ${closed} closed...`)
      }
    } catch (err) {
      console.log(`  ✗ Failed: ${option.underlying} ${option.strikePrice} ${option.optionType} - ${err.message}`)
      failed++
    }

    if ((i + 1) % 5 === 0) {
      await delay(50)
    }
  }

  console.log(`✅ Options import complete: ${imported} created, ${closed} closed, ${failed} failed`)
  return { imported, closed, failed }
}

async function importStocks() {
  console.log('\n📊 Importing stocks...')

  const data = JSON.parse(fs.readFileSync('stocks_import_fixed.json', 'utf8'))
  console.log(`  Total stocks to import: ${data.length}`)

  let imported = 0
  let failed = 0

  for (let i = 0; i < data.length; i++) {
    const stock = data[i]

    try {
      const result = await makeRequest('POST', '/api/stocks', stock)
      imported++
      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ ${imported} imported...`)
      }
    } catch (err) {
      console.log(`  ✗ Failed: ${stock.symbol} - ${err.message}`)
      failed++
    }

    if ((i + 1) % 10 === 0) {
      await delay(50)
    }
  }

  console.log(`✅ Stocks import complete: ${imported} imported, ${failed} failed`)
  return { imported, failed }
}

async function main() {
  console.log('🚀 Trade Portfolio Data Import Tool (WITH CLOSE)')
  console.log('================================================')
  console.log(`API Base: ${API_BASE}`)

  try {
    // Check if API is available
    console.log('\n⏳ Checking API connection...')
    const health = await makeRequest('GET', '/api/stocks')
    console.log('✓ API is online')

    // Import data
    const stockResult = await importStocks()
    const optionResult = await importOptions()

    console.log('\n🎉 Import complete!')
    console.log('\nSummary:')
    console.log(`  Stocks: ${stockResult.imported} imported, ${stockResult.failed} failed`)
    console.log(
      `  Options: ${optionResult.imported} created, ${optionResult.closed} closed, ${optionResult.failed} failed`,
    )
  } catch (err) {
    console.error('\n❌ Import failed:', err.message)
    process.exit(1)
  }
}

main()
