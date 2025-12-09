-- Fix orders table schema
-- Run this in your Supabase SQL Editor if you're getting column errors

-- First, check what columns actually exist (for debugging)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Add orderId column if it doesn't exist (check both cases)
DO $$ 
BEGIN
    -- Check if orderId (camelCase) exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'orderId'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'orderid'
    ) THEN
        ALTER TABLE orders ADD COLUMN "orderId" TEXT UNIQUE;
    END IF;
END $$;

-- Check if couponCode column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND (column_name = 'couponCode' OR column_name = 'couponcode')
    ) THEN
        ALTER TABLE orders ADD COLUMN "couponCode" TEXT;
    END IF;
END $$;

-- Also ensure customerEmail and customerName exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND (column_name = 'customerEmail' OR column_name = 'customeremail')
    ) THEN
        ALTER TABLE orders ADD COLUMN "customerEmail" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND (column_name = 'customerName' OR column_name = 'customername')
    ) THEN
        ALTER TABLE orders ADD COLUMN "customerName" TEXT;
    END IF;
END $$;

-- Verify all columns exist after fixes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

