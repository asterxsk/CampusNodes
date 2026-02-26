import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/cart');
    };

    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const hasItems = cartItems.length > 0;

    if (!hasItems) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed top-4 right-4 md:top-[4.5rem] md:right-6 z-[60]"
                style={{
                    opacity: 1,
                    animation: 'cartFadeIn 0.3s ease'
                }}
            >
                <button
                    onClick={handleClick}
                    className="relative p-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <ShoppingCart size={20} />
                    <span
                        className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-black shadow-lg"
                    >
                        {totalQuantity > 9 ? '9+' : totalQuantity}
                    </span>
                </button>
            </div>
        </AnimatePresence>
    );
};

export default CartIcon;
