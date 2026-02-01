
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, ArrowLeftCircle, ChevronRight, UserCheck, Home, Menu as MenuIcon, X, MessageSquare } from 'lucide-react';
import Logo from '../ui/Logo';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext'; // Import UI
import Magnetic from '../ui/Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Market', path: '/market', icon: <ShoppingBag size={20} /> },
    { name: 'Services', path: '/services', icon: <Wrench size={20} /> },
    { name: 'Connect', path: '/connections', icon: <Users size={20} /> },
];

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

    // Navigation handler for User icon
    const handleUserClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            openAuthModal();
        }
    };

    return (
        <>
            {/* ==================== DESKTOP SIDEBAR ==================== */}
            <motion.div
                initial={false}
                animate={{
                    width: isCollapsed ? '80px' : '280px',
                    transition: { duration: 0.3, type: "spring", stiffness: 100, damping: 15 }
                }}
                className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-50 bg-black/60 backdrop-blur-xl border-r border-white/10 ${isCollapsed ? 'items-center' : ''}`}
            >
                {/* Header / Logo */}
                <div className="h-20 flex items-center justify-center relative w-full border-b border-white/5">
                    <Link to="/" className="flex items-center gap-3 overflow-hidden px-4">
                        <div className="shrink-0 scale-75">
                            <Logo />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-display font-bold text-xl text-white whitespace-nowrap"
                            >
                                <span className="text-accent">Campus</span>Nodes
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-8 w-full overflow-y-auto custom-scrollbar">
                    <div className="space-y-2 px-3">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link to={item.path} key={item.name}>
                                    <Magnetic>
                                        <div
                                            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                } ${isCollapsed ? 'justify-center' : ''}`}
                                        >
                                            <div className={`relative z-10 ${isActive ? 'text-accent' : ''}`}>
                                                {item.icon}
                                            </div>
                                            {!isCollapsed && (
                                                <span className="font-medium whitespace-nowrap z-10 relative">
                                                    {item.name}
                                                </span>
                                            )}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                                                />
                                            )}
                                        </div>
                                    </Magnetic>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / User */}
                <div className="p-4 border-t border-white/5 w-full bg-black/20">
                    <button
                        onClick={handleUserClick}
                        className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-all ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/20 shrink-0">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={18} />}
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="text-left overflow-hidden">
                                {user ? (
                                    <>
                                        <p className="text-sm font-bold text-white truncate">{user.user_metadata?.first_name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </>
                                ) : (
                                    <p className="text-sm font-medium text-gray-400">Sign In</p>
                                )}
                            </div>
                        )}
                    </button>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white shadow-lg z-50"
                    >
                        <ChevronRight size={14} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                </div>
            </motion.div>

            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            <div className="md:hidden fixed bottom-5 left-4 right-4 h-16 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full z-50 flex items-center justify-between px-6 shadow-2xl safe-area-bottom">

                {/* 1. Services */}
                <Link to="/services" className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${location.pathname === '/services' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                    <Wrench size={20} />
                </Link>

                {/* 2. Market */}
                <Link to="/market" className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${location.pathname === '/market' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                    <ShoppingBag size={20} />
                </Link>

                {/* 3. Home (Center) */}
                <Link to="/" className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${location.pathname === '/' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                    <Home size={24} />
                </Link>

                {/* 4. Chat Toggle */}
                <button
                    onClick={toggleChat}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all relative ${isChatOpen ? 'bg-accent text-black' : 'text-white/60 hover:text-white'}`}
                >
                    <MessageSquare size={20} />
                    {unreadCount > 0 && !isChatOpen && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-black z-50">
                            <span className="text-[8px] font-bold text-white">{unreadCount}</span>
                        </div>
                    )}
                </button>

                {/* 5. User Profile */}
                <button
                    onClick={handleUserClick}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all overflow-hidden relative ${location.pathname === '/profile' ? 'bg-white text-black p-0.5' : 'text-white/60 hover:text-white'}`}
                >
                    {user ? (
                        <div className="w-full h-full rounded-full bg-gray-700 border border-white/20 overflow-hidden relative">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user.user_metadata?.first_name ? user.user_metadata.first_name[0] : 'U'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <User size={20} />
                    )}
                    {/* Show request count on profile since Menu is gone */}
                    {requestCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-black z-50">
                            <span className="text-[8px] font-bold text-white">{requestCount}</span>
                        </div>
                    )}
                </button>
            </div>
        </>
    );
};

export default Sidebar;
