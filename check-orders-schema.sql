-- Diagnostic script to check orders table schema
-- Run this first to see what columns you have

SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- This will show you all columns in your orders table
-- Compare this with what the code expects:
-- Expected columns: id, orderId, user_id, product_id, status, items, subtotal, shipping, discount, total, couponCode, customerEmail, customerName, session_id, payment_intent, provider, providerPayload, created_at, updated_at

