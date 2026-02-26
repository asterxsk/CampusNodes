import { createContext, useContext } from 'react';

// Auth
export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

// UI
export const UIContext = createContext();
export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

// Cart
export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Modal
export const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

// Toast
export const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
