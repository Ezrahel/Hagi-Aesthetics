# Admin Setup Instructions

## 1. Create Admin User in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"**
4. Enter the following details:
   - **Email**: `admin@hagi-aesthetics.com`
   - **Password**: `hagiAdmin024`
   - **Email Confirm**: Check this box
5. Click **"Create user"**

## 2. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase Dashboard
2. Run the following SQL script (from `supabase-schema.sql`):

```sql
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

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
-- Allow public read access
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);

-- Allow admin full access
CREATE POLICY "Admin full access" ON products
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'admin@hagi-aesthetics.com'
  );

-- Insert sample products
INSERT INTO products (name, productno, description, description2, productdetails, price, image) VALUES
('Hagi''s Whipped Velvet Elixir', 'product 01', 'This premium product is crafted by Hagi Aesthetics, ensuring you receive a luxurious experience. The 8 oz (250 ml) bottle is perfect for those looking to enhance their skincare routine. The blend of Lavender and Vanilla offers a soothing aroma.', 'Crafted by Hagi Aesthetics, the Hagi''s Whipped Velvet Elixir is a premium skincare essential that enhances your daily self-care. Designed to deeply moisturize, soothe, and soften your skin, this luxurious butter delivers a rich, creamy feel with every application. The Lavender and Vanilla aroma helps you relax and unwind, making it perfect for both morning and night routines.', 'Product Details', 29.99, '/product1.png'),
('Suck It Up Body Butter', 'product 02', 'Indulge in daily luxury with this gentle formula designed to hydrate and refresh your skin. Infused with the calming scent of Strawberry Vanilla for a spa-like experience.', 'Crafted by Hagi Aesthetics, the Suck It Up Body Butter is a premium skincare essential that enhances your daily self-care. Designed to deeply moisturize, soothe, and soften your skin, this luxurious butter delivers a rich, creamy feel with every application. The Lavender and Vanilla aroma helps you relax and unwind, making it perfect for both morning and night routines.', 'Product Details', 24.99, '/product2.png'),
('Vietnamese Hair Vendor List', 'product 03', 'A carefully curated Vendor List that gives you access to verified beauty and lifestyle suppliers — the same ones successful small business owners trust. You''ll get: 📍 Direct contact details of suppliers (no middlemen) 🌐 Links to websites & social platforms 💰 Info on minimum order quantities (MOQs) 🚚 Shipping & fulfillment info (domestic & international)', 'A downloadable PDF with: 🏭 Direct contact info of verified Hair vendors 🌐 Links to their websites and social pages 📦 Minimum order quantities & pricing info 🚛 Shipping/fulfillment details (US & international) 💬 Tips on vendor communication & negotiation', '✅What You''ll Get:', 39.00, '/product3.png');
```

## 3. Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Access Admin Panel

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Login with:
   - **Email**: `admin@hagi-aesthetics.com`
   - **Password**: `hagiAdmin024`

## 5. Admin Features

### Dashboard (`/admin`)
- View all products
- Add new products
- Edit existing products
- Delete products

### Product Management
- **Add Product** (`/admin/products/new`): Create new products with all details
- **Edit Product** (`/admin/products/[id]/edit`): Update existing products
- **Delete Product**: Remove products from the database

### Security Features
- Admin-only access (email verification)
- Session-based authentication
- Protected routes with middleware
- Secure API endpoints with service role key

## 6. API Endpoints

- `GET /api/products` - Fetch all products
- `GET /api/products/[id]` - Fetch single product
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

## 7. Database Schema

The `products` table includes:
- `id` (UUID, Primary Key)
- `name` (Text, Required)
- `productno` (Text, Required)
- `description` (Text, Required)
- `description2` (Text, Optional)
- `productdetails` (Text, Optional)
- `price` (Decimal, Required)
- `image` (Text, Required)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 8. Security Notes

- Admin authentication is email-based
- All admin routes are protected by middleware
- Database operations use service role key for security
- Row Level Security (RLS) is enabled on the products table
- Public read access is allowed for products
- Only admin email can perform write operations

## 9. Troubleshooting

### Common Issues:

1. **"Access denied" error**: Make sure you're using the exact admin email
2. **Database errors**: Check that the schema was created correctly
3. **API errors**: Verify your environment variables are set correctly
4. **Login issues**: Ensure the admin user was created in Supabase Auth

### Support:
- Check browser console for detailed error messages
- Verify Supabase logs in the dashboard
- Ensure all environment variables are properly set
