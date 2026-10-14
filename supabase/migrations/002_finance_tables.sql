-- ============================================
-- ESTATEFLOW MIGRATION 002: Finance Tables
-- Invoices, Payments, Payment Events
-- All amounts in integer KOBO (Patch §2)
-- ============================================

-- Invoices (estate dues billed to tenants)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  -- Amounts in KOBO (₦15,000 = 1,500,000 kobo)
  base_amount_kobo INTEGER NOT NULL,
  service_fee_kobo INTEGER NOT NULL,
  processing_fee_kobo INTEGER NOT NULL DEFAULT 0,
  total_amount_kobo INTEGER NOT NULL,
  estate_settlement_kobo INTEGER NOT NULL,
  estateflow_share_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  billing_period TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (actual money received)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES public.estates(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Amounts in KOBO
  amount_kobo INTEGER NOT NULL,
  service_fee_kobo INTEGER NOT NULL,
  total_amount_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  -- Paystack details
  paystack_reference TEXT UNIQUE,
  paystack_transaction_id TEXT,
  paystack_channel TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'abandoned', 'refunded', 'disputed')),
  -- Verification
  verified_by TEXT CHECK (verified_by IN ('webhook', 'manual', 'system')),
  verified_at TIMESTAMPTZ,
  -- Settlement
  estate_settlement_kobo INTEGER,
  estateflow_share_kobo INTEGER,
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'processing', 'settled', 'failed')),
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment events (audit trail for payment lifecycle)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source TEXT CHECK (source IN ('webhook', 'client', 'system', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manual payment entries (Opay/Moniepoint fallback — Patch §2)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_estate ON public.invoices(estate_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(estate_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_estate ON public.payments(estate_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(estate_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON public.payment_events(payment_id);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

-- RLS: Tenants see own invoices, managers see estate invoices
CREATE POLICY "Tenants view own invoices" ON public.invoices
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Managers view estate invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = invoices.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- RLS: Same for payments
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

-- Payment events: only managers of the estate can view
CREATE POLICY "Managers view estate payment events" ON public.payment_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      JOIN public.estate_memberships em ON em.estate_id = p.estate_id
      WHERE p.id = payment_events.payment_id
      AND em.user_id = auth.uid()
      AND em.role = 'manager'
      AND em.status = 'active'
    )
  );

-- Manual payments: managers insert, managers approve
CREATE POLICY "Managers manage manual payments" ON public.manual_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estate_memberships
      WHERE estate_id = manual_payments.estate_id
      AND user_id = auth.uid()
      AND role = 'manager'
      AND status = 'active'
    )
  );

-- ============================================
-- FUNCTION: Calculate payment amounts server-side (Patch §2)
-- Called by Edge Function, never trusts client amounts
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_invoice_amounts(
  p_estate_id UUID,
  p_base_amount_kobo INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_service_fee_kobo INTEGER;
  v_total_kobo INTEGER;
BEGIN
  -- Service fee is 10% of base (computed server-side, never from client)
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

-- ============================================
-- ROLLBACK
-- ============================================
-- DROP FUNCTION IF EXISTS public.calculate_invoice_amounts(UUID, INTEGER);
-- DROP TABLE IF EXISTS public.manual_payments;
-- DROP TABLE IF EXISTS public.payment_events;
-- DROP TABLE IF EXISTS public.payments;
-- DROP TABLE IF EXISTS public.invoices;
