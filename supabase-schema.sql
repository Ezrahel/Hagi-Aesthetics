-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  productno TEXT NOT NULL,
  description TEXT NOT NULL,
  description2 TEXT,
  productdetails TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin user (you'll need to run this in Supabase SQL editor)
-- First, create the user in Supabase Auth dashboard with email: admin@hagi-aesthetics.com
-- Then run this to set up the user metadata:
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'
) 
WHERE email = 'admin@hagi-aesthetics.com';

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
-- Allow public read access
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

-- Allow admin full access (you'll need to adjust this based on your auth setup)
CREATE POLICY "Admin full access" ON products
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'admin@hagi-aesthetics.com'
  );

-- Insert sample products
INSERT INTO products (name, productno, description, description2, productdetails, price, image) VALUES
('Hagi''s Whipped Velvet Elixir', 'product 01', 'This premium product is crafted by Hagi Aesthetics, ensuring you receive a luxurious experience. The 8 oz (250 ml) bottle is perfect for those looking to enhance their skincare routine. The blend of Lavender and Vanilla offers a soothing aroma.', 'Crafted by Hagi Aesthetics, the Hagi''s Whipped Velvet Elixir is a premium skincare essential that enhances your daily self-care. Designed to deeply moisturize, soothe, and soften your skin, this luxurious butter delivers a rich, creamy feel with every application. The Lavender and Vanilla aroma helps you relax and unwind, making it perfect for both morning and night routines.', 'Product Details', 29.99, '/product1.png'),
('Suck It Up Body Butter', 'product 02', 'Indulge in daily luxury with this gentle formula designed to hydrate and refresh your skin. Infused with the calming scent of Strawberry Vanilla for a spa-like experience.', 'Crafted by Hagi Aesthetics, the Suck It Up Body Butter is a premium skincare essential that enhances your daily self-care. Designed to deeply moisturize, soothe, and soften your skin, this luxurious butter delivers a rich, creamy feel with every application. The Lavender and Vanilla aroma helps you relax and unwind, making it perfect for both morning and night routines.', 'Product Details', 24.99, '/product2.png'),
('Vietnamese Hair Vendor List', 'product 03', 'A carefully curated Vendor List that gives you access to verified beauty and lifestyle suppliers — the same ones successful small business owners trust. You''ll get: 📍 Direct contact details of suppliers (no middlemen) 🌐 Links to websites & social platforms 💰 Info on minimum order quantities (MOQs) 🚚 Shipping & fulfillment info (domestic & international)', 'A downloadable PDF with: 🏭 Direct contact info of verified Hair vendors 🌐 Links to their websites and social pages 📦 Minimum order quantities & pricing info 🚛 Shipping/fulfillment details (US & international) 💬 Tips on vendor communication & negotiation', '✅What You''ll Get:', 39.00, '/product3.png');
