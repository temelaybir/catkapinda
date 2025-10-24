-- Migration: Fix payment_method for existing orders
-- Date: 2025-10-11
-- Description: Set payment_method based on payment_status and notes
-- IMPORTANT: Run 20251011_add_payment_method_column.sql FIRST!

-- Update orders with awaiting_payment status to bank_transfer
UPDATE orders
SET payment_method = 'bank_transfer'
WHERE payment_status = 'awaiting_payment'
  AND (payment_method IS NULL OR payment_method = '');

-- Update orders with notes containing bank transfer keywords
UPDATE orders
SET payment_method = 'bank_transfer'
WHERE (notes ILIKE '%banka_transfer%' OR notes ILIKE '%bank_transfer%')
  AND (payment_method IS NULL OR payment_method = '');

-- Update all other orders to credit_card (default)
UPDATE orders
SET payment_method = 'credit_card'
WHERE payment_method IS NULL OR payment_method = '';

-- Verify results
SELECT 
  payment_method,
  payment_status,
  COUNT(*) as count
FROM orders
GROUP BY payment_method, payment_status
ORDER BY payment_method, payment_status;

