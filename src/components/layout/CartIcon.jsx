import React, { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/Contexts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CartIcon = React.memo(() => {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/cart');
    };

    const { totalQuantity, hasItems } = useMemo(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        return {
            totalQuantity: total,
            hasItems: cartItems.length > 0
        };
    }, [cartItems]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
                opacity: hasItems ? 1 : 0,
                scale: hasItems ? 1 : 0.8,
                y: hasItems ? 0 : 20
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 md:bottom-28 right-6 z-[60]"
            style={{ display: hasItems ? 'block' : 'none' }}
        >
            <button
                onClick={handleClick}
                className="relative p-3 bg-white rounded-full text-black hover:bg-gray-100 transition-all duration-300 group shadow-lg"
            >
                <ShoppingCart size={20} />
                <span
                    className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                >
                    {totalQuantity > 9 ? '9+' : totalQuantity}
                </span>
            </button>
        </motion.div>
    );
});

CartIcon.displayName = 'CartIcon';

export default CartIcon;
