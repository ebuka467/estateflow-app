import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Get the invoice ID from request
    const { invoice_id } = await req.json()
    
    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'invoice_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch invoice from database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, estates(*)')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Calculate amounts server-side (never trust client)
    const baseAmountKobo = invoice.base_amount * 100 // Convert to kobo
    const serviceFeeKobo = Math.round(baseAmountKobo * 0.10) // 10% service fee
    const totalAmountKobo = baseAmountKobo + serviceFeeKobo

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: invoice.tenant_email || 'tenant@estateflow.com',
        amount: totalAmountKobo, // Amount in kobo
        reference: `EF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          invoice_id: invoice.id,
          estate_id: invoice.estate_id,
          tenant_id: invoice.tenant_id,
          base_amount: invoice.base_amount,
          service_fee: Math.round(invoice.base_amount * 0.10),
          total_amount: invoice.base_amount + Math.round(invoice.base_amount * 0.10),
        },
        // Split payment configuration
        split: {
          type: 'percentage',
          bearer_type: 'account',
          subaccounts: [
            {
              subaccount_code: invoice.estates.paystack_subaccount_code,
              share: 90.91, // Estate gets ~91% (base amount)
            }
          ],
          // EstateFlow keeps the remaining ~9.09% (service fee)
        }
      })
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: 'Paystack initialization failed', details: paystackData.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update invoice with payment reference
    await supabase
      .from('invoices')
      .update({ 
        payment_reference: paystackData.data.reference,
        status: 'pending'
      })
      .eq('id', invoice_id)

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        amount: totalAmountKobo / 100, // Convert back to naira for display
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
