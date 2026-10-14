-- ============================================
-- ESTATEFLOW RLS POLICIES FOR EXISTING TABLES
-- Applies to tables that already existed
-- ============================================

-- Enable RLS on all existing tables
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
-- PROFILES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- ESTATES
-- ============================================

-- Estate members can view their estate
DROP POLICY IF EXISTS "Members can view own estate" ON public.estates;
CREATE POLICY "Members can view own estate" ON public.estates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estates.id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Managers can update their estate
DROP POLICY IF EXISTS "Managers can update own estate" ON public.estates;
CREATE POLICY "Managers can update own estate" ON public.estates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estates.id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- Managers can insert estates
DROP POLICY IF EXISTS "Managers can insert estates" ON public.estates;
CREATE POLICY "Managers can insert estates" ON public.estates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estates.id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- ============================================
-- ESTATE MEMBERSHIPS
-- ============================================

-- Members can view their own memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON public.estate_memberships;
CREATE POLICY "Users can view own memberships" ON public.estate_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Members can view estate memberships
DROP POLICY IF EXISTS "Members can view estate memberships" ON public.estate_memberships;
CREATE POLICY "Members can view estate memberships" ON public.estate_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = estate_memberships.estate_id
      AND em.user_id = auth.uid()
      AND em.status = 'active'
    )
  );

-- Managers can manage memberships
DROP POLICY IF EXISTS "Managers can manage memberships" ON public.estate_memberships;
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

DROP POLICY IF EXISTS "Managers can update memberships" ON public.estate_memberships;
CREATE POLICY "Managers can update memberships" ON public.estate_memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = estate_memberships.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- ============================================
-- UNITS
-- ============================================

-- Estate members can view units
DROP POLICY IF EXISTS "Members can view estate units" ON public.units;
CREATE POLICY "Members can view estate units" ON public.units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = units.estate_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Managers can manage units
DROP POLICY IF EXISTS "Managers can manage units" ON public.units;
CREATE POLICY "Managers can manage units" ON public.units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = units.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- ============================================
-- UNIT MEMBERSHIPS
-- ============================================

-- Users can view their own unit memberships
DROP POLICY IF EXISTS "Users can view own unit membership" ON public.unit_memberships;
CREATE POLICY "Users can view own unit membership" ON public.unit_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Managers can view all unit memberships in their estate
DROP POLICY IF EXISTS "Managers can view estate unit memberships" ON public.unit_memberships;
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
-- ANNOUNCEMENTS
-- ============================================

-- Estate members can view announcements
DROP POLICY IF EXISTS "Members can view estate announcements" ON public.announcements;
CREATE POLICY "Members can view estate announcements" ON public.announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = announcements.estate_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Managers can create announcements
DROP POLICY IF EXISTS "Managers can create announcements" ON public.announcements;
CREATE POLICY "Managers can create announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = announcements.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- Managers can update announcements
DROP POLICY IF EXISTS "Managers can update announcements" ON public.announcements;
CREATE POLICY "Managers can update announcements" ON public.announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = announcements.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- ============================================
-- COMPLAINTS
-- ============================================

-- Users can view their own complaints
DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;
CREATE POLICY "Users can view own complaints" ON public.complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = complaints.tenant_id
      AND t.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = complaints.estate_id
      AND em.user_id = auth.uid()
      AND em.status = 'active'
    )
  );

-- Tenants can create complaints
DROP POLICY IF EXISTS "Tenants can create complaints" ON public.complaints;
CREATE POLICY "Tenants can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = complaints.tenant_id
      AND t.user_id = auth.uid()
    )
  );

-- Managers can update complaints
DROP POLICY IF EXISTS "Managers can update complaints" ON public.complaints;
CREATE POLICY "Managers can update complaints" ON public.complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = complaints.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- ============================================
-- EMERGENCY ALERTS
-- ============================================

-- Reporters can view their own alerts
DROP POLICY IF EXISTS "Reporters can view own emergencies" ON public.emergency_alerts;
CREATE POLICY "Reporters can view own emergencies" ON public.emergency_alerts
  FOR SELECT USING (
    reporter_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = emergency_alerts.estate_id
      AND em.user_id = auth.uid()
      AND em.status = 'active'
    )
  );

