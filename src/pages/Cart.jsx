import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, Package, Minus, Plus, Loader2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotals, operationLoading, maxQuantity } = useCart();

    const { subtotal, itemCount: totalItems, platformFee, gst, total } = cartTotals();

    const handleCheckout = () => {
        if (cartItems.length > 0) {
            navigate('/checkout');
        }
    };

    const handleQuantityChange = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty <= 0) {
            await removeFromCart(itemId);
        } else {
            await updateQuantity(itemId, newQty);
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
                                disabled={operationLoading}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                                {operationLoading && <Loader2 size={14} className="animate-spin" />}
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
                                            <p className="text-accent font-bold">
                                                {item.price}
                                                {item.quantity > 1 && (
                                                    <span className="text-sm text-gray-400 font-normal ml-2">
                                                        × {item.quantity}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end gap-2 self-center">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                    disabled={operationLoading}
                                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center text-white font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                    disabled={operationLoading || item.quantity >= maxQuantity}
                                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white transition-colors"
                                                    title={item.quantity >= maxQuantity ? `Maximum ${maxQuantity} items` : ''}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            {item.quantity >= maxQuantity && (
                                                <span className="text-xs text-amber-400">Max {maxQuantity}</span>
                                            )}
                                        </div>
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
                                    <span>Subtotal ({totalItems} items)</span>
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
                                disabled={operationLoading}
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
