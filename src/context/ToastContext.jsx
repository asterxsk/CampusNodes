import React, { useContext, useState, useCallback } from 'react';
import { ToastContext } from './Contexts';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        
        setToasts(prev => {
            // Check for identical recent toast
            const existingIndex = prev.findIndex(t => t.message === message && t.type === type);
            
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    count: (updated[existingIndex].count || 1) + 1,
                    id: id // Reset ID to trigger animation
                };
                return updated;
            }
            
            return [...prev, { id, message, type, count: 1 }];
        });

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

    const contextValue = React.useMemo(() => ({
        addToast, removeToast, success, error, warning, info
    }), [addToast, removeToast, success, error, warning, info]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className="fixed top-4 md:top-auto md:bottom-12 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <Motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="relative group pointer-events-auto"
                        >
                            {/* Visual Stack Effect */}
                            {toast.count > 1 && (
                                <>
                                    <div className="absolute -inset-1 bg-white/5 rounded-full blur-md -z-10 group-hover:bg-white/10 transition-colors" />
                                    <div className="absolute top-1 left-1.5 right-1.5 bottom-[-4px] bg-black/40 border border-white/5 rounded-full -z-10" />
                                    <div className="absolute top-2 left-3 right-3 bottom-[-8px] bg-black/20 border border-white/5 rounded-full -z-20" />
                                </>
                            )}

                            <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border backdrop-blur-md transition-all duration-300
                                ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/5' : ''}
                                ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5' : ''}
                                ${toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-yellow-500/5' : ''}
                                ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/5' : ''}
                            `}>
                                <div className="flex-shrink-0">
                                    {toast.type === 'success' && <Check size={18} className="drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />}
                                    {toast.type === 'error' && <X size={18} className="drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />}
                                    {toast.type === 'warning' && <AlertTriangle size={18} className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
                                    {toast.type === 'info' && <Info size={18} className="drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium tracking-tight whitespace-nowrap">{toast.message}</span>
                                    {toast.count > 1 && (
                                        <Motion.span 
                                            key={toast.count}
                                            initial={{ scale: 1.2, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider tabular-nums"
                                        >
                                            x{toast.count}
                                        </Motion.span>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="ml-1 p-1 hover:bg-white/5 rounded-full transition-colors opacity-50 hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
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
