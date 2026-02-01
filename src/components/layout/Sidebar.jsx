
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, ArrowLeftCircle, ChevronRight, UserCheck, Home, Menu as MenuIcon, X, MessageSquare } from 'lucide-react';
import Logo from '../ui/Logo';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext'; // Import UI
import Magnetic from '../ui/Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const { openAuthModal, toggleChat, isChatOpen, unreadCount } = useUI(); // UI Hook
    const location = useLocation();
    const navigate = useNavigate();
    const [requestCount, setRequestCount] = useState(0);

    // Fetch pending requests count
    React.useEffect(() => {
        if (!user) return;
        const fetchRequests = async () => {
            // ... existing
        };
        // ...
    }, [user]);

    // ...

    return (
        <>
            {/* ... Desktop Sidebar ... */}

            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            <div className="md:hidden fixed bottom-5 left-4 right-4 h-16 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full z-50 flex items-center justify-between px-8 shadow-2xl safe-area-bottom">

                {/* Left: Home */}
                <Link to="/" className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${location.pathname === '/' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                    <Home size={24} />
                </Link>

                {/* Center: Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-12 h-12 bg-white/10 text-white border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative"
                >
                    <MenuIcon size={24} />
                    {requestCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-black z-50">
                            <span className="text-[8px] font-bold text-white">{requestCount}</span>
                        </div>
                    )}
                </button>

                {/* Chat Toggle */}
                <button
                    onClick={toggleChat}
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all relative ${isChatOpen ? 'bg-accent text-black' : 'text-white/60 hover:text-white'}`}
                >
                    <MessageSquare size={24} />
                    {unreadCount > 0 && !isChatOpen && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-black z-50">
                            <span className="text-[8px] font-bold text-white">{unreadCount}</span>
                        </div>
                    )}
                </button>

                {/* Right: User */}
                <button
                    onClick={handleUserClick}
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all overflow-hidden ${location.pathname === '/profile' ? 'bg-white text-black p-1' : 'text-white/60 hover:text-white'}`}
                >
                    {user ? (
                        <div className="w-full h-full rounded-full bg-gray-700 border border-white/20 overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user.user_metadata?.first_name ? user.user_metadata.first_name[0] : 'U'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <User size={24} />
                    )}
                </button>
            </div>

            {/* ==================== MOBILE FULL SCREEN MENU OVERLAY ==================== */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-black flex flex-col p-6 md:hidden"
                    >
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 border border-white/20 rounded-full hover:bg-white/10 text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 items-center justify-center flex-1">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-4xl font-display font-bold text-white hover:text-accent transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-4xl font-display font-bold text-white hover:text-accent transition-colors"
                                >
                                    Profile
                                </Link>
                            )}
                            {!user && (
                                <button
                                    onClick={(e) => {
                                        setIsMobileMenuOpen(false);
                                        openAuthModal();
                                    }}
                                    className="text-2xl font-bold text-gray-400 mt-8"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        <div className="text-center text-gray-600 text-sm mt-8">
                            Campus Nodes &copy; 2026
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
