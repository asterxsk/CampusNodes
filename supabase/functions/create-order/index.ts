// supabase/functions/create-order/index.ts
// Creates a Razorpay order — must run server-side to keep KEY_SECRET safe.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RAZORPAY_KEY_ID     = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const {
      amount,
      currency = "INR",
      receipt,
      idempotencyKey,
      items,
      deliveryDetails,
      userId
    } = await req.json();

    // Validation
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be a positive number in paise." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!idempotencyKey || !items || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: idempotencyKey, items, userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if order with this idempotency key already exists
    const { data: existingOrder, error: checkError } = await supabase
      .from("orders")
      .select("id, razorpay_order_id, total_amount, currency, status")
      .eq("idempotency_key", idempotencyKey)
      .single();

    // If order exists and is not failed, return it
    if (existingOrder && existingOrder.status !== "failed") {
      console.log("[create-order] Returning existing order:", existingOrder.id);
      return new Response(
        JSON.stringify({
          orderId: existingOrder.razorpay_order_id,
          amount: existingOrder.total_amount,
          currency: existingOrder.currency,
          keyId: RAZORPAY_KEY_ID,
          existingOrderId: existingOrder.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate receipt number if not provided
    const receiptNumber = receipt ?? `RCPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create Razorpay order
    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: receiptNumber,
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

    const razorpayOrder = await response.json();

    // Persist order in database
    const { data: newOrder, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        razorpay_order_id: razorpayOrder.id,
        status: "pending",
        total_amount: amount,
        currency,
        items,
        delivery_details: deliveryDetails,
        receipt_number: receiptNumber,
        idempotency_key: idempotencyKey,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[create-order] Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save order to database" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-order] Created order:", newOrder.id, "Razorpay:", razorpayOrder.id);

    // Return order details to client
    return new Response(
      JSON.stringify({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: RAZORPAY_KEY_ID,
        orderRecordId: newOrder.id,
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
