// supabase/functions/razorpay-webhook/index.ts
// Handles Razorpay webhook events for payment.captured and payment.failed.
// Verifies webhook signature using HMAC-SHA256 to prevent spoofed callbacks.
import { serve }     from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto }    from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    // Razorpay webhooks don't use CORS, but we handle OPTIONS just in case
    if (req.method === "OPTIONS") {
      return new Response("ok", { status: 200 });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get webhook signature from headers
    const receivedSignature = req.headers.get("x-razorpay-signature");
    if (!receivedSignature) {
      console.error("[razorpay-webhook] Missing signature header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature using HMAC-SHA256
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(RAZORPAY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(rawBody)
    );
    const generatedSignature = encodeHex(new Uint8Array(sigBuffer));

    if (generatedSignature !== receivedSignature) {
      console.warn("[razorpay-webhook] Signature mismatch", {
        generated: generatedSignature,
        received: receivedSignature,
      });
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const { event, payload: eventPayload } = payload;

    console.log("[razorpay-webhook] Received event:", event);

    // Handle only payment events
    if (event !== "payment.captured" && event !== "payment.failed") {
      console.log("[razorpay-webhook] Ignoring event:", event);
      return new Response(
        JSON.stringify({ status: "ignored", event }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract payment details
    const paymentEntity = eventPayload.payment?.entity || eventPayload.payment;
    if (!paymentEntity) {
      console.error("[razorpay-webhook] Missing payment entity in payload");
      return new Response(
        JSON.stringify({ error: "Invalid payload structure" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount,
      status: payment_status,
      method,
      error_code,
      error_description,
    } = paymentEntity;

    if (!razorpay_payment_id || !razorpay_order_id) {
      console.error("[razorpay-webhook] Missing payment_id or order_id");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find order by razorpay_order_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, total_amount")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (orderError || !order) {
      console.error("[razorpay-webhook] Order not found:", razorpay_order_id, orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if payment already recorded (idempotency)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .single();

    if (existingPayment) {
      console.log("[razorpay-webhook] Payment already recorded:", razorpay_payment_id);
      return new Response(
        JSON.stringify({
          status: "already_processed",
          paymentId: existingPayment.id
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine payment status and order status based on event
    const isSuccess = event === "payment.captured";
    const newOrderStatus = isSuccess ? "verified" : "failed";
    const verificationStatus = isSuccess ? "verified" : "failed";

    // Insert payment record with webhook data
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        razorpay_payment_id,
        razorpay_signature: null, // Webhooks don't include signature
        status: payment_status,
        verification_status: verificationStatus,
        amount: amount || order.total_amount,
        method,
        webhook_received: true,
        webhook_data: paymentEntity, // Store full webhook payload in JSONB
        error_code,
        error_description,
        verified_at: isSuccess ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (paymentError) {
      console.error("[razorpay-webhook] Failed to insert payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to record payment" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[razorpay-webhook] Payment recorded:", newPayment.id);

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("[razorpay-webhook] Failed to update order status:", updateError);
      // Don't fail the webhook - payment is recorded
    }

    // Clear user's cart if payment captured
    if (isSuccess) {
      const { error: cartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", order.user_id);

      if (cartError) {
        console.error("[razorpay-webhook] Failed to clear cart:", cartError);
        // Don't fail the webhook - this is a non-critical operation
      } else {
        console.log("[razorpay-webhook] Cart cleared for user:", order.user_id);
      }
    }

    console.log("[razorpay-webhook] Successfully processed:", event, "for order:", order.id);

    return new Response(
      JSON.stringify({
        status: "success",
        event,
        paymentId: newPayment.id,
        orderId: order.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[razorpay-webhook] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