-- Estate members can create emergency alerts (no rate limiting - Patch §3)
DROP POLICY IF EXISTS "Members can create emergencies" ON public.emergency_alerts;
CREATE POLICY "Members can create emergencies" ON public.emergency_alerts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = emergency_alerts.estate_id
      AND em.user_id = auth.uid()
      AND em.status = 'active'
    )
  );

-- Managers/Staff can update emergencies
DROP POLICY IF EXISTS "Managers can update emergencies" ON public.emergency_alerts;
CREATE POLICY "Managers can update emergencies" ON public.emergency_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = emergency_alerts.estate_id
      AND em.user_id = auth.uid()
      AND em.status = 'active'
    )
  );

-- ============================================
-- GUEST CODES
-- ============================================

-- Hosts can view their own guest codes
DROP POLICY IF EXISTS "Hosts can view own guest codes" ON public.guest_codes;
CREATE POLICY "Hosts can view own guest codes" ON public.guest_codes
  FOR SELECT USING (tenant_id = auth.uid());

-- Security staff can view estate guest codes
DROP POLICY IF EXISTS "Security can view estate guest codes" ON public.guest_codes;
CREATE POLICY "Security can view estate guest codes" ON public.guest_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      JOIN public.service_staff ss ON ss.user_id = em.user_id
      WHERE ss.estate_id = guest_codes.estate_id
      AND ss.role = 'security'
      AND em.user_id = auth.uid()
    )
  );

-- Tenants can create guest codes
DROP POLICY IF EXISTS "Tenants can create guest codes" ON public.guest_codes;
CREATE POLICY "Tenants can create guest codes" ON public.guest_codes
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- ============================================
-- INVOICES
-- ============================================

-- Tenants can view their own invoices
DROP POLICY IF EXISTS "Tenants can view own invoices" ON public.invoices;
CREATE POLICY "Tenants can view own invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = invoices.tenant_id
      AND t.user_id = auth.uid()
    )
  );

-- Managers can view estate invoices
DROP POLICY IF EXISTS "Managers can view estate invoices" ON public.invoices;
CREATE POLICY "Managers can view estate invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = invoices.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- Managers can create/update invoices
DROP POLICY IF EXISTS "Managers can manage invoices" ON public.invoices;
CREATE POLICY "Managers can manage invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = invoices.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- System can insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- TENANTS
-- ============================================

-- Users can view their own tenant record
DROP POLICY IF EXISTS "Users can view own tenant record" ON public.tenants;
CREATE POLICY "Users can view own tenant record" ON public.tenants
  FOR SELECT USING (user_id = auth.uid());

-- Managers can view estate tenants
DROP POLICY IF EXISTS "Managers can view estate tenants" ON public.tenants;
CREATE POLICY "Managers can view estate tenants" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = tenants.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- Managers can manage tenants
DROP POLICY IF EXISTS "Managers can manage tenants" ON public.tenants;
CREATE POLICY "Managers can manage tenants" ON public.tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = tenants.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- ============================================
-- SERVICE STAFF
-- ============================================

-- Staff can view their own record
DROP POLICY IF EXISTS "Staff can view own record" ON public.service_staff;
CREATE POLICY "Staff can view own record" ON public.service_staff
  FOR SELECT USING (user_id = auth.uid());

-- Managers can view estate staff
DROP POLICY IF EXISTS "Managers can view estate staff" ON public.service_staff;
CREATE POLICY "Managers can view estate staff" ON public.service_staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = service_staff.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- Managers can manage staff
DROP POLICY IF EXISTS "Managers can manage staff" ON public.service_staff;
CREATE POLICY "Managers can manage staff" ON public.service_staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships em
      WHERE em.estate_id = service_staff.estate_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
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

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies applied to all existing tables!';
  RAISE NOTICE 'Tables secured: announcements, complaints, emergency_alerts, estate_memberships, estates, guest_codes, invoices, notifications, profiles, service_staff, tenants, unit_memberships, units';
  RAISE NOTICE 'Auto-profile creation trigger installed';
END $$;
