import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { motion } from 'framer-motion';

const ChatFAB = () => {
    const { setIsChatOpen, unreadCount } = useUI();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsChatOpen(true)}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors relative"
            >
                <MessageSquare size={24} className="text-black" />

                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                    </div>
                )}
            </motion.button>
        </div>
    );
};

export default ChatFAB;
