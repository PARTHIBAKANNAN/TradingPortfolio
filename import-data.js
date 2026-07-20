import XLSX from 'xlsx'
import fs from 'fs'

// Read both Excel files
const pnlFile = 'C:\\Users\\2368647\\Downloads\\pnl_report_futures_&_options_combined_1mar2026_to_19jul2026.xlsx'
const stockFile = 'C:\\Users\\2368647\\Downloads\\Stocks_Order_History_8794068054_2026-01-01_2026-07-18.xlsx'

console.log('=== P&L Report (Options/Futures) ===')
const pnlWb = XLSX.readFile(pnlFile)
pnlWb.SheetNames.forEach(sheetName => {
  console.log(`\nSheet: ${sheetName}`)
  const ws = pnlWb.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(ws)
  console.log('Column names:', data.length > 0 ? Object.keys(data[0]) : 'No data')
  console.log('First 3 rows:')
  data.slice(0, 3).forEach((row, idx) => {
    console.log(`  Row ${idx + 1}:`, JSON.stringify(row, null, 2))
  })
  console.log(`Total rows: ${data.length}`)

  // Save to JSON for processing
  fs.writeFileSync(`pnl_data_${sheetName}.json`, JSON.stringify(data, null, 2))
})

console.log('\n\n=== Stock Order History ===')
const stockWb = XLSX.readFile(stockFile)
stockWb.SheetNames.forEach(sheetName => {
  console.log(`\nSheet: ${sheetName}`)
  const ws = stockWb.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(ws)
  console.log('Column names:', data.length > 0 ? Object.keys(data[0]) : 'No data')
  console.log('First 3 rows:')
  data.slice(0, 3).forEach((row, idx) => {
    console.log(`  Row ${idx + 1}:`, JSON.stringify(row, null, 2))
  })
  console.log(`Total rows: ${data.length}`)

  // Save to JSON for processing
  fs.writeFileSync(`stock_data_${sheetName}.json`, JSON.stringify(data, null, 2))
})
