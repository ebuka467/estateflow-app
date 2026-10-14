-- ============================================
-- ESTATEFLOW COMPATIBILITY MIGRATION
-- Works with existing tables + adds missing ones
-- ============================================

-- ============================================
-- PART 1: Add missing columns to existing tables
-- ============================================

-- Add missing columns to estates if they don't exist
DO $$
BEGIN
  -- Add columns to estates if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='description') THEN
    ALTER TABLE public.estates ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='address') THEN
    ALTER TABLE public.estates ADD COLUMN address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='logo_url') THEN
    ALTER TABLE public.estates ADD COLUMN logo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='bg_image_url') THEN
    ALTER TABLE public.estates ADD COLUMN bg_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='subscription') THEN
    ALTER TABLE public.estates ADD COLUMN subscription TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='monthly_dues') THEN
    ALTER TABLE public.estates ADD COLUMN monthly_dues INTEGER DEFAULT 15000;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='app_dues') THEN
    ALTER TABLE public.estates ADD COLUMN app_dues INTEGER DEFAULT 1500;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='estate_account_number') THEN
    ALTER TABLE public.estates ADD COLUMN estate_account_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='estate_account_name') THEN
    ALTER TABLE public.estates ADD COLUMN estate_account_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estates' AND column_name='estate_bank') THEN
    ALTER TABLE public.estates ADD COLUMN estate_bank TEXT;
  END IF;
END $$;

-- Add columns to profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='first_name') THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='surname') THEN
    ALTER TABLE public.profiles ADD COLUMN surname TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add columns to invoices if missing (need to convert to kobo)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='base_amount_kobo') THEN
    ALTER TABLE public.invoices ADD COLUMN base_amount_kobo INTEGER;
    -- Migrate existing data if amount column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='amount') THEN
      UPDATE public.invoices SET base_amount_kobo = amount * 100 WHERE base_amount_kobo IS NULL;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='service_fee_kobo') THEN
    ALTER TABLE public.invoices ADD COLUMN service_fee_kobo INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='total_amount_kobo') THEN
    ALTER TABLE public.invoices ADD COLUMN total_amount_kobo INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='tenant_id') THEN
    ALTER TABLE public.invoices ADD COLUMN tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='status') THEN
    ALTER TABLE public.invoices ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- ============================================
-- PART 2: Create missing tables
-- ============================================

-- Payments table (NEW)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount_kobo INTEGER NOT NULL,
  service_fee_kobo INTEGER NOT NULL,
  total_amount_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  paystack_reference TEXT UNIQUE,
  paystack_transaction_id TEXT,
  paystack_channel TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'abandoned', 'refunded', 'disputed')),
  verified_by TEXT CHECK (verified_by IN ('webhook', 'manual', 'system')),
  verified_at TIMESTAMPTZ,
  estate_settlement_kobo INTEGER,
  estateflow_share_kobo INTEGER,
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'processing', 'settled', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment events (NEW)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source TEXT CHECK (source IN ('webhook', 'client', 'system', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manual payments (NEW)
CREATE TABLE IF NOT EXISTS public.manual_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  amount_kobo INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance tickets (NEW)
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

-- Maintenance events (NEW)
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

-- QR tokens (NEW)
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

-- Verification challenges (NEW)
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

-- Estate branding (NEW)
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

-- Audit logs (NEW)
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

-- ============================================
-- PART 3: Add indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payments_estate ON public.payments(estate_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(estate_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON public.payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_estate ON public.maintenance_tickets(estate_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reporter ON public.maintenance_tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON public.maintenance_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_qr_token_hash ON public.qr_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_qr_user ON public.qr_tokens(user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_branding_estate ON public.estate_branding(estate_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_estate ON public.audit_logs(estate_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);

-- Enable RLS on new tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estate_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: Add RLS policies to NEW tables
-- ============================================

-- Payments
CREATE POLICY "Tenants view own payments" ON public.payments
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Managers view estate payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = payments.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- Maintenance tickets
CREATE POLICY "Tenants see own tickets" ON public.maintenance_tickets
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Managers see estate tickets" ON public.maintenance_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = maintenance_tickets.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- QR tokens
CREATE POLICY "Users see own QR tokens" ON public.qr_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers see estate QR tokens" ON public.qr_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = qr_tokens.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- Estate branding
CREATE POLICY "Estate members read branding" ON public.estate_branding
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estate_branding.estate_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Managers manage branding" ON public.estate_branding
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = estate_branding.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- Audit logs
CREATE POLICY "Managers see estate audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = audit_logs.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- ============================================
-- PART 5: Functions
-- ============================================

-- Calculate invoice amounts server-side
CREATE OR REPLACE FUNCTION public.calculate_invoice_amounts(
  p_estate_id UUID,
  p_base_amount_kobo INTEGER
)
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

-- Tenant search function (estate from auth)
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
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    COALESCE(p.first_name || ' ' || p.surname, 'Unknown') AS name,
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
      COALESCE(p.first_name, '') ILIKE '%' || p_query || '%'
      OR COALESCE(p.surname, '') ILIKE '%' || p_query || '%'
      OR u.unit_number ILIKE '%' || p_query || '%'
    )
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's estate ID
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
-- PART 6: pg_trgm extension for search
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for tenant search if profiles table has the columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='first_name') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON public.profiles USING GIN (first_name gin_trgm_ops);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='surname') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_surname_trgm ON public.profiles USING GIN (surname gin_trgm_ops);
  END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Compatibility migration completed successfully!';
  RAISE NOTICE 'Tables created/updated: payments, payment_events, manual_payments, maintenance_tickets, maintenance_events, qr_tokens, verification_challenges, estate_branding, audit_logs';
  RAISE NOTICE 'Functions created: calculate_invoice_amounts(), search_tenants(), get_user_estate_id()';
END $$;
