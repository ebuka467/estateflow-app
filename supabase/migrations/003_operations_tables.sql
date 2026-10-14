-- ============================================
-- ESTATEFLOW MIGRATION 003: Operations Tables
-- Announcements, Maintenance, Emergencies, Guests
-- ============================================

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'block', 'unit', 'group')),
  target_filter JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement reads (track who has read)
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'payment', 'maintenance', 'emergency', 'complaint', 'guest', 'system')),
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance/complaint tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in-progress', 'awaiting-tenant', 'resolved', 'closed')),
  images JSONB DEFAULT '[]',
  manager_notes TEXT,
  completion_notes TEXT,
  completion_images JSONB DEFAULT '[]',
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance events (audit trail)
CREATE TABLE IF NOT EXISTS public.maintenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.maintenance_tickets(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency alerts
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'responded', 'resolved', 'false-alarm')),
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest invites
CREATE TABLE IF NOT EXISTS public.guest_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id),
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  guest_type TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  vehicle_info TEXT,
  access_code TEXT NOT NULL,
  access_token TEXT,
  arrival_time TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'checked-in', 'checked-out', 'expired', 'revoked')),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Tokens (Patch §4: opaque, 128-bit+, hashed, rotatable, revocable)
CREATE TABLE IF NOT EXISTS public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('tenant-id', 'visitor-pass', 'estate-join', 'staff-id')),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification challenges (Patch §18: tenant verification PIN)
CREATE TABLE IF NOT EXISTS public.verification_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.maintenance_tickets(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id),
  pin_hash TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estate branding/customization (Patch §8: JSONB per estate)
CREATE TABLE IF NOT EXISTS public.estate_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estate_id, version)
);

-- Audit log (Master §41)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_estate ON public.announcements(estate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_maintenance_estate ON public.maintenance_tickets(estate_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reporter ON public.maintenance_tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON public.maintenance_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_emergency_estate ON public.emergency_alerts(estate_id);
CREATE INDEX IF NOT EXISTS idx_emergency_status ON public.emergency_alerts(estate_id, status);
CREATE INDEX IF NOT EXISTS idx_guest_estate ON public.guest_invites(estate_id);
CREATE INDEX IF NOT EXISTS idx_guest_host ON public.guest_invites(host_id);
CREATE INDEX IF NOT EXISTS idx_guest_code ON public.guest_invites(access_code);
CREATE INDEX IF NOT EXISTS idx_qr_token_hash ON public.qr_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_qr_user ON public.qr_tokens(user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_branding_estate ON public.estate_branding(estate_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_estate ON public.audit_logs(estate_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- Tenant search index (Patch §5: pg_trgm GIN)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON public.profiles USING GIN (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_surname_trgm ON public.profiles USING GIN (surname gin_trgm_ops);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estate_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Announcements: estate members can read
CREATE POLICY "Estate members read announcements" ON public.announcements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = announcements.estate_id AND user_id = auth.uid() AND status = 'active')
  );

-- Notifications: users see own
CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Maintenance: reporters see own, managers see estate, assigned staff see assigned
CREATE POLICY "Tenants see own tickets" ON public.maintenance_tickets
  FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "Managers see estate tickets" ON public.maintenance_tickets
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = maintenance_tickets.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'));
CREATE POLICY "Staff see assigned tickets" ON public.maintenance_tickets
  FOR SELECT USING (assigned_to = auth.uid());

-- Emergency: estate members can create, managers/staff see estate
CREATE POLICY "Estate members create emergencies" ON public.emergency_alerts
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = emergency_alerts.estate_id AND user_id = auth.uid() AND status = 'active'));
CREATE POLICY "Managers see estate emergencies" ON public.emergency_alerts
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = emergency_alerts.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'));
CREATE POLICY "Reporters see own emergencies" ON public.emergency_alerts
  FOR SELECT USING (reporter_id = auth.uid());

-- Guest invites: hosts see own, managers/staff see estate
CREATE POLICY "Hosts see own guest invites" ON public.guest_invites
  FOR SELECT USING (host_id = auth.uid());
CREATE POLICY "Managers see estate guest invites" ON public.guest_invites
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = guest_invites.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'));
CREATE POLICY "Security staff see estate guest invites" ON public.guest_invites
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = guest_invites.estate_id AND user_id = auth.uid() AND role = 'staff' AND staff_type = 'security' AND status = 'active'));

-- QR tokens: users see own, managers see estate
CREATE POLICY "Users see own QR tokens" ON public.qr_tokens
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Managers see estate QR tokens" ON public.qr_tokens
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = qr_tokens.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'));

-- Estate branding: everyone reads, only managers write
CREATE POLICY "Estate members read branding" ON public.estate_branding
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = estate_branding.estate_id AND user_id = auth.uid() AND status = 'active'));
CREATE POLICY "Managers manage branding" ON public.estate_branding
  FOR ALL USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = estate_branding.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'));

-- Audit logs: managers see estate logs
CREATE POLICY "Managers see estate audit logs" ON public.audit_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.estate_memberships WHERE estate_id = audit_logs.estate_id AND user_id = auth.uid() AND role = 'manager' AND status = 'active'));

-- Tenant search function (Patch §5: server-side, estate from auth)
CREATE OR REPLACE FUNCTION public.search_tenants(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  unit_label TEXT,
  status TEXT
) AS $$
BEGIN
  -- Estate is derived from auth.uid(), never passed as parameter
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    (p.first_name || ' ' || p.surname) AS name,
    COALESCE(u.block || ' ', '') || u.unit_number AS unit_label,
    um.status
  FROM public.profiles p
  JOIN public.unit_memberships um ON um.user_id = p.id
  JOIN public.units u ON u.id = um.unit_id
  JOIN public.estate_memberships em ON em.estate_id = um.estate_id
  WHERE em.user_id = auth.uid()
    AND em.role = 'manager'
    AND em.status = 'active'
    AND LENGTH(p_query) >= 2
    AND (
      p.first_name ILIKE '%' || p_query || '%'
      OR p.surname ILIKE '%' || p_query || '%'
      OR u.unit_number ILIKE '%' || p_query || '%'
    )
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROLLBACK
-- ============================================
-- DROP FUNCTION IF EXISTS public.search_tenants(TEXT, INTEGER);
-- DROP TABLE IF EXISTS public.audit_logs;
-- DROP TABLE IF EXISTS public.estate_branding;
-- DROP TABLE IF EXISTS public.verification_challenges;
-- DROP TABLE IF EXISTS public.qr_tokens;
-- DROP TABLE IF EXISTS public.guest_invites;
-- DROP TABLE IF EXISTS public.emergency_alerts;
-- DROP TABLE IF EXISTS public.maintenance_events;
-- DROP TABLE IF EXISTS public.maintenance_tickets;
-- DROP TABLE IF EXISTS public.notifications;
-- DROP TABLE IF EXISTS public.announcement_reads;
-- DROP TABLE IF EXISTS public.announcements;
