// src/hooks/useRazorpay.js
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
    return new Promise((resolve) => {
        // Don't load if already present
        if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT_URL;
        script.onload  = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * useRazorpay
 *
 * Handles the full Razorpay payment lifecycle:
 *   1. Dynamically loads Razorpay checkout.js
 *   2. Creates an order via the Supabase Edge Function (server-side)
 *   3. Opens the Razorpay Checkout modal
 *   4. Verifies the payment signature server-side after success
 *
 * @returns {{ openCheckout, isLoading, error, clearError }}
 */
const useRazorpay = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);

    const clearError = useCallback(() => setError(null), []);

    const openCheckout = useCallback(async (args) => {
        const {
            amount,
            currency = 'INR',
            receipt = `rcpt_${Date.now()}`,
            productName = 'Campus Nodes',
            description = 'Order Purchase',
            idempotencyKey,
            items,
            deliveryDetails,
            userId,
            prefill = {},
            onSuccess,
            onFailure
        } = args;
        setIsLoading(true);
        setError(null);

        try {
            // ── Step 1: Load Razorpay checkout.js script ──────────────────────
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Connection failed. Check internet and retry.');
            }

            // ── Step 2: Create order on the server ────────────────────────────
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 'Content-Type': 'application/json' };
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

            const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    amount,
                    currency,
                    receipt,
                    idempotencyKey,
                    items,
                    deliveryDetails,
                    userId
                }),
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json().catch(() => ({}));
                throw new Error(errData.error ?? 'Connection failed. Check internet and retry.');
            }

            const { orderId, amount: orderAmount, currency: orderCurrency, keyId, orderRecordId } = await orderRes.json();

            // ── Step 3: Open Razorpay Checkout modal ──────────────────────────
            const options = {
                key:         keyId,
                amount:      orderAmount,
                currency:    orderCurrency,
                name:        'Campus Nodes',
                description: description ?? productName ?? 'Purchase',
                image:       '/logo.png',
                order_id:    orderId,
                prefill: {
                    name:    prefill.name    ?? '',
                    email:   prefill.email   ?? '',
                    contact: prefill.contact ?? '',
                },
                notes: { source: 'campus-nodes-web' },
                theme: { color: '#3b82f6' }, // matches project accent color
                modal: {
                    ondismiss: () => {
                        // User closed the modal without paying
                        setIsLoading(false);
                    },
                },

                // ── Step 4: Verify payment on success ─────────────────────────
                handler: async (response) => {
                    try {
                        setIsLoading(true);

                        // BLOCKING verification - wait for server confirmation
                        const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id:   response.razorpay_order_id,
                                razorpay_signature:  response.razorpay_signature,
                            }),
                        });

                        if (!verifyRes.ok) {
                            const errData = await verifyRes.json().catch(() => ({}));
                            const errorMsg = errData.error === 'Invalid signature'
                                ? "Payment couldn't be verified. Contact support."
                                : `Verification failed. Money is safe. Contact support with order ID: ${response.razorpay_order_id}`;
                            throw new Error(errorMsg);
                        }

                        const verifyData = await verifyRes.json();

                        if (!verifyData.success) {
                            throw new Error(`Verification failed. Money is safe. Contact support with order ID: ${response.razorpay_order_id}`);
                        }

                        // Cart is already cleared by server, call success callback
                        onSuccess?.({
                            paymentId: response.razorpay_payment_id,
                            orderId: verifyData.orderId,
                            verified: true
                        });

                    } catch (verifyErr) {
                        console.error('Verification Error:', verifyErr);
                        setError(verifyErr.message);
                        onFailure?.(verifyErr);
                    } finally {
                        setIsLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);

            // Handle payment failures reported through the modal itself
            rzp.on('payment.failed', (response) => {
                const failErr = new Error(
                    response.error?.description ?? `Payment failed. Contact support with order ID: ${orderId}`
                );
                setError(failErr.message);
                setIsLoading(false);
                onFailure?.(failErr);
            });

            rzp.open();

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            onFailure?.(err);
        }
    }, []);

    return { openCheckout, isLoading, error, clearError };
};

export default useRazorpay;
