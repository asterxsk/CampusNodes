import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, clearCart } = useCart();
    console.log('Cart Items Debug:', cartItems); // Debug logging

    // Helper to parse price reliably
    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        if (!price) return 0;
        // Robustly find the first valid number group
        const matches = String(price).match(/[0-9.]+/);
        if (matches) {
            // Remove any extra dots if present (e.g. 1.2.3 -> 1.2) - basic safety
            return parseFloat(matches[0]) || 0;
        }
        return 0;
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price), 0);
    const platformFee = subtotal * 0.05; // 5% Campus Nodes fee
    const gst = (subtotal + platformFee) * 0.18; // 18% GST
    const total = subtotal + platformFee + gst;

    const handleCheckout = () => {
        if (cartItems.length > 0) {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/market')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} /> Back to Market
                    </button>

                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <ShoppingBag size={40} className="text-gray-600" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-white mb-2">Your cart is empty</h1>
                        <p className="text-gray-400 mb-8">Add some items to get started!</p>
                        <Button onClick={() => navigate('/market')} variant="primary">
                            Browse Marketplace
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/market')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Continue Shopping
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-display font-bold text-white">Your Cart</h1>
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-surface border border-white/10 rounded-xl p-4 flex gap-4"
                                    >
                                        {/* Item Image */}
                                        <div className="w-24 h-24 rounded-lg bg-white/5 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={32} className="text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{item.title}</h3>
                                            <p className="text-sm text-gray-400 mb-2">{item.category}</p>
                                            <p className="text-accent font-bold">₹{parsePrice(item.price).toLocaleString()}</p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors self-start"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-display font-bold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Platform Fee
                                        <span className="text-xs text-accent">(5%)</span>
                                    </span>
                                    <span className="text-white">₹{platformFee.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-gray-400">
                                    <span className="flex items-center gap-1">
                                        GST
                                        <span className="text-xs text-gray-500">(18%)</span>
                                    </span>
                                    <span className="text-white">₹{gst.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-white font-semibold">Total</span>
                                        <span className="text-xl font-bold text-accent">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                variant="primary"
                                className="w-full py-3 flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                            </Button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Secure checkout powered by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
