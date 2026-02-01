import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useUI } from '../../context/UIContext';

const AuthModal = () => {
    const { isAuthModalOpen, closeAuthModal } = useUI();
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        closeAuthModal();
        navigate(path);
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Transparent Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAuthModal}
                        className="absolute inset-0 bg-transparent"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-black border border-white/10 p-8 rounded-2xl w-full max-w-sm shadow-2xl z-10"
                    >
                        <button
                            onClick={closeAuthModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-display font-bold text-white mb-2">Join Campus Nodes</h2>
                            <p className="text-gray-400 text-sm">
                                Connect, trade, and collaborate with your campus community.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => handleNavigate('/signup')}
                                className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:scale-[1.02]"
                            >
                                <UserPlus size={18} />
                                Sign Up
                            </button>

                            <button
                                onClick={() => handleNavigate('/login')}
                                className="w-full py-3 border border-white/10 hover:border-white text-white font-medium uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                            >
                                <LogIn size={18} />
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
