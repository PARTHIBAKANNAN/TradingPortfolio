import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('portfolio.db');

const tables = [
  'stock_transactions',
  'metal_transactions',
  'options_trades',
  'intraday_trades',
  'expenses',
];

let sql = '-- Exported data from local portfolio.db\n\n';

for (const table of tables) {
  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length > 0) {
      console.log(`Exporting ${table} (${rows.length} rows)...`);
      const cols = Object.keys(rows[0]);
      
      for (const row of rows) {
        const values = cols.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        }).join(', ');
        
        sql += `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${values});\n`;
      }
    }
  } catch (e) {
    console.log(`Table ${table} not found or error: ${e.message}`);
  }
}

fs.writeFileSync('exported_data.sql', sql);
console.log('\n✅ Data exported to exported_data.sql');
db.close();
