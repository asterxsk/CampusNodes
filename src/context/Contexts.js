import { createContext, useContext } from 'react';

// Auth
export const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

// Admin
export const AdminContext = createContext();
export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

// Theme
export const ThemeContext = createContext();
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

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
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Modal
export const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

// Toast
export const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);
