import React, { useContext, useState, useCallback } from 'react';
import { ModalContext } from './Contexts';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';

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
                variant: options.variant || 'default',
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
            <AnimatePresence>
                {modal && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => modal.onCancel()}
                    >
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <div className="flex items-start gap-4">
                                {modal.variant === 'danger' ? (
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-accent/20 rounded-lg">
                                        <HelpCircle className="w-5 h-5 text-accent" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">{modal.title}</h3>
                                    <p className="text-sm text-gray-400">{modal.message}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={modal.onCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    {modal.cancelText}
                                </button>
                                <button
                                    onClick={modal.onConfirm}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        modal.variant === 'danger'
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                            : 'bg-accent text-black hover:bg-accent/90'
                                    }`}
                                >
                                    {modal.confirmText}
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => useContext(ModalContext);
