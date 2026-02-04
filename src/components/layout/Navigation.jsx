import React, { useState } from 'react';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import { User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount, setIsChatOpen, openProfileModal } = useUI();
    const navigate = useNavigate();
    const [isProfileHovered, setIsProfileHovered] = useState(false);

    const handleUserClick = () => {
        if (user) {
            openProfileModal();
        } else {
            openAuthModal();
        }
    };

    return (
        <>
            <DesktopNavbar />

            {/* Desktop Profile (Fixed Top Right) - Kept separate from the centralized Nav Pill */}
            <div className="hidden md:block fixed top-6 right-6 z-50">
                <div className="flex flex-col items-end gap-2">
                    {/* Profile Button - PFP only, name on hover */}
                    <motion.button
                        layout
                        onClick={handleUserClick}
                        onHoverStart={() => setIsProfileHovered(true)}
                        onHoverEnd={() => setIsProfileHovered(false)}
                        className="flex items-center gap-0 bg-black/90 border border-white/10 p-1 rounded-full relative overflow-hidden group"
                        animate={{
                            backgroundColor: isProfileHovered ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)',
                            borderColor: isProfileHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/20 relative z-10 shrink-0">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={16} />}
                                </div>
                            )}
                        </div>

                        {/* Name appears on hover with smooth spring animation */}
                        <AnimatePresence>
                            {isProfileHovered && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    <div className="pl-3 pr-4">
                                        {user ? (
                                            <p className="text-xs font-bold text-white">{user.user_metadata?.first_name}</p>
                                        ) : (
                                            <p className="text-xs font-bold text-white">Sign In</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            <MobileNavbar />
        </>
    );
};

export default Navigation;
