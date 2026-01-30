import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartIcon = () => {
    const { cartItems } = useCart();

    return (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
            <button className="relative p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300 group">
                <ShoppingCart size={24} />
                {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black shadow-lg">
                        {cartItems.length}
                    </span>
                )}
            </button>
        </div>
    );
};

export default CartIcon;
