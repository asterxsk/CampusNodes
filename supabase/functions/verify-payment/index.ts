// supabase/functions/verify-payment/index.ts
// Verifies Razorpay's HMAC-SHA256 signature to confirm payment authenticity.
// This step is MANDATORY and prevents spoofed payment callbacks.
import { serve }     from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto }    from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

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
    // Reference: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps#15-verify-payment-signature
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

    if (generatedSignature === razorpay_signature) {
      // ✅ Signature matches — payment is authentic
      return new Response(
        JSON.stringify({ success: true, paymentId: razorpay_payment_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
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
  } catch (err) {
    console.error("[verify-payment] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
