-- ============================================
-- ESTATEFLOW RLS POLICIES — FIXED FOR EXISTING SCHEMA
-- Based on actual column names from diagnostic
-- ============================================

-- ============================================
-- PART 1: Fix complaints table (add missing columns first)
-- ============================================

-- Add missing columns to complaints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='id') THEN
    ALTER TABLE public.complaints ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='estate_id') THEN
    ALTER TABLE public.complaints ADD COLUMN estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='tenant_id') THEN
    ALTER TABLE public.complaints ADD COLUMN tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='priority') THEN
    ALTER TABLE public.complaints ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='assigned_to') THEN
    ALTER TABLE public.complaints ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='date') THEN
    ALTER TABLE public.complaints ADD COLUMN date TEXT;
  END IF;
END $$;

-- Add missing columns to tenants
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='user_id') THEN
    ALTER TABLE public.tenants ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='joined_date') THEN
    ALTER TABLE public.tenants ADD COLUMN joined_date TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='phone') THEN
    ALTER TABLE public.tenants ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='status') THEN
    ALTER TABLE public.tenants ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add missing columns to guest_codes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='tenant_id') THEN
    ALTER TABLE public.guest_codes ADD COLUMN tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='estate_id') THEN
    ALTER TABLE public.guest_codes ADD COLUMN estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='guest_type') THEN
    ALTER TABLE public.guest_codes ADD COLUMN guest_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='access_token') THEN
    ALTER TABLE public.guest_codes ADD COLUMN access_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='expires_at') THEN
    ALTER TABLE public.guest_codes ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='status') THEN
    ALTER TABLE public.guest_codes ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='vehicle_info') THEN
    ALTER TABLE public.guest_codes ADD COLUMN vehicle_info TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='arrival_time') THEN
    ALTER TABLE public.guest_codes ADD COLUMN arrival_time TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='checked_in_at') THEN
    ALTER TABLE public.guest_codes ADD COLUMN checked_in_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='checked_out_at') THEN
    ALTER TABLE public.guest_codes ADD COLUMN checked_out_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_codes' AND column_name='checked_in_by') THEN
    ALTER TABLE public.guest_codes ADD COLUMN checked_in_by UUID REFERENCES public.profiles(id);
  END IF;
END $$;

-- Add missing columns to service_staff
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_staff' AND column_name='user_id') THEN
    ALTER TABLE public.service_staff ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_staff' AND column_name='status') THEN
    ALTER TABLE public.service_staff ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_staff' AND column_name='staff_type') THEN
    ALTER TABLE public.service_staff ADD COLUMN staff_type TEXT;
  END IF;
END $$;

-- Add missing columns to emergency_alerts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='reporter_id') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN reporter_id UUID REFERENCES public.profiles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='unit_id') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='description') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='location') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN location TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='responded_by') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN responded_by UUID REFERENCES public.profiles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='responded_at') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN responded_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emergency_alerts' AND column_name='resolved_at') THEN
    ALTER TABLE public.emergency_alerts ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add missing columns to announcements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='author_id') THEN
    ALTER TABLE public.announcements ADD COLUMN author_id UUID REFERENCES public.profiles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='priority') THEN
    ALTER TABLE public.announcements ADD COLUMN priority TEXT DEFAULT 'normal';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='published_at') THEN
    ALTER TABLE public.announcements ADD COLUMN published_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='expires_at') THEN
    ALTER TABLE public.announcements ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='created_at') THEN
    ALTER TABLE public.announcements ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='estate_id') THEN
    ALTER TABLE public.notifications ADD COLUMN estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
    ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
    ALTER TABLE public.notifications ADD COLUMN type TEXT DEFAULT 'system';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read') THEN
    ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='metadata') THEN
    ALTER TABLE public.notifications ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- PART 2: Enable RLS on ALL tables
-- ============================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estate_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: RLS Policies (using actual column names)
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ESTATES
DROP POLICY IF EXISTS "Members can view own estate" ON public.estates;
CREATE POLICY "Members can view own estate" ON public.estates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estates.id AND user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can update own estate" ON public.estates;
CREATE POLICY "Managers can update own estate" ON public.estates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estates.id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'
    )
  );

-- ESTATE MEMBERSHIPS
DROP POLICY IF EXISTS "Users can view own memberships" ON public.estate_memberships;
CREATE POLICY "Users can view own memberships" ON public.estate_memberships
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Members can view estate memberships" ON public.estate_memberships;
CREATE POLICY "Members can view estate memberships" ON public.estate_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = estate_memberships.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage memberships" ON public.estate_memberships;
CREATE POLICY "Managers can manage memberships" ON public.estate_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = estate_memberships.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- UNITS
DROP POLICY IF EXISTS "Members can view estate units" ON public.units;
CREATE POLICY "Members can view estate units" ON public.units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = units.estate_id AND user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage units" ON public.units;
CREATE POLICY "Managers can manage units" ON public.units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = units.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'
    )
  );

