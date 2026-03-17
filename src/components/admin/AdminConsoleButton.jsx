import React from 'react';
import { useAdmin } from '../../context/Contexts';
import { Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const AdminConsoleButton = ({ onClick }) => {
    const { isAdmin } = useAdmin();

    return (
        <AnimatePresence>
            {isAdmin && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    onClick={onClick}
                    className="fixed bottom-6 left-6 z-[90] flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-full shadow-lg shadow-red-500/20 border border-red-400/30 transition-colors"
                >
                    <Shield size={20} />
                    <span className="font-bold text-sm tracking-wide">Admin Console</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default AdminConsoleButton;
