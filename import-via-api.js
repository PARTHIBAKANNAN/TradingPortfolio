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
    console.error(`❌ ${method} ${path}: ${err.message}`)
    throw err
  }
}

async function clearAllData() {
  console.log('\n🗑️  Clearing existing data...')

  // Get all stocks
  console.log('  Fetching existing stocks...')
  const stocks = await makeRequest('GET', '/api/stocks')
  console.log(`  Found ${stocks.length} stocks to delete`)

  // Delete each stock
  for (const stock of stocks) {
    await makeRequest('DELETE', `/api/stocks/${stock.id}`)
    console.log(`    ✓ Deleted stock ID ${stock.id}`)
  }

  // Get all options
  console.log('  Fetching existing options...')
  const options = await makeRequest('GET', '/api/options')
  console.log(`  Found ${options.length} options to delete`)

  // Delete each option
  for (const option of options) {
    await makeRequest('DELETE', `/api/options/${option.id}`)
    console.log(`    ✓ Deleted option ID ${option.id}`)
  }

  console.log('✅ All data cleared')
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
      console.log(`  ✓ Imported: ${stock.symbol} - ${stock.tradeType} ${stock.quantity}`)
      imported++
    } catch (err) {
      console.log(`  ✗ Failed: ${stock.symbol} - ${err.message}`)
      failed++
    }

    // Add a small delay to avoid overwhelming the server
    if ((i + 1) % 10 === 0) {
      await delay(100)
    }
  }

  console.log(`✅ Stocks import complete: ${imported} imported, ${failed} failed`)
}

async function importOptions() {
  console.log('\n📈 Importing options...')

  const data = JSON.parse(fs.readFileSync('options_import_fixed.json', 'utf8'))
  console.log(`  Total options to import: ${data.length}`)

  let imported = 0
  let failed = 0

  for (let i = 0; i < data.length; i++) {
    const option = data[i]

    try {
      // Ensure required fields have proper defaults
      const payload = {
        underlying: option.underlying,
        strikePrice: option.strikePrice,
        optionType: option.optionType,
        expiryDate: option.expiryDate,
        entryPrice: option.entryPrice || 0,
        quantity: option.quantity,
        entryDate: option.entryDate,
        exitPrice: option.exitPrice || null,
        exitDate: option.exitDate || null,
        status: option.status || 'OPEN',
        realizedPnl: option.realizedPnl || null,
        notes: option.notes || null,
      }

      const result = await makeRequest('POST', '/api/options', payload)
      console.log(`  ✓ Imported: ${option.underlying} ${option.strikePrice} ${option.optionType}`)
      imported++
    } catch (err) {
      console.log(`  ✗ Failed: ${option.underlying} ${option.strikePrice} ${option.optionType} - ${err.message}`)
      failed++
    }

    // Add a small delay
    if ((i + 1) % 5 === 0) {
      await delay(100)
    }
  }

  console.log(`✅ Options import complete: ${imported} imported, ${failed} failed`)
}

async function main() {
  console.log('🚀 Trade Portfolio Data Import Tool')
  console.log('====================================')
  console.log(`API Base: ${API_BASE}`)

  try {
    // Check if API is available
    console.log('\n⏳ Checking API connection...')
    const health = await makeRequest('GET', '/api/stocks')
    console.log('✓ API is online')

    // Clear existing data
    await clearAllData()

    // Import new data
    await importStocks()
    await importOptions()

    console.log('\n🎉 Import complete!')
    console.log('\nSummary:')
    const stocks = JSON.parse(fs.readFileSync('stocks_import.json', 'utf8'))
    const options = JSON.parse(fs.readFileSync('options_import.json', 'utf8'))
    console.log(`  - ${stocks.length} stocks`)
    console.log(`  - ${options.length} options`)
  } catch (err) {
    console.error('\n❌ Import failed:', err.message)
    process.exit(1)
  }
}

main()
