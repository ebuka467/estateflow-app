import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // SECURITY: Verify webhook signature
    const signature = req.headers.get('x-paystack-signature')
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const rawBody = await req.text()
    
    // Compute HMAC SHA512
    const encoder = new TextEncoder()
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY)
    const bodyData = encoder.encode(rawBody)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyData)
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const computedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Constant-time comparison to prevent timing attacks
    if (computedSignature !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const event = JSON.parse(rawBody)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Handle different event types
    if (event.event === 'charge.success') {
      const { reference, amount, status, metadata } = event.data
      
      // SECURITY: Verify with Paystack API (double-check)
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` }
      })
      const verifyData = await verifyResponse.json()
      
      if (!verifyData.data || verifyData.data.status !== 'success') {
        return new Response(JSON.stringify({ error: 'Verification failed' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // SECURITY: Verify amount matches (in kobo)
      if (verifyData.data.amount !== amount) {
        return new Response(JSON.stringify({ error: 'Amount mismatch' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Extract metadata
      const invoiceId = metadata?.invoice_id
      const estateId = metadata?.estate_id
      const tenantId = metadata?.tenant_id
      const baseAmount = metadata?.base_amount
      const serviceFee = metadata?.service_fee

      if (!invoiceId) {
        return new Response(JSON.stringify({ error: 'No invoice_id in metadata' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // IDEMPOTENCY: Check if already processed
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('paystack_reference', reference)
        .single()

      if (existingPayment) {
        // Already processed - return success (idempotent)
        return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          estate_id: estateId,
          tenant_id: tenantId,
          amount_kobo: baseAmount * 100,
          service_fee_kobo: serviceFee * 100,
          total_amount_kobo: amount,
          currency: 'NGN',
          paystack_reference: reference,
          paystack_transaction_id: verifyData.data.id?.toString(),
          paystack_channel: verifyData.data.channel,
          status: 'successful',
          verified_by: 'webhook',
          verified_at: new Date().toISOString(),
          estate_settlement_kobo: baseAmount * 100,
          estateflow_share_kobo: serviceFee * 100,
          settlement_status: 'pending',
        })

      if (paymentError) {
        console.error('Payment insert error:', paymentError)
        return new Response(JSON.stringify({ error: 'Failed to save payment' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Update invoice status
      await supabase
        .from('invoices')
        .update({ 
          status: 'verified',
          verified_by: 'Paystack Webhook',
          verified_date: new Date().toLocaleDateString(),
          payment_reference: reference
        })
        .eq('id', invoiceId)

      // Create notification for tenant
      if (tenantId) {
        await supabase
          .from('notifications')
          .insert({
            estate_id: estateId,
            user_id: tenantId,
            title: 'Payment Verified',
            message: `Your payment of ${(amount / 100).toLocaleString()} has been verified.`,
            type: 'payment',
            read: false,
          })
      }

      // Audit log
      await supabase
        .from('audit_logs')
        .insert({
          estate_id: estateId,
          actor_id: tenantId,
          action: 'payment_verified_webhook',
          target_type: 'payment',
          metadata: { reference, amount_kobo: amount },
        })

      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle other events (charge.failed, etc.)
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
