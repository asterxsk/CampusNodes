import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import MessagesInterface from './MessagesInterface';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const MessagesModal = () => {
    const { isChatOpen, setIsChatOpen, activeChat } = useUI();
    const { user } = useAuth();
    const { showConfirm } = useModal();
    const messagesInterfaceRef = useRef(null);

    // Compute hasActiveChat directly
    const hasActiveChat = !!activeChat;

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsChatOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setIsChatOpen]);

    const handleClearChat = async () => {
        if (!activeChat || !user) return;

        const confirmed = await showConfirm({
            title: 'Clear Chat History',
            message: 'This will permanently clear all messages in this conversation for BOTH you and the other person. This action cannot be undone.',
            confirmText: 'Clear All',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            // Update messages where current user is the sender
            await supabase
                .from('messages')
                .update({ deleted_by_sender: true, deleted_by_receiver: true })
                .eq('sender_id', user.id)
                .eq('receiver_id', activeChat.id);

            // Update messages where current user is the receiver
            await supabase
                .from('messages')
                .update({ deleted_by_sender: true, deleted_by_receiver: true })
                .eq('sender_id', activeChat.id)
                .eq('receiver_id', user.id);

            // Refresh messages
            window.location.reload();
        } catch (err) {
            console.error("Error clearing chat:", err);
        }
    };

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
                        initial={{ opacity: 0, scale: 0.95, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -100 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className="fixed inset-0 m-auto z-[100] hidden md:flex items-center justify-center pointer-events-none"
                    >
                        {/* Actual Modal Content */}
                        <div className="w-[85vw] h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto relative flex flex-col">

                            {/* Header with Close and Delete Buttons */}
                            <div className="absolute top-0 right-0 z-50 p-4 flex items-center gap-2">
                                {hasActiveChat && (
                                    <button
                                        onClick={handleClearChat}
                                        className="bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-500 p-2 rounded-full transition-all border border-white/5 hover:border-red-500/50"
                                        title="Clear Chat"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="bg-black/50 hover:bg-red-500/20 text-white/50 hover:text-red-500 p-2 rounded-full transition-all border border-white/5 hover:border-red-500/50"
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <MessagesInterface ref={messagesInterfaceRef} onClose={() => setIsChatOpen(false)} isModal={true} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MessagesModal;
