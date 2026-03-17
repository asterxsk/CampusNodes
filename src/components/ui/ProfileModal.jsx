import React, { useState, useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';
import { Edit2, X, LogOut, BookOpen, Lock } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { AnimatePresence, motion } from 'framer-motion';

const ProfileModal = () => {
    const { user, signOut } = useAuth();
    const { isProfileModalOpen, closeProfileModal, openEditProfileModal } = useUI();

    const [showSignOutModal, setShowSignOutModal] = useState(false);

    useEffect(() => {
        if (isProfileModalOpen && user) {
            requestAnimationFrame(() => {
                anime({
                    targets: '.trust-score-counter',
                    innerHTML: [0, 95],
                    round: 1,
                    easing: 'easeInOutExpo',
                    duration: 2000,
                });
                anime({
                    targets: '.trust-ring-path',
                    strokeDashoffset: [283, 283 - (283 * 95) / 100],
                    easing: 'easeInOutExpo',
                    duration: 2500,
                    delay: 500
                });
            });
        }
    }, [isProfileModalOpen, user]);

    if (!isProfileModalOpen || !user) return null;

    const avatarUrl = user.user_metadata?.avatar_url;

    const handleSignOut = () => {
        setShowSignOutModal(true);
    };

    const confirmSignOut = async () => {
        await signOut();
        setShowSignOutModal(false);
        closeProfileModal();
    };

    return (
        <AnimatePresence>
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeProfileModal}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-background border border-white/10 rounded-3xl w-[95vw] md:w-[80vw] max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl"
                    >
                        <button
                            onClick={closeProfileModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-10">
                            <div className="flex flex-col md:flex-row gap-10 items-start mb-10">
                                <div className="relative group w-40 h-40 shrink-0 mx-auto md:mx-0">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
                                        <Avatar
                                            url={avatarUrl}
                                            firstName={user?.user_metadata?.first_name}
                                            size="xl"
                                            className="w-full h-full text-5xl"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 w-full relative">
                                    <div className="text-center md:text-left">
                                        <h2 className="text-4xl font-display font-bold text-white mb-3">
                                            {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                                        </h2>
                                        <p className="text-gray-400 mb-4 text-lg">{user.email}</p>
                                        <p className="text-gray-300 italic mb-8 text-base">
                                            {user.user_metadata?.bio || 'No bio yet.'}
                                        </p>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <button
                                                onClick={openEditProfileModal}
                                                className="px-5 py-2.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 text-white transition-colors"
                                            >
                                                <Edit2 size={16} /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    closeProfileModal();
                                                    setTimeout(() => window.dispatchEvent(new CustomEvent('open-change-password')), 300);
                                                }}
                                                className="px-5 py-2.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 text-white transition-colors"
                                            >
                                                <Lock size={16} /> Change Password
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="px-5 py-2.5 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full flex items-center gap-2 text-red-400 transition-colors"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-5">
                                    <div className="w-20 h-20 relative flex items-center justify-center">
                                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="5" />
                                            <circle className="trust-ring-path" cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="283" strokeDashoffset="283" strokeLinecap="round" />
                                        </svg>
                                        <span className="trust-score-counter text-2xl font-bold text-white">0</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Trust Score</p>
                                        <p className="text-sm text-gray-400">High Reliability</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Major</p>
                                        <p className="text-white">{user.user_metadata?.course || 'Computer Engineering'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showSignOutModal && (
                                <motion.div
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md rounded-3xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center max-w-sm mx-4 shadow-2xl"
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    >
                                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <LogOut size={40} className="text-red-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Sign Out?</h3>
                                        <p className="text-gray-400 mb-8 text-base">Are you sure you want to sign out of your account?</p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setShowSignOutModal(false)}
                                                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmSignOut}
                                                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-red-500/25"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
