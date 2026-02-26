import React, { useContext, useState, useCallback } from 'react';
import { ToastContext } from './Contexts';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error'), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
    const info = useCallback((message) => addToast(message, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <div className="fixed top-4 md:top-auto md:bottom-12 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-sm
                                ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''}
                                ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : ''}
                                ${toast.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : ''}
                                ${toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : ''}
                            `}
                        >
                            {toast.type === 'success' && <Check size={16} />}
                            {toast.type === 'error' && <X size={16} />}
                            {toast.type === 'warning' && <AlertTriangle size={16} />}
                            {toast.type === 'info' && <Info size={16} />}
                            <span className="text-sm font-medium">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </Motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export default ToastProvider;
