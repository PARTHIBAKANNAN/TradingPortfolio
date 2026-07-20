-- Add tax and charges columns to metal_transactions
ALTER TABLE metal_transactions ADD COLUMN tax REAL DEFAULT 0 CHECK (tax >= 0);
ALTER TABLE metal_transactions ADD COLUMN spread_charge REAL DEFAULT 0 CHECK (spread_charge >= 0);
ALTER TABLE metal_transactions ADD COLUMN other_charges REAL DEFAULT 0 CHECK (other_charges >= 0);
ALTER TABLE metal_transactions ADD COLUMN effective_price_per_gram REAL;

-- Create index for tax-related queries
CREATE INDEX idx_metal_tx_tax ON metal_transactions(metal_type, trade_type) WHERE tax > 0;
