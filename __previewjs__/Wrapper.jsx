import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { UIProvider } from '../src/context/UIContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ModalProvider } from '../src/context/ModalContext';
import ErrorBoundary from '../src/components/ErrorBoundary';
import '../src/index.css';

export default function Wrapper({ children }) {
    return (
        <React.StrictMode>
            <ErrorBoundary>
                <AuthProvider>
                    <CartProvider>
                        <UIProvider>
                            <ToastProvider>
                                <ModalProvider>
                                    <Router>
                                        <div className="bg-background min-h-screen text-white font-sans selection:bg-accent selection:text-white relative z-10 w-full h-full p-4 overflow-auto">
                                            {children}
                                        </div>
                                    </Router>
                                </ModalProvider>
                            </ToastProvider>
                        </UIProvider>
                    </CartProvider>
                </AuthProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
