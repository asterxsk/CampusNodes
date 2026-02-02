import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, Trash2 } from 'lucide-react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState(null);

    const showConfirm = useCallback((options) => {
        return new Promise((resolve) => {
            setModal({
                type: 'confirm',
                title: options.title || 'Confirm',
                message: options.message || 'Are you sure?',
                confirmText: options.confirmText || 'Yes',
                cancelText: options.cancelText || 'Cancel',
                variant: options.variant || 'default', // 'default', 'danger'
                onConfirm: () => {
                    setModal(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModal(null);
                    resolve(false);
                }
            });
        });
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, []);

    return (
        <ModalContext.Provider value={{ showConfirm, closeModal }}>
            {children}

            {/* Modal Container */}
            <AnimatePresence>
                {modal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={modal.onCancel}
                            className="fixed inset-0 bg-black/70 z-[300]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="fixed inset-0 z-[301] flex items-center justify-center p-4"
                        >
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4
                                    ${modal.variant === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-accent/20 text-accent'}
                                `}>
                                    {modal.variant === 'danger' ? <Trash2 size={24} /> : <HelpCircle size={24} />}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white text-center mb-2">{modal.title}</h3>

                                {/* Message */}
                                <p className="text-gray-400 text-sm text-center mb-6">{modal.message}</p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={modal.onCancel}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                                    >
                                        {modal.cancelText}
                                    </button>
                                    <button
                                        onClick={modal.onConfirm}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${modal.variant === 'danger'
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-accent text-black hover:bg-accent/80'}
                                        `}
                                    >
                                        {modal.confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
