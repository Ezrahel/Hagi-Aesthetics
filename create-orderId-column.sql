-- Simple, direct fix for missing orderId column
-- Run this in Supabase SQL Editor

-- First, drop the column if it exists in wrong case (optional - comment out if you want to keep data)
-- ALTER TABLE orders DROP COLUMN IF EXISTS orderid;

-- Add orderId column with explicit quotes to preserve camelCase
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderId" TEXT;

-- Add unique constraint if needed (uncomment if you want it unique)
-- ALTER TABLE orders ADD CONSTRAINT orders_orderId_unique UNIQUE ("orderId");

-- Verify it was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND (column_name = 'orderId' OR column_name = 'orderid')
ORDER BY ordinal_position;

