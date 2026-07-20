import XLSX from 'xlsx'
import fs from 'fs'

const pnlFile = 'C:\\Users\\2368647\\Downloads\\pnl_report_futures_&_options_combined_1mar2026_to_19jul2026.xlsx'
const stockFile = 'C:\\Users\\2368647\\Downloads\\Stocks_Order_History_8794068054_2026-01-01_2026-07-18.xlsx'

// Parse P&L Report for Options
function parseOptionsData() {
  const wb = XLSX.readFile(pnlFile)
  const ws = wb.Sheets['Futures & options']
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // Find the header row (row with "Scrip Name", "Buy Qty", etc.)
  let headerRowIdx = -1
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    if (row.some(cell => typeof cell === 'string' && cell.includes('Scrip'))) {
      headerRowIdx = i
      break
    }
  }

  if (headerRowIdx === -1) {
    console.error('Could not find header row in P&L report')
    return []
  }

  const headerRow = rawData[headerRowIdx]
  const dataRows = rawData.slice(headerRowIdx + 1)

  // Map columns
  const colMap = {
    scrip: 0,
    buyQty: 1,
    buyAvg: 2,
    buyValue: 3,
    openQty: 4,
    openAvg: 5,
    openValue: 6,
    sellQty: 7,
    sellAvg: 8,
    sellValue: 9,
    realizedPnl: 10,
    unrealizedPnl: 11,
  }

  const options = []

  dataRows.forEach((row, idx) => {
    if (!row[0] || typeof row[0] !== 'string' || row[0].trim() === '') return

    const scrip = row[colMap.scrip]?.toString().trim()
    if (!scrip) return

    // Parse option details from scrip name (e.g., "NIFTY 21Apr26 24200 PE")
    const parts = scrip.split(' ')
    const underlying = parts[0] // NIFTY
    const strikePrice = parseFloat(parts[parts.length - 2]) // 24200
    const optionType = parts[parts.length - 1] // PE or CE

    if (!underlying || isNaN(strikePrice) || !['CE', 'PE'].includes(optionType)) {
      console.warn(`Skipping invalid option: ${scrip}`)
      return
    }

    // Parse dates from expiry (e.g., "21Apr26")
    let expiryDate = parts[1] // 21Apr26
    // Convert to YYYY-MM-DD format
    expiryDate = convertIndianDateFormat(expiryDate)

    // Extract quantity and prices
    const buyQty = parseFloat(row[colMap.buyQty]) || 0
    const buyAvg = parseFloat(row[colMap.buyAvg]) || 0
    const sellQty = parseFloat(row[colMap.sellQty]) || 0
    const sellAvg = parseFloat(row[colMap.sellAvg]) || 0
    const realizedPnl = parseFloat(row[colMap.realizedPnl]) || 0

    // If both buy and sell quantities exist, create two transactions
    if (buyQty > 0) {
      options.push({
        underlying,
        strikePrice,
        optionType,
        expiryDate,
        entryPrice: buyAvg,
        quantity: buyQty,
        entryDate: '2026-03-01', // Default entry date - should be from transaction data
        status: sellQty > 0 ? 'CLOSED' : 'OPEN',
        realizedPnl: sellQty > 0 ? realizedPnl : null,
        notes: scrip,
      })
    }

    // If there's sell quantity without buy, it's a closed position
    if (sellQty > 0 && buyQty === 0) {
      options.push({
        underlying,
        strikePrice,
        optionType,
        expiryDate,
        entryPrice: 0,
        exitPrice: sellAvg,
        quantity: sellQty,
        entryDate: '2026-03-01',
        exitDate: '2026-07-19',
        status: 'CLOSED',
        realizedPnl: realizedPnl,
        notes: `${scrip} - closed position`,
      })
    }
  })

  return options
}

