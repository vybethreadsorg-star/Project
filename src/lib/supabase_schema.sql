-- ============================================================
-- Supabase Schema for Clothing E-Commerce App
-- Run this entire script in Supabase SQL Editor once.
-- Tables are created in dependency order to avoid errors.
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. PRODUCTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ── 3. ORDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users see their own; admins see all
CREATE POLICY "Users and admins can view orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ── 4. ORDER ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users and admins can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
      )
    )
  );


-- ── 5. SEED PRODUCTS ─────────────────────────────────────────
INSERT INTO public.products (name, price, category, image, is_featured) VALUES
  ('NEON GLITCH HOODIE',       499900, 'HOODIE | V2.0',       'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800', TRUE),
  ('CYBER-STRIKE TEE',         249900, 'T-SHIRT | SYSTEM',    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800', TRUE),
  ('HOLOGRAPHIC TEE',          299900, 'T-SHIRT | CORE',      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800', TRUE),
  ('CUSTOM NEON PRINT',        349900, 'CUSTOM | ALPHA',      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800', TRUE),
  ('SYNTHWEAVE SHIRT',         389900, 'SHIRT | SYSTEM',      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800', TRUE),
  ('NIGHT-CITY CARGOS',        549900, 'PANTS | SYSTEM',      'https://images.unsplash.com/photo-1624378439575-d1ead6bb2d50?auto=format&fit=crop&q=80&w=800', TRUE)
  

ON CONFLICT DO NOTHING;




-- ── HOW TO MAKE A USER AN ADMIN ──────────────────────────────
-- After signing up at /auth, run this (replace with your email):
--
-- UPDATE public.profiles
--   SET is_admin = TRUE
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
-- ─────────────────────────────────────────────────────────────


-- ── 9. NEW PRODUCT COLUMNS (run in Supabase SQL Editor) ──────
-- Add these if you already ran the schema above:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes TEXT[]    DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS label TEXT      DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS mrp   INTEGER   DEFAULT NULL;
-- sizes: e.g. '{S,M,L,XL}' — array of available size strings
-- label: e.g. 'NEW', 'HOT', 'SALE', 'LIMITED', 'BESTSELLER' — badge shown on card
-- mrp  : original price in paise (₹); if set, shown crossed out beside offer price
-- ─────────────────────────────────────────────────────────────
-- ── 6. COUPONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent',  -- 'percent' | 'flat'
  value INTEGER NOT NULL,                -- percent (0-100) or flat paise
  min_order INTEGER DEFAULT 0,           -- min order total in paise to apply
  max_uses INTEGER DEFAULT NULL,         -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (for validation at checkout)
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE);

-- Only admins can manage coupons
CREATE POLICY "Admins can insert coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can update coupons"
  ON public.coupons FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can delete coupons"
  ON public.coupons FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));


-- ── 7. SHIPPING SETTINGS ─────────────────────────────────────
-- Single-row config table (id = 1 always)
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  free_shipping_enabled BOOLEAN DEFAULT FALSE,
  free_shipping_threshold INTEGER DEFAULT 0,   -- in paise; 0 = always free
  standard_charge INTEGER DEFAULT 9900,        -- in paise (₹99)
  express_enabled BOOLEAN DEFAULT FALSE,
  express_charge INTEGER DEFAULT 19900,        -- in paise (₹199)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read shipping settings (used at checkout)
CREATE POLICY "Anyone can view shipping settings"
  ON public.shipping_settings FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update shipping settings"
  ON public.shipping_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Insert default row
INSERT INTO public.shipping_settings (id, free_shipping_enabled, free_shipping_threshold, standard_charge, express_enabled, express_charge)
VALUES (1, FALSE, 0, 9900, FALSE, 19900)
ON CONFLICT (id) DO NOTHING;


-- ── 8. SUPABASE STORAGE (Product Images) ─────────────────────
-- Run this in Supabase Dashboard → Storage to create the bucket:
--
-- 1. Go to Storage → New Bucket
-- 2. Name: "product-images"
-- 3. Public: YES (toggle on)
-- 4. Then run this SQL to allow admins to upload:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true)
-- ON CONFLICT DO NOTHING;
--
-- CREATE POLICY "Admins can upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'product-images' AND
--     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
--   );
--
-- CREATE POLICY "Anyone can view product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');
-- ─────────────────────────────────────────────────────────────

