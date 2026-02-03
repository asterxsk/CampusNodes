import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle, ArrowLeft, CreditCard, Shield } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const orderDetails = location.state?.orderDetails;

    // Try to get order from session storage if not in location state
    const storedOrder = orderDetails || JSON.parse(sessionStorage.getItem('pendingOrder') || 'null');

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4">
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Checkout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    {/* Logo */}
                    <Logo className="w-16 h-16 mx-auto mb-8" />

                    {/* Status Icon */}
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                        <CreditCard size={40} className="text-yellow-500" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-display font-bold text-white mb-4">
                        Payment Gateway
                    </h1>
                    <h2 className="text-xl text-yellow-500 font-semibold mb-4">
                        Integration Pending
                    </h2>

                    {/* Description */}
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Razorpay payment gateway integration is coming soon.
                        Once integrated, you'll be able to pay securely using UPI, Cards, Net Banking, and Wallets.
                    </p>

                    {/* Order Summary (if available) */}
                    {storedOrder && (
                        <div className="bg-surface border border-white/10 rounded-xl p-6 mb-8 text-left">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-400" />
                                Order Ready for Payment
                            </h3>

                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between text-gray-400">
                                    <span>Items</span>
                                    <span className="text-white">{storedOrder.items?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{storedOrder.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Platform Fee (5%)</span>
                                    <span className="text-white">₹{storedOrder.platformFee?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>GST (18%)</span>
                                    <span className="text-white">₹{storedOrder.gst?.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-white font-semibold">Total</span>
                                        <span className="text-accent font-bold">₹{storedOrder.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {storedOrder.delivery && (
                                <div className="border-t border-white/10 pt-4 text-sm">
                                    <p className="text-gray-400 mb-1">Delivery to:</p>
                                    <p className="text-white">{storedOrder.delivery.deliveryLocation}</p>
                                    {storedOrder.delivery.landmark && (
                                        <p className="text-gray-500">{storedOrder.delivery.landmark}</p>
                                    )}
                                    <p className="text-gray-400 mt-2">
                                        {storedOrder.delivery.deliveryDate} • {storedOrder.delivery.deliveryTime}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 mb-8">
                        <Shield size={16} />
                        <span className="text-xs">256-bit SSL Encryption</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/market')}
                            variant="primary"
                            className="w-full py-3 bg-white text-black hover:bg-gray-100"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-4 text-center">
                <p className="text-xs text-gray-500">
                    Powered by Campus Nodes • Secure checkout coming soon with Razorpay
                </p>
            </div>
        </div>
    );
};

export default Payment;
