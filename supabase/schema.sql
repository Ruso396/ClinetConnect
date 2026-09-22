-- ============================================================
-- Ruso Bros - Supabase schema
-- Run this file in the Supabase SQL Editor.
-- It is idempotent and safe to run multiple times.
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (already enabled on Supabase by default).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'marketing',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  customer_type TEXT NOT NULL DEFAULT 'lead',
  status TEXT NOT NULL DEFAULT 'new_lead',
  notes TEXT,
  follow_up_date DATE,
  follow_up_time TIME,
  created_by UUID REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CUSTOMER ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id),
  activity_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. CONSTRAINTS
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_customer_type_check') THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_customer_type_check
      CHECK (customer_type IN ('lead', 'customer', 'business', 'other'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_status_check') THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_status_check
      CHECK (status IN ('new_lead', 'contacted', 'follow_up', 'interested', 'converted', 'not_interested'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_activities_type_check') THEN
    ALTER TABLE public.customer_activities
      ADD CONSTRAINT customer_activities_type_check
      CHECK (activity_type IN ('created', 'note', 'call', 'meeting', 'whatsapp', 'follow_up', 'status_change', 'edited'));
  END IF;
END $$;

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_name          ON public.customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_phone         ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_company       ON public.customers (company);
CREATE INDEX IF NOT EXISTS idx_customers_status        ON public.customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_follow_up_date ON public.customers (follow_up_date);
CREATE INDEX IF NOT EXISTS idx_customers_created_at    ON public.customers (created_at);
CREATE INDEX IF NOT EXISTS idx_activities_customer_id  ON public.customer_activities (customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at   ON public.customer_activities (created_at);

-- ============================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), ''),
    NEW.email,
    'marketing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_profiles_on_auth_user ON auth.users;
CREATE TRIGGER trg_profiles_on_auth_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;

-- --- PROFILES ---
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- --- CUSTOMERS ---
DROP POLICY IF EXISTS "customers_select_all" ON public.customers;
CREATE POLICY "customers_select_all"
  ON public.customers FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "customers_insert_all" ON public.customers;
CREATE POLICY "customers_insert_all"
  ON public.customers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "customers_update_all" ON public.customers;
CREATE POLICY "customers_update_all"
  ON public.customers FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "customers_delete_all" ON public.customers;
CREATE POLICY "customers_delete_all"
  ON public.customers FOR DELETE
  USING (auth.role() = 'authenticated');

-- --- CUSTOMER ACTIVITIES ---
DROP POLICY IF EXISTS "activities_select_all" ON public.customer_activities;
CREATE POLICY "activities_select_all"
  ON public.customer_activities FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "activities_insert_all" ON public.customer_activities;
CREATE POLICY "activities_insert_all"
  ON public.customer_activities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "activities_delete_all" ON public.customer_activities;
CREATE POLICY "activities_delete_all"
  ON public.customer_activities FOR DELETE
  USING (auth.role() = 'authenticated');