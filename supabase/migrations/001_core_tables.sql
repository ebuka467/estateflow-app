-- ============================================
-- ESTATEFLOW MIGRATION 001: Core Tables
-- Additive only, IF NOT EXISTS
-- Rollback: See bottom of file
-- ============================================

-- Users profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  surname TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estates
CREATE TABLE IF NOT EXISTS public.estates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manager_email TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  monthly_dues INTEGER NOT NULL DEFAULT 15000,
  app_dues INTEGER NOT NULL DEFAULT 1500,
  subscription TEXT DEFAULT 'active',
  estate_account_number TEXT,
  estate_account_name TEXT,
  estate_bank TEXT,
  description TEXT,
  address TEXT,
  logo_url TEXT,
  bg_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estate memberships (who belongs to which estate, what role)
CREATE TABLE IF NOT EXISTS public.estate_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'tenant', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
  staff_type TEXT CHECK (staff_type IN ('security', 'plumber', 'electrician', 'cleaner', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, estate_id)
);

-- Units (houses/flats within an estate)
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  block TEXT,
  unit_number TEXT NOT NULL,
  unit_type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estate_id, block, unit_number)
);

-- Unit memberships (which tenant lives in which unit)
CREATE TABLE IF NOT EXISTS public.unit_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'moved_out', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_estate_memberships_user ON public.estate_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_estate_memberships_estate ON public.estate_memberships(estate_id);
CREATE INDEX IF NOT EXISTS idx_estate_memberships_role ON public.estate_memberships(estate_id, role);
CREATE INDEX IF NOT EXISTS idx_units_estate ON public.units(estate_id);
CREATE INDEX IF NOT EXISTS idx_unit_memberships_user ON public.unit_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_unit_memberships_unit ON public.unit_memberships(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_memberships_estate ON public.unit_memberships(estate_id);

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estate_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Estates: members can view their own estate
CREATE POLICY "Members can view own estate" ON public.estates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estates.id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Estate memberships: members can view their estate's memberships
CREATE POLICY "Members can view estate memberships" ON public.estate_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = estate_memberships.estate_id
      AND em.user_id = auth.uid()
      AND em.status = 'active'
    )
  );

CREATE POLICY "Users can view own memberships" ON public.estate_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Managers can insert memberships for their estate
CREATE POLICY "Managers can manage memberships" ON public.estate_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = estate_memberships.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- Units: members can view units in their estate
CREATE POLICY "Members can view estate units" ON public.units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = units.estate_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Unit memberships: tenants can view their own, managers can view all in their estate
CREATE POLICY "Users can view own unit membership" ON public.unit_memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view estate unit memberships" ON public.unit_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = unit_memberships.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, surname, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'surname', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-derive estate_id from auth session (security function)
CREATE OR REPLACE FUNCTION public.get_user_estate_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT estate_id FROM public.estate_memberships
    WHERE user_id = auth.uid()
    AND role = 'manager'
    AND status = 'active'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROLLBACK SCRIPT (run to undo this migration)
-- ============================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.get_user_estate_id();
-- DROP TABLE IF EXISTS public.unit_memberships;
-- DROP TABLE IF EXISTS public.units;
-- DROP TABLE IF EXISTS public.estate_memberships;
-- DROP TABLE IF EXISTS public.estates;
-- DROP TABLE IF EXISTS public.profiles;
