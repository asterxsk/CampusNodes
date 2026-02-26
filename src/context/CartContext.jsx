import React, { useContext, useState, useEffect, useCallback } from 'react';
import { CartContext } from './Contexts';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabaseClient';
import { MARKET_ITEMS } from '../data/marketItems';

const MAX_QUANTITY = 99;
const MIN_QUANTITY = 1;

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const toast = useToast();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);

    // Safe toast wrapper
    const safeToast = {
        error: (msg) => toast?.error ? toast.error(msg) : console.error('Toast error:', msg),
        success: (msg) => toast?.success ? toast.success(msg) : console.log('Toast success:', msg)
    };

    // Fetch cart from database when user changes
    useEffect(() => {
        const fetchCart = async () => {
            if (!user) {
                setCartItems([]);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('cart_items')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;
                
                // Fetch product details from static MARKET_ITEMS array
                const cartWithDetails = (data || []).map(item => {
                    const product = MARKET_ITEMS.find(p => p.id === item.product_id);
                    
                    return {
                        id: item.product_id,
                        cartItemId: item.id,
                        quantity: item.quantity,
                        title: product?.title || `Product ${item.product_id}`,
                        price: product?.price || '₹0',
                        image: product?.images?.[0] || null,
                        category: product?.category || 'Other',
                        added_at: item.added_at
                    };
                });
                
                setCartItems(cartWithDetails);
            } catch (err) {
                console.error('Error fetching cart:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();

        // Subscribe to realtime changes
        if (user) {
            const channel = supabase
                .channel(`cart_${user.id}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'cart_items',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    fetchCart();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const addToCart = useCallback(async (item) => {
        if (!user) {
            safeToast.error('Please sign in to add items to cart');
            return false;
        }

        setOperationLoading(true);

        try {
            // Check if item already exists in cart
            const existingItem = cartItems.find(i => i.id === item.id);
            
            if (existingItem) {
                // Check quantity limit
                if (existingItem.quantity >= MAX_QUANTITY) {
                    safeToast.error(`Maximum quantity limit (${MAX_QUANTITY}) reached`);
                    return false;
                }

                const newQuantity = Math.min(existingItem.quantity + 1, MAX_QUANTITY);
                
                // Update quantity
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQuantity })
                    .eq('id', existingItem.cartItemId);

                if (error) throw error;
                
                setCartItems(prev => prev.map(i => 
                    i.id === item.id ? { ...i, quantity: newQuantity } : i
                ));
                
                safeToast.success(`Updated quantity: ${item.title}`);
            } else {
                // Insert new item - only using columns that exist in database
                const { data, error } = await supabase
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: item.id,
                        quantity: 1,
                        added_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;
                
                setCartItems(prev => [...prev, {
                    id: item.id,
                    cartItemId: data.id,
                    quantity: 1,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    category: item.category
                }]);
                
                safeToast.success(`Added to cart: ${item.title}`);
            }
            
            return true;
        } catch (err) {
            console.error('Error adding to cart:', err);
            safeToast.error('Failed to add item to cart. Please try again.');
            return false;
        } finally {
            setOperationLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, cartItems]);

    const removeFromCart = useCallback(async (itemId) => {
        if (!user) return;

        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        setOperationLoading(true);

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', item.cartItemId);

            if (error) throw error;
            
            setCartItems(prev => prev.filter(i => i.id !== itemId));
            toast.success(`Removed from cart: ${item.title}`);
        } catch (err) {
            console.error('Error removing from cart:', err);
            toast.error('Failed to remove item. Please try again.');
        } finally {
            setOperationLoading(false);
        }
    }, [user, cartItems, toast]);

    const updateQuantity = useCallback(async (itemId, newQuantity) => {
        if (!user) return;

        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        // Validate quantity
        if (newQuantity < MIN_QUANTITY) {
            // Remove item if quantity goes below minimum
            return removeFromCart(itemId);
        }

        if (newQuantity > MAX_QUANTITY) {
            toast.error(`Maximum quantity limit is ${MAX_QUANTITY}`);
            return;
        }

        setOperationLoading(true);

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', item.cartItemId);

            if (error) throw error;
            
            setCartItems(prev => prev.map(i => 
                i.id === itemId ? { ...i, quantity: newQuantity } : i
            ));
        } catch (err) {
            console.error('Error updating cart:', err);
            toast.error('Failed to update quantity. Please try again.');
        } finally {
            setOperationLoading(false);
        }
    }, [user, cartItems, toast, removeFromCart]);

    const clearCart = useCallback(async () => {
        if (!user) return;

        setOperationLoading(true);

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            
            setCartItems([]);
            toast.success('Cart cleared successfully');
        } catch (err) {
            console.error('Error clearing cart:', err);
            toast.error('Failed to clear cart. Please try again.');
        } finally {
            setOperationLoading(false);
        }
    }, [user, toast]);

    // Calculate cart totals
    const cartTotals = useCallback(() => {
        const subtotal = cartItems.reduce((sum, item) => {
            const price = typeof item.price === 'string' 
                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                : item.price || 0;
            return sum + (price * item.quantity);
        }, 0);

        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const platformFee = subtotal * 0.05; // 5% platform fee
        const gst = (subtotal + platformFee) * 0.18; // 18% GST
        const total = subtotal + platformFee + gst;

        return {
            subtotal,
            itemCount,
            platformFee,
            gst,
            total
        };
    }, [cartItems]);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            clearCart,
            updateQuantity,
            cartTotals,
            loading,
            operationLoading,
            maxQuantity: MAX_QUANTITY,
            minQuantity: MIN_QUANTITY
        }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
