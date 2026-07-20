CREATE TABLE broker_tokens (
  broker        TEXT PRIMARY KEY CHECK (broker IN ('aliceblue','dhan')),
  access_token  TEXT NOT NULL,
  extra_json    TEXT,
  expires_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sync_state (
  broker              TEXT PRIMARY KEY CHECK (broker IN ('aliceblue','dhan')),
  status              TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','running','success','error')),
  last_synced_at      TEXT,
  last_error          TEXT,
  last_run_summary    TEXT,
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE options_trades ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE options_trades ADD COLUMN external_id TEXT;
CREATE UNIQUE INDEX idx_options_external_id ON options_trades(source, external_id)
  WHERE external_id IS NOT NULL;

ALTER TABLE intraday_trades ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE intraday_trades ADD COLUMN external_id TEXT;
CREATE UNIQUE INDEX idx_intraday_external_id ON intraday_trades(source, external_id)
  WHERE external_id IS NOT NULL;

CREATE TABLE expenses (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_date  TEXT NOT NULL,
  category      TEXT NOT NULL,
  amount        REAL NOT NULL CHECK (amount >= 0),
  description   TEXT,
  source        TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv_axio')),
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
