import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/cart');
    };

    // Only render when there are items in the cart
    return (
        <AnimatePresence>
            {cartItems.length > 0 && (
                <motion.div
                    className="fixed top-4 right-4 md:top-[4.5rem] md:right-6 z-[60]"
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <button
                        onClick={handleClick}
                        className="relative p-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        <ShoppingCart size={20} />
                        <motion.span
                            className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-black shadow-lg"
                            key={cartItems.length}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                            {cartItems.length > 9 ? '9+' : cartItems.length}
                        </motion.span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartIcon;
