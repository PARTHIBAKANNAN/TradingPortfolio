import fs from 'fs';

// Read JSON files
const stocksData = JSON.parse(fs.readFileSync('./stocks_import_fixed.json', 'utf-8'));
const optionsData = JSON.parse(fs.readFileSync('./options_import_fixed.json', 'utf-8'));

// Try to read additional data files if they exist
let metalsData = [];
let intradayData = [];
let expensesData = [];

try {
  const metalFile = fs.readFileSync('./pnl_data_Charges & Taxes.json', 'utf-8');
  metalsData = JSON.parse(metalFile);
} catch (e) {
  console.log('No metals data file found');
}

try {
  const expenseFile = fs.readFileSync('./pnl_data_Other Debit & Credit.json', 'utf-8');
  expensesData = JSON.parse(expenseFile);
} catch (e) {
  console.log('No expenses data file found');
}

// Generate INSERT statements for stocks
const stockInserts = stocksData.map(stock => {
  const cols = ['symbol', 'company_name', 'trade_type', 'quantity', 'price', 'trade_date', 'notes', 'source'];
  const values = [
    `'${stock.symbol.replace(/'/g, "''")}'`,
    stock.companyName ? `'${stock.companyName.replace(/'/g, "''")}'` : 'NULL',
    `'${stock.tradeType}'`,
    stock.quantity,
    stock.price,
    `'${stock.tradeDate}'`,
    stock.notes ? `'${stock.notes.replace(/'/g, "''")}'` : 'NULL',
    `'${stock.source || 'manual'}'`
  ];
  return `INSERT INTO stock_transactions (${cols.join(', ')}) VALUES (${values.join(', ')});`;
});

// Generate INSERT statements for options
const optionInserts = optionsData.map(opt => {
  const cols = ['underlying', 'strike_price', 'option_type', 'expiry_date', 'entry_price', 'exit_price', 'quantity', 'entry_date', 'exit_date', 'status', 'source', 'external_id', 'notes'];
  const values = [
    `'${opt.underlying.replace(/'/g, "''")}'`,
    opt.strikePrice || opt.strike_price,
    `'${opt.optionType || opt.option_type}'`,
    `'${opt.expiryDate || opt.expiry_date}'`,
    opt.entryPrice !== undefined ? opt.entryPrice : opt.entry_price,
    opt.exitPrice !== undefined ? opt.exitPrice : opt.exit_price,
    opt.quantity,
    `'${opt.entryDate || opt.entry_date}'`,
    opt.exitDate ? `'${opt.exitDate || opt.exit_date}'` : 'NULL',
    `'${opt.status || 'OPEN'}'`,
    `'${opt.source || 'manual'}'`,
    opt.externalId || opt.external_id ? `'${(opt.externalId || opt.external_id).toString().replace(/'/g, "''")}'` : 'NULL',
    opt.notes ? `'${opt.notes.replace(/'/g, "''")}'` : 'NULL'
  ];
  return `INSERT INTO options_trades (${cols.join(', ')}) VALUES (${values.join(', ')});`;
});

// Combine all SQL
const allSql = [
  '-- Imported trading data',
  ...stockInserts,
  ...optionInserts
].join('\n');

fs.writeFileSync('import_trading_data.sql', allSql);
console.log(`✅ Generated import SQL:`);
console.log(`   - ${stockInserts.length} stock transactions`);
console.log(`   - ${optionInserts.length} option trades`);
console.log(`   - Saved to: import_trading_data.sql`);
console.log(`\n📋 Next steps:`);
console.log(`1. Go to Cloudflare Dashboard → D1 → trade_portfolio_db → Console`);
console.log(`2. Copy all SQL from import_trading_data.sql`);
console.log(`3. Paste into the console and click Execute`);
