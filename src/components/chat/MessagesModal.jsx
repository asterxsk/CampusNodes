import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessagesInterface from './MessagesInterface';
import { useUI } from '../../context/UIContext';
import { X } from 'lucide-react';

const MessagesModal = () => {
    const { isChatOpen, setIsChatOpen } = useUI();

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsChatOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setIsChatOpen]);

    return (
        <AnimatePresence>
            {isChatOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsChatOpen(false)}
                        className="fixed inset-0 bg-black/80 z-[90] hidden md:block"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className="fixed inset-0 m-auto z-[100] hidden md:flex items-center justify-center pointer-events-none"
                    >
                        {/* Actual Modal Content */}
                        <div className="w-[85vw] h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto relative flex flex-col">

                            {/* Close Button Header (Optional, mostly handled inside interface but good for consistency) */}
                            <div className="absolute top-0 right-0 z-50 p-4">
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-500 p-2 rounded-full transition-all border border-white/5 hover:border-red-500/50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <MessagesInterface onClose={() => setIsChatOpen(false)} isModal={true} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MessagesModal;
