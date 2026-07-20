CREATE TABLE stock_transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol        TEXT NOT NULL,
  company_name  TEXT,
  trade_type    TEXT NOT NULL CHECK (trade_type IN ('BUY','SELL')),
  quantity      REAL NOT NULL CHECK (quantity > 0),
  price         REAL NOT NULL CHECK (price >= 0),
  trade_date    TEXT NOT NULL,
  notes         TEXT,
  source        TEXT NOT NULL DEFAULT 'manual',
  realized_pnl  REAL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_stock_tx_symbol_date ON stock_transactions(symbol, trade_date);

CREATE TABLE metal_transactions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  metal_type      TEXT NOT NULL CHECK (metal_type IN ('GOLD','SILVER')),
  trade_type      TEXT NOT NULL CHECK (trade_type IN ('BUY','SELL')),
  quantity_grams  REAL NOT NULL CHECK (quantity_grams > 0),
  price_per_gram  REAL NOT NULL CHECK (price_per_gram >= 0),
  trade_date      TEXT NOT NULL,
  notes           TEXT,
  source          TEXT NOT NULL DEFAULT 'manual',
  realized_pnl    REAL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_metal_tx_type_date ON metal_transactions(metal_type, trade_date);

CREATE TABLE options_trades (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  underlying     TEXT NOT NULL,
  strike_price   REAL NOT NULL,
  option_type    TEXT NOT NULL CHECK (option_type IN ('CE','PE')),
  expiry_date    TEXT NOT NULL,
  entry_price    REAL,
  exit_price     REAL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  entry_date     TEXT NOT NULL,
  exit_date      TEXT,
  status         TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
  realized_pnl   REAL,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_options_status_date ON options_trades(status, entry_date);

CREATE TABLE intraday_trades (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol        TEXT NOT NULL,
  buy_price     REAL,
  sell_price    REAL NOT NULL,
  quantity      REAL NOT NULL CHECK (quantity > 0),
  trade_date    TEXT NOT NULL,
  realized_pnl  REAL,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_intraday_date ON intraday_trades(trade_date);

CREATE TABLE price_cache (
  symbol      TEXT PRIMARY KEY,
  price       REAL NOT NULL,
  source      TEXT NOT NULL DEFAULT 'manual',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
