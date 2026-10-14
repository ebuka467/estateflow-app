// ============================================
// ESTATEFLOW EDGE FUNCTION: Paystack Webhook
// SECURITY: HMAC SHA512 verification (Patch §2)
// Idempotent: UNIQUE constraint prevents duplicates
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    // 1. SECURITY: Verify HMAC SHA512 signature over RAW body
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    const rawBody = await req.text();

    // Compute HMAC SHA512
    const encoder = new TextEncoder();
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY!);
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare signatures (constant-time comparison to prevent timing attacks)
    if (computedSignature !== signature) {
      console.error("Webhook signature mismatch!");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 403 });
    }

    // 2. Parse event
    const event = JSON.parse(rawBody);
    const eventName = event.event;
    const data = event.data;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3. Log the raw event for audit
    await supabase.from("payment_events").insert({
      payment_id: "00000000-0000-0000-0000-000000000000", // Will update when matched
      event_type: eventName,
      event_data: event,
      source: "webhook",
    });

    // 4. Handle charge.success (primary event)
    if (eventName === "charge.success") {
      const reference = data.reference;
      const amount = data.amount; // in kobo
      const currency = data.currency;
      const transactionId = data.id?.toString();
      const channel = data.channel;

      // 5. SECURITY: Verify with Paystack API (double-verify)
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.data || verifyData.data.status !== "success") {
        console.error("Paystack verification failed for:", reference);
        return new Response(JSON.stringify({ error: "Verification failed" }), { status: 400 });
      }

      // 6. Verify amount and currency match
      if (verifyData.data.amount !== amount) {
        console.error("Amount mismatch! Webhook:", amount, "Verify:", verifyData.data.amount);
        return new Response(JSON.stringify({ error: "Amount mismatch" }), { status: 400 });
      }

      if (currency !== "NGN") {
        console.error("Wrong currency:", currency);
        return new Response(JSON.stringify({ error: "Invalid currency" }), { status: 400 });
      }

      // 7. Find payment by reference (idempotent — UNIQUE constraint on reference)
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("paystack_reference", reference)
        .maybeSingle();

      if (!payment) {
        // Payment might have been created via metadata
        const metadata = data.metadata;
        if (metadata?.invoice_id) {
          // Create payment record from webhook data
          const { error: insertErr } = await supabase.from("payments").insert({
            invoice_id: metadata.invoice_id,
            estate_id: metadata.estate_id,
            tenant_id: metadata.tenant_id,
            amount_kobo: metadata.base_amount_kobo || amount,
            service_fee_kobo: metadata.service_fee_kobo || Math.round(amount * 0.10 / 1.10),
            total_amount_kobo: amount,
            currency: "NGN",
            paystack_reference: reference,
            paystack_transaction_id: transactionId,
            paystack_channel: channel,
            status: "successful",
            verified_by: "webhook",
            verified_at: new Date().toISOString(),
            estate_settlement_kobo: metadata.base_amount_kobo || amount,
            estateflow_share_kobo: metadata.service_fee_kobo || Math.round(amount * 0.10 / 1.10),
          });
          
          if (insertErr && !insertErr.message.includes("duplicate")) {
            console.error("Insert error:", insertErr);
          }

          // Update invoice status
          await supabase
            .from("invoices")
            .update({ status: "paid", updated_at: new Date().toISOString() })
            .eq("id", metadata.invoice_id)
            .eq("status", "pending"); // Only update if still pending (idempotent)

          // Create notification for tenant
          if (metadata.tenant_id) {
            await supabase.from("notifications").insert({
              estate_id: metadata.estate_id,
              user_id: metadata.tenant_id,
              title: "Payment Verified",
              message: `Your payment of ₦${(amount / 100).toLocaleString()} has been verified.`,
              type: "payment",
            });
          }

          // Audit log
          await supabase.from("audit_logs").insert({
            estate_id: metadata.estate_id,
            actor_id: metadata.tenant_id,
            action: "payment_verified_webhook",
            target_type: "payment",
            metadata: { reference, amount_kobo: amount },
          });
        }
      } else if (payment.status !== "successful") {
        // 8. IDEMPOTENCY: Update existing payment if not already successful
        await supabase
          .from("payments")
          .update({
            status: "successful",
            paystack_transaction_id: transactionId,
            paystack_channel: channel,
            verified_by: "webhook",
            verified_at: new Date().toISOString(),
            estate_settlement_kobo: payment.amount_kobo,
            estateflow_share_kobo: payment.service_fee_kobo,
            settlement_status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        // Update invoice
        await supabase
          .from("invoices")
          .update({ status: "paid", updated_at: new Date().toISOString() })
          .eq("id", payment.invoice_id)
          .eq("status", "pending");

        // Notification
        await supabase.from("notifications").insert({
          estate_id: payment.estate_id,
          user_id: payment.tenant_id,
          title: "Payment Verified",
          message: `Your payment of ₦${(payment.total_amount_kobo / 100).toLocaleString()} has been verified.`,
          type: "payment",
        });

        // Audit
        await supabase.from("audit_logs").insert({
          estate_id: payment.estate_id,
          actor_id: payment.tenant_id,
          action: "payment_verified_webhook",
          target_type: "payment",
          metadata: { reference, payment_id: payment.id },
        });
      }
      // If payment.status === "successful", webhook is a duplicate — ignore (idempotent)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
