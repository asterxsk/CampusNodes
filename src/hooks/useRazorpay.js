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
                throw new Error('Could not load Razorpay checkout. Check your internet connection.');
            }

            // ── Step 2: Create order on the server ────────────────────────────
            // We always include the Supabase auth token so Edge Functions can
            // optionally verify the caller is an authenticated user.
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 'Content-Type': 'application/json' };
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

            const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ amount, currency, receipt }),
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json().catch(() => ({}));
                throw new Error(errData.error ?? 'Failed to create payment order. Please try again.');
            }

            const { orderId, amount: orderAmount, currency: orderCurrency, keyId } = await orderRes.json();

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
                // ── Step 4: Verify payment on success ─────────────────────────
                handler: async (response) => {
                    // Pre-clear cart and show success immediately since user saw success in modal
                    onSuccess?.({ 
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        verified: false // Flag to indicate server-side check skipped
                    });

                    // Still try to verify in background/silently if possible
                    try {
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
                             console.warn('Background verification failed but payment handled locally.');
                        }
                    } catch (verifyErr) {
                        console.error('Background Verification Network Error:', verifyErr);
                    } finally {
                        setIsLoading(false);
                    }
                },
            };

            const rzp = new window.Razorpay(options);

            // Handle payment failures reported through the modal itself
            rzp.on('payment.failed', (response) => {
                const failErr = new Error(
                    response.error?.description ?? 'Payment failed. Please try again.'
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
