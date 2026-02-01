
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const { openAuthModal, toggleChat, isChatOpen, unreadCount, isSidebarCollapsed: isCollapsed, setIsSidebarCollapsed: setIsCollapsed } = useUI();
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
                    width: isCollapsed ? '72px' : '260px',
                    transition: { duration: 0.3, type: "spring", stiffness: 100, damping: 15 }
                }}
                className={`hidden md:flex flex-col fixed left-0 z-50 bg-black/80 backdrop-blur-xl border border-white/10 ${isCollapsed
                    ? 'top-1/2 -translate-y-1/2 left-3 rounded-2xl h-auto'
                    : 'top-0 h-screen border-r rounded-none'}`}
                style={isCollapsed ? { transform: 'translateY(-50%)' } : {}}
            >
                {/* Header / Logo */}
                <div className={`flex items-center justify-center w-full ${isCollapsed ? 'py-3' : 'h-16 px-5 border-b border-white/5'}`}>
                    <Link to="/" className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : 'w-full'}`}>
                        <div className={`shrink-0 ${isCollapsed ? 'scale-65' : 'scale-75'}`}>
                            <Logo />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-display font-bold text-lg text-white whitespace-nowrap"
                            >
                                <span className="text-accent">Campus</span>Nodes
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <div className={`w-full flex flex-col items-center ${isCollapsed ? 'py-2 px-2' : 'flex-1 py-4 px-3 overflow-y-auto custom-scrollbar'}`}>
                    <div className={`space-y-1 ${isCollapsed ? 'w-full' : 'w-full'}`}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link to={item.path} key={item.name} className="block w-full">
                                    <Magnetic>
                                        <div
                                            className={`flex items-center gap-3 py-2.5 rounded-xl transition-all group relative overflow-hidden w-full ${isActive ? 'bg-accent/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'justify-center px-2.5' : 'px-4'}`}
                                        >
                                            <div className={`relative z-10 transition-all ${isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'group-hover:text-white'}`}>
                                                {item.icon}
                                            </div>
                                            {!isCollapsed && (
                                                <span className="font-medium whitespace-nowrap z-10 relative text-sm">
                                                    {item.name}
                                                </span>
                                            )}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-accent/10 rounded-xl border border-accent/20"
                                                />
                                            )}
                                        </div>
                                    </Magnetic>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / User - Only show when expanded */}
                {!isCollapsed && (
                    <div className="p-3 border-t border-white/5 w-full">
                        <button
                            onClick={handleUserClick}
                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-all"
                        >
                            <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/20 shrink-0">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                        {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={16} />}
                                    </div>
                                )}
                            </div>
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
                        </button>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`absolute w-6 h-6 bg-zinc-900 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white shadow-lg z-50 ${isCollapsed ? '-right-3 top-1/2 -translate-y-1/2' : '-right-3 top-1/2 -translate-y-1/2'}`}
                >
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                </button>

                {/* User Avatar when collapsed */}
                {isCollapsed && (
                    <button
                        onClick={handleUserClick}
                        className="p-2 flex justify-center border-t border-white/5"
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={16} />}
                                </div>
                            )}
                        </div>
                    </button>
                )}
            </motion.div>

            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-[70] safe-area-bottom">
                <div className="flex items-center justify-around py-2 px-2">

                    {/* 1. Home */}
                    <Link to="/" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${location.pathname === '/' ? 'text-accent' : 'text-white/50'}`}>
                        <Home size={22} />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>

                    {/* 2. Market */}
                    <Link to="/market" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${location.pathname === '/market' ? 'text-accent' : 'text-white/50'}`}>
                        <ShoppingBag size={22} />
                        <span className="text-[10px] font-medium">Market</span>
                    </Link>

                    {/* 3. Profile (Center) */}
                    <button
                        onClick={handleUserClick}
                        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${location.pathname === '/profile' ? 'text-accent' : 'text-white/50'}`}
                    >
                        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${location.pathname === '/profile' ? 'border-accent' : 'border-white/20'}`}>
                            {user ? (
                                user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">
                                        {user.user_metadata?.first_name ? user.user_metadata.first_name[0] : 'U'}
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    <User size={18} className="text-white/60" />
                                </div>
                            )}
                        </div>
                        {requestCount > 0 && (
                            <div className="absolute top-0 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black z-50">
                                <span className="text-[9px] font-bold text-white">{requestCount}</span>
                            </div>
                        )}
                    </button>

                    {/* 4. Messages (Link to Page) */}
                    <Link to="/messages" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all relative ${location.pathname === '/messages' ? 'text-accent' : 'text-white/50'}`}>
                        <MessageSquare size={22} />
                        <span className="text-[10px] font-medium">Chat</span>
                        {unreadCount > 0 && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black z-50">
                                <span className="text-[9px] font-bold text-white">{unreadCount}</span>
                            </div>
                        )}
                    </Link>

                    {/* 5. Connections */}
                    <Link to="/connections" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${location.pathname === '/connections' ? 'text-accent' : 'text-white/50'}`}>
                        <Users size={22} />
                        <span className="text-[10px] font-medium">Connect</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
