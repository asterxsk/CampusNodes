import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// Toast types: success, error, warning, info
const icons = {
    success: <Check size={18} />,
    error: <X size={18} />,
    warning: <AlertCircle size={18} />,
    info: <Info size={18} />
};

const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    info: 'bg-accent/20 border-accent/50 text-accent'
};

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[10001] px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${colors[type]}`}
        >
            <div className="shrink-0">{icons[type]}</div>
            <span className="text-sm font-medium text-white">{message}</span>
            <button
                onClick={onClose}
                className="shrink-0 ml-2 text-white/50 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

// Toast Container - manages multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <AnimatePresence>
            {toasts.map((toast, index) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                    duration={toast.duration}
                />
            ))}
        </AnimatePresence>
    );
};

// Hook to use toasts
let toastId = 0;
let globalToasts = [];
let globalSetToasts = null;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        globalSetToasts = setToasts;
        return () => { globalSetToasts = null; };
    }, []);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, addToast, removeToast };
};

// Global toast function for use anywhere
export const showToast = (message, type = 'info', duration = 4000) => {
    if (globalSetToasts) {
        const id = ++toastId;
        globalSetToasts(prev => [...prev, { id, message, type, duration }]);
    }
};

export default Toast;