-- UNIT MEMBERSHIPS
DROP POLICY IF EXISTS "Users can view own unit membership" ON public.unit_memberships;
CREATE POLICY "Users can view own unit membership" ON public.unit_memberships
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Managers can view estate unit memberships" ON public.unit_memberships;
CREATE POLICY "Managers can view estate unit memberships" ON public.unit_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = unit_memberships.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- ANNOUNCEMENTS (fixed — uses estate_id only)
DROP POLICY IF EXISTS "Members can view estate announcements" ON public.announcements;
CREATE POLICY "Members can view estate announcements" ON public.announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = announcements.estate_id AND user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage announcements" ON public.announcements;
CREATE POLICY "Managers can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = announcements.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- COMPLAINTS (fixed — uses estate_id, not tenant_id)
DROP POLICY IF EXISTS "Users can view estate complaints" ON public.complaints;
CREATE POLICY "Users can view estate complaints" ON public.complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = complaints.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
CREATE POLICY "Users can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = complaints.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can update complaints" ON public.complaints;
CREATE POLICY "Managers can update complaints" ON public.complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = complaints.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- EMERGENCY ALERTS (fixed — uses estate_id)
DROP POLICY IF EXISTS "Users can view estate emergencies" ON public.emergency_alerts;
CREATE POLICY "Users can view estate emergencies" ON public.emergency_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = emergency_alerts.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Members can create emergencies" ON public.emergency_alerts;
CREATE POLICY "Members can create emergencies" ON public.emergency_alerts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = emergency_alerts.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can update emergencies" ON public.emergency_alerts;
CREATE POLICY "Managers can update emergencies" ON public.emergency_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = emergency_alerts.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

-- GUEST CODES (fixed — uses estate_id + tenant_id if exists)
DROP POLICY IF EXISTS "Users can view own guest codes" ON public.guest_codes;
CREATE POLICY "Users can view own guest codes" ON public.guest_codes
  FOR SELECT USING (
    tenant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = guest_codes.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can create guest codes" ON public.guest_codes;
CREATE POLICY "Users can create guest codes" ON public.guest_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = guest_codes.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

-- INVOICES (fixed — uses estate_id)
DROP POLICY IF EXISTS "Users can view estate invoices" ON public.invoices;
CREATE POLICY "Users can view estate invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = invoices.estate_id AND em.user_id = auth.uid() AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage invoices" ON public.invoices;
CREATE POLICY "Managers can manage invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = invoices.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- NOTIFICATIONS (fixed — uses user_id)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- TENANTS (fixed — uses user_id if exists, else estate_id)
DROP POLICY IF EXISTS "Users can view own tenant record" ON public.tenants;
CREATE POLICY "Users can view own tenant record" ON public.tenants
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Managers can view estate tenants" ON public.tenants;
CREATE POLICY "Managers can view estate tenants" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = tenants.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage tenants" ON public.tenants;
CREATE POLICY "Managers can manage tenants" ON public.tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = tenants.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- SERVICE STAFF (fixed — uses user_id if exists)
DROP POLICY IF EXISTS "Staff can view own record" ON public.service_staff;
CREATE POLICY "Staff can view own record" ON public.service_staff
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Managers can view estate staff" ON public.service_staff;
CREATE POLICY "Managers can view estate staff" ON public.service_staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = service_staff.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage staff" ON public.service_staff;
CREATE POLICY "Managers can manage staff" ON public.service_staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = service_staff.estate_id AND em.user_id = auth.uid() AND em.role = 'manager' AND em.status = 'active'
    )
  );

-- ============================================
-- PART 4: Auto-create profile on signup
-- ============================================

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 5: Helper functions
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_invoice_amounts(p_estate_id UUID, p_base_amount_kobo INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_service_fee_kobo INTEGER;
  v_total_kobo INTEGER;
BEGIN
  v_service_fee_kobo := ROUND(p_base_amount_kobo * 0.10);
  v_total_kobo := p_base_amount_kobo + v_service_fee_kobo;
  RETURN jsonb_build_object(
    'base_amount_kobo', p_base_amount_kobo,
    'service_fee_kobo', v_service_fee_kobo,
    'processing_fee_kobo', 0,
    'total_amount_kobo', v_total_kobo,
    'estate_settlement_kobo', p_base_amount_kobo,
    'estateflow_share_kobo', v_service_fee_kobo,
    'currency', 'NGN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.search_tenants(p_query TEXT, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (user_id UUID, name TEXT, unit_label TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.user_id, t.name, t.house_number, t.status
  FROM public.tenants t
  WHERE t.estate_id = public.get_user_estate_id()
    AND LENGTH(p_query) >= 2
    AND (
      t.name ILIKE '%' || p_query || '%'
      OR t.house_number ILIKE '%' || p_query || '%'
    )
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_estate_id() RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT estate_id FROM public.estate_memberships
    WHERE user_id = auth.uid() AND role = 'manager' AND status = 'active' LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies applied to all tables!';
  RAISE NOTICE 'Missing columns added to existing tables';
  RAISE NOTICE 'Functions created: calculate_invoice_amounts, search_tenants, get_user_estate_id';
  RAISE NOTICE 'Auto-profile trigger installed';
END $$;
