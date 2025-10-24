-- Migration: Add payment_method column to orders table
-- Date: 2025-10-11
-- Description: Add payment_method column to track payment type (credit_card, bank_transfer, etc.)

-- Add payment_method column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add comment
COMMENT ON COLUMN orders.payment_method IS 'Payment method used: credit_card, bank_transfer, cash_on_delivery, etc.';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Verify column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'payment_method';

