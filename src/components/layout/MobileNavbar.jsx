import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Users, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

const MobileNavbar = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount } = useUI();
    const location = useLocation();
    const navigate = useNavigate();

    const handleUserClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            openAuthModal();
        }
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 z-[70] safe-area-bottom pb-safe">
            <div className="flex items-center justify-around py-2 px-2">
                {/* 1. Home */}
                <Link to="/" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/' ? 'text-accent' : 'text-white/50'}`}>
                    <Home size={22} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                {/* 2. Campus */}
                <Link to="/services" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/services' ? 'text-accent' : 'text-white/50'}`}>
                    <Wrench size={22} />
                    <span className="text-[10px] font-medium">Campus</span>
                </Link>

                {/* 3. Profile */}
                <button
                    onClick={handleUserClick}
                    className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative ${location.pathname === '/profile' ? 'text-accent' : 'text-white/50'}`}
                >
                    <div className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${location.pathname === '/profile' ? 'border-accent scale-110' : 'border-white/20'}`}>
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-white">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Profile</span>
                </button>

                {/* 4. Chats */}
                <Link to="/messages" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all relative ${location.pathname === '/messages' ? 'text-accent' : 'text-white/50'}`}>
                    <div className="relative">
                        <MessageSquare size={22} />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black">
                                <span className="text-[8px] font-bold text-white">{unreadCount}</span>
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Chats</span>
                </Link>

                {/* 5. Net */}
                <Link to="/connections" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/connections' ? 'text-accent' : 'text-white/50'}`}>
                    <Users size={22} />
                    <span className="text-[10px] font-medium">Net</span>
                </Link>
            </div>
        </div>
    );
};

export default MobileNavbar;
