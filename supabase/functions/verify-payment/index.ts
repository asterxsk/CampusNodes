// supabase/functions/verify-payment/index.ts
// Verifies Razorpay's HMAC-SHA256 signature to confirm payment authenticity.
// This step is MANDATORY and prevents spoofed payment callbacks.
import { serve }     from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto }    from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required payment fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuffer         = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const generatedSignature = encodeHex(new Uint8Array(sigBuffer));

    if (generatedSignature !== razorpay_signature) {
      // ❌ Signature mismatch — payment may be tampered
      console.warn("[verify-payment] Signature mismatch", {
        generated: generatedSignature,
        received:  razorpay_signature,
      });
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ Signature matches — payment is authentic
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find order by razorpay_order_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (orderError || !order) {
      console.error("[verify-payment] Order not found:", razorpay_order_id, orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if payment already recorded (idempotency)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .single();

    if (existingPayment) {
      console.log("[verify-payment] Payment already recorded:", razorpay_payment_id);
      return new Response(
        JSON.stringify({ success: true, paymentId: razorpay_payment_id, orderId: order.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        razorpay_payment_id,
        razorpay_signature,
        status: "captured",
        verification_status: "verified",
        amount: 0, // Will be updated if needed
        verified_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("[verify-payment] Failed to insert payment:", paymentError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to record payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order status to verified
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "verified", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (updateError) {
      console.error("[verify-payment] Failed to update order status:", updateError);
    }

    // Clear user's cart atomically
    const { error: cartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", order.user_id);

    if (cartError) {
      console.error("[verify-payment] Failed to clear cart:", cartError);
      // Don't fail the request if cart clearing fails
    }

    console.log("[verify-payment] Payment verified and order updated:", order.id);

    return new Response(
      JSON.stringify({ success: true, paymentId: razorpay_payment_id, orderId: order.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[verify-payment] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
