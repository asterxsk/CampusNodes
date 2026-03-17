// src/components/ui/PaymentButton.jsx
import { motion as Motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import useRazorpay from '../../hooks/useRazorpay';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

/**
 * PaymentButton
 *
 * A drop-in button that triggers the full Razorpay payment flow.
 * Handles loading state, authentication guard, and toast feedback.
 *
 * @param {number}   amount       - Price in paise (₹1 = 100 paise)
 * @param {string}   productName  - Shown in the Razorpay modal
 * @param {string}   [description]- Optional description shown in modal
 * @param {string}   [receipt]    - Optional unique receipt ID for your records
 * @param {Function} [onSuccess]  - Called with { paymentId } on verified success
 * @param {string}   [className]  - Extra Tailwind classes for the button
 */
const PaymentButton = ({
    amount,
    productName,
    description,
    receipt,
    onSuccess,
    className = '',
}) => {
    const { openCheckout, isLoading } = useRazorpay();
    const { user }                    = useAuth();
    const toast                       = useToast();

    const handleBuy = async () => {
        if (!user) {
            toast.error('Please sign in to make a purchase.');
            return;
        }

        await openCheckout({
            amount,
            currency:    'INR',
            receipt:     receipt ?? `rcpt_${productName?.replace(/\s+/g, '_')}_${Date.now()}`,
            productName,
            description,
            prefill: {
                name:    user.user_metadata?.full_name ?? '',
                email:   user.email ?? '',
                contact: user.user_metadata?.phone ?? '',
            },
            onSuccess: ({ paymentId }) => {
                toast.success(`Payment successful! Ref: ${paymentId.slice(-8)}`);
                onSuccess?.({ paymentId });
            },
            onFailure: (err) => {
                toast.error(err.message ?? 'Payment failed. Please try again.');
            },
        });
    };

    const displayPrice = `₹${(amount / 100).toLocaleString('en-IN')}`;

    return (
        <Motion.button
            onClick={handleBuy}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                bg-blue-600 text-white hover:bg-blue-500
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors shadow-lg shadow-blue-500/20
                ${className}
            `}
        >
            {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ShoppingCart className="w-4 h-4" />
            }
            {isLoading ? 'Processing…' : `Buy ${displayPrice}`}
        </Motion.button>
    );
};

export default PaymentButton;
