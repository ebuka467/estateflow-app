// ============================================
// ESTATEFLOW EDGE FUNCTION: Initialize Payment
// SECURITY: Server-side amount calculation (Patch §2)
// NEVER trusts client-provided amounts
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { invoice_id } = body;

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Use service role to fetch invoice (RLS bypassed, server-controlled)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("tenant_id", user.id)  // SECURITY: tenant can only pay own invoice
      .eq("status", "pending")
      .single();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found or not payable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. SECURITY: Re-calculate amounts server-side (never trust client)
    const baseKobo = invoice.base_amount_kobo;
    const serviceFeeKobo = Math.round(baseKobo * 0.10); // 10% service fee
    const totalKobo = baseKobo + serviceFeeKobo;

    // 4. Verify the total matches what's in the invoice
    if (totalKobo !== invoice.total_amount_kobo) {
      console.error("Amount mismatch! Invoice:", invoice.total_amount_kobo, "Calculated:", totalKobo);
      return new Response(JSON.stringify({ error: "Invoice amount verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Get estate Paystack subaccount for split payment
    const { data: estate } = await supabase
      .from("estates")
      .select("id, estate_account_number")
      .eq("id", invoice.estate_id)
      .single();

    // 6. Initialize Paystack transaction
    const reference = `EF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const paystackPayload = {
      email: user.email,
      amount: totalKobo, // Amount in kobo
      reference: reference,
      currency: "NGN",
      metadata: {
        invoice_id: invoice.id,
        estate_id: invoice.estate_id,
        tenant_id: user.id,
        base_amount_kobo: baseKobo,
        service_fee_kobo: serviceFeeKobo,
      },
      // Split payment: estate gets base, EstateFlow gets service fee
      // Note: Configure subaccounts in Paystack dashboard first
    };

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return new Response(JSON.stringify({ error: "Paystack initialization failed", details: paystackData.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Create pending payment record
    await supabase.from("payments").insert({
      invoice_id: invoice.id,
      estate_id: invoice.estate_id,
      tenant_id: user.id,
      amount_kobo: baseKobo,
      service_fee_kobo: serviceFeeKobo,
      total_amount_kobo: totalKobo,
      currency: "NGN",
      paystack_reference: reference,
      status: "pending",
    });

    // 8. Log audit event
    await supabase.from("audit_logs").insert({
      estate_id: invoice.estate_id,
      actor_id: user.id,
      action: "payment_initialized",
      target_type: "payment",
      metadata: { reference, total_kobo: totalKobo },
    });

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference: reference,
        total_amount_kobo: totalKobo,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