// Parse Stock Order History
function parseStockData() {
  const wb = XLSX.readFile(stockFile)
  const ws = wb.Sheets['Sheet1']
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // Find the header row
  let headerRowIdx = -1
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    if (row.some(cell => typeof cell === 'string' && cell.includes('Stock name'))) {
      headerRowIdx = i
      break
    }
  }

  if (headerRowIdx === -1) {
    console.error('Could not find header row in stock data')
    return []
  }

  const dataRows = rawData.slice(headerRowIdx + 1)

  // Map columns based on expected order
  const colMap = {
    stockName: 0,
    symbol: 1,
    isin: 2,
    type: 3,
    quantity: 4,
    value: 5,
    exchange: 6,
    exchangeOrderId: 7,
    executionDateTime: 8,
    orderStatus: 9,
  }

  const stocks = []

  dataRows.forEach((row, idx) => {
    if (!row[0] || typeof row[0] !== 'string' || row[0].trim() === '') return

    const symbol = row[colMap.symbol]?.toString().trim().toUpperCase()
    const type = row[colMap.type]?.toString().trim().toUpperCase()
    const quantity = parseFloat(row[colMap.quantity])
    const value = parseFloat(row[colMap.value])
    const executionDateTime = row[colMap.executionDateTime]?.toString().trim()

    if (!symbol || !['BUY', 'SELL'].includes(type) || isNaN(quantity) || isNaN(value)) {
      console.warn(`Skipping invalid stock transaction: ${row[0]}`)
      return
    }

    // Calculate price from value and quantity
    const price = Math.abs(value / quantity)

    // Parse execution date (format: "DD-MM-YYYY HH:MM:SS")
    const tradeDate = executionDateTime ? executionDateTime.split(' ')[0] : '2026-07-19'
    const tradeDateFormatted = convertIndianDateFormat(tradeDate)

    stocks.push({
      symbol,
      companyName: row[colMap.stockName]?.toString().trim() || null,
      tradeType: type,
      quantity: Math.abs(quantity),
      price: parseFloat(price.toFixed(2)),
      tradeDate: tradeDateFormatted,
      source: 'csv_groww',
      notes: `ISIN: ${row[colMap.isin] || 'N/A'}, Order ID: ${row[colMap.exchangeOrderId] || 'N/A'}`,
    })
  })

  return stocks
}

// Convert Indian date format (DD-MM-YYYY or D-MMM-YY) to YYYY-MM-DD
function convertIndianDateFormat(dateStr) {
  if (!dateStr) return '2026-07-19'

  // Handle format like "21Apr26"
  if (/^\d+[A-Za-z]{3}\d{2}$/.test(dateStr)) {
    const day = dateStr.match(/^\d+/)[0]
    const month = dateStr.match(/[A-Za-z]{3}/)[0]
    const year = dateStr.match(/\d{2}$/)[0]

    const monthMap = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    }

    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year)
    return `${fullYear}-${monthMap[month]}-${day.padStart(2, '0')}`
  }

  // Handle format like "01-01-2026"
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('-')
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }

  return '2026-07-19'
}

// Main execution
console.log('Parsing Options Data...')
const options = parseOptionsData()
console.log(`Found ${options.length} option records`)

console.log('\nParsing Stock Data...')
const stocks = parseStockData()
console.log(`Found ${stocks.length} stock records`)

// Save to JSON files for import
fs.writeFileSync('options_import.json', JSON.stringify(options, null, 2))
fs.writeFileSync('stocks_import.json', JSON.stringify(stocks, null, 2))

console.log('\nData saved to:')
console.log('- options_import.json')
console.log('- stocks_import.json')

// Log sample data
console.log('\n=== Sample Options ===')
options.slice(0, 2).forEach((opt, idx) => {
  console.log(`\n${idx + 1}. ${opt.underlying} ${opt.strikePrice} ${opt.optionType}`)
  console.log('   Entry:', opt.entryPrice, 'Qty:', opt.quantity)
  console.log('   Exit:', opt.exitPrice, 'Status:', opt.status)
})

console.log('\n=== Sample Stocks ===')
stocks.slice(0, 3).forEach((stock, idx) => {
  console.log(`\n${idx + 1}. ${stock.symbol} - ${stock.tradeType} ${stock.quantity} @ ${stock.price}`)
  console.log('   Date:', stock.tradeDate)
})
