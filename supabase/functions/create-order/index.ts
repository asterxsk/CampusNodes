// supabase/functions/create-order/index.ts
// Creates a Razorpay order — must run server-side to keep KEY_SECRET safe.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RAZORPAY_KEY_ID     = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be a positive number in paise." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic auth header: Base64(KEY_ID:KEY_SECRET)
    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,                                      // in paise (₹1 = 100)
        currency,
        receipt: receipt ?? `rcpt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("[create-order] Razorpay API error:", err);
      return new Response(
        JSON.stringify({ error: err.error?.description ?? "Order creation failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await response.json();

    // Only return what the client needs — KEY_SECRET never leaves this function
    return new Response(
      JSON.stringify({
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    RAZORPAY_KEY_ID,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
