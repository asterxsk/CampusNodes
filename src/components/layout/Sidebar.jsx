
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, ChevronRight, MessageSquare, Home, X, MessageCircle } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Magnetic from '../ui/Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { name: 'Market', path: '/market', icon: <ShoppingBag size={20} /> },
    { name: 'Services', path: '/services', icon: <Wrench size={20} /> },
    { name: 'Connections', path: '/connections', icon: <Users size={20} /> },
    { name: 'Chat', path: '/messages', icon: <MessageSquare size={20} />, isMessages: true },
];

const Sidebar = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount, isSidebarCollapsed: isCollapsed, setIsSidebarCollapsed: setIsCollapsed } = useUI();
    const location = useLocation();
    const navigate = useNavigate();
    const [isServicesSheetOpen, setIsServicesSheetOpen] = useState(false);

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
                layout
                initial={false}
                animate={{
                    width: isCollapsed ? '72px' : '260px',
                    height: isCollapsed ? 'auto' : '100vh',
                    top: isCollapsed ? '50%' : '0%',
                    y: isCollapsed ? '-50%' : '0%',
                    left: isCollapsed ? '24px' : '0px',
                    borderRadius: isCollapsed ? '24px' : '0px',
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 1
                }}
                className={`hidden md:flex flex-col fixed z-50 bg-black/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl origin-left ${isCollapsed ? 'items-center' : ''}`}
            >
                {/* Header / Logo */}
                <div className={`flex items-center w-full shrink-0 ${isCollapsed ? 'py-4 justify-center' : 'h-20 px-6'}`}>
                    <Link to="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0 scale-90">
                            <Logo />
                        </div>
                        <AnimatePresence>
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
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation Items */}
                <div className={`flex-1 flex flex-col w-full py-2 ${isCollapsed ? 'px-2 gap-2' : 'gap-0.5'}`}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link to={item.path} key={item.name} className="block w-full">
                                <Magnetic>
                                    <div
                                        className={`flex items-center relative group transition-all duration-300
                                            ${isCollapsed
                                                ? 'justify-center p-3 w-12 h-12 mx-auto rounded-xl'
                                                : 'px-6 py-3.5 gap-4'
                                            }
                                            ${isActive
                                                ? 'bg-accent/10 text-accent border-r-2 border-accent'
                                                : isCollapsed
                                                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        {/* Active Background Glow (Expanded Only) */}
                                        {isActive && !isCollapsed && (
                                            <motion.div
                                                layoutId="activeSidebar"
                                                className="absolute inset-0 bg-accent/10 border-r-2 border-accent"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Active Background Glow (Collapsed Only) */}
                                        {isActive && isCollapsed && (
                                            <motion.div
                                                layoutId="activeSidebarCollapsed"
                                                className="absolute inset-0 bg-accent/15 rounded-xl border border-accent/20"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Icon */}
                                        <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-accent' : 'group-hover:text-white'}`}>
                                            {item.icon}
                                            {/* Unread Badge (Collapsed) */}
                                            {item.isMessages && unreadCount > 0 && isCollapsed && (
                                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border border-black" />
                                            )}
                                        </div>

                                        {/* Text Label & Badge (Expanded) */}
                                        {!isCollapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex-1 flex items-center justify-between z-10 overflow-hidden"
                                            >
                                                <span className="font-semibold whitespace-nowrap text-[15px]">
                                                    {item.name}
                                                </span>
                                                {/* Unread Badge (Expanded) */}
                                                {item.isMessages && unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </Magnetic>
                            </Link>
                        );
                    })}
                </div>

                {/* Toggle Button */}
                <div className={`w-full shrink-0 ${isCollapsed ? 'p-2 py-4 flex justify-center' : 'p-4'}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex items-center transition-all bg-transparent hover:bg-white/5 rounded-xl text-gray-400 hover:text-white
                            ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-4 w-full'}
                        `}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <ChevronRight size={20} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                        </div>
                        {!isCollapsed && (
                            <span className="font-semibold text-[15px]">Minimize</span>
                        )}
                    </button>
                </div>

                {/* User Profile Footer */}
                <div className={`w-full shrink-0 border-t border-white/10 ${isCollapsed ? 'p-2 py-4' : 'p-4'}`}>
                    <button
                        onClick={handleUserClick}
                        className={`flex items-center transition-all hover:bg-white/5 rounded-xl
                            ${isCollapsed ? 'justify-center p-0' : 'p-2 gap-3 w-full'}
                        `}
                    >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/20 shrink-0 relative">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={16} />}
                                </div>
                            )}
                        </div>

                        {/* User Info (Expanded) */}
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-left overflow-hidden flex-1"
                            >
                                {user ? (
                                    <>
                                        <p className="text-sm font-bold text-white truncate">{user.user_metadata?.first_name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </>
                                ) : (
                                    <p className="text-sm font-medium text-gray-400">Sign In</p>
                                )}
                            </motion.div>
                        )}
                    </button>
                </div>
            </motion.div>


            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-[70] safe-area-bottom pb-safe">
                <div className="flex items-center justify-around py-2 px-2">
                    {/* 1. Home */}
                    <Link to="/" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/' ? 'text-accent' : 'text-white/50'}`}>
                        <Home size={22} />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>

                    {/* 2. Services (Popup) */}
                    <button
                        onClick={() => setIsServicesSheetOpen(true)}
                        className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${isServicesSheetOpen ? 'text-accent' : 'text-white/50'}`}
                    >
                        <Wrench size={22} />
                        <span className="text-[10px] font-medium">Services</span>
                    </button>

                    {/* 3. Market */}
                    <Link to="/market" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/market' ? 'text-accent' : 'text-white/50'}`}>
                        <ShoppingBag size={22} />
                        <span className="text-[10px] font-medium">Market</span>
                    </Link>

                    {/* 4. Chat */}
                    <Link to="/messages" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all relative ${location.pathname === '/messages' ? 'text-accent' : 'text-white/50'}`}>
                        <div className="relative">
                            <MessageSquare size={22} />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black">
                                    <span className="text-[8px] font-bold text-white">{unreadCount}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Chat</span>
                    </Link>

                    {/* 5. Profile */}
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
                </div>
            </div>

            {/* ==================== SERVICES SHEET (POPUP) ==================== */}
            <AnimatePresence>
                {isServicesSheetOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsServicesSheetOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 z-[90] bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl p-6 pb-safe safe-area-bottom"
                        >
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                            <h3 className="text-xl font-bold text-white mb-6 text-center font-display">Where to go?</h3>

                            <div className="grid gap-3">
                                {/* Services Button */}
                                <Link
                                    to="/services"
                                    onClick={() => setIsServicesSheetOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Wrench size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-white">Marketplace Services</h4>
                                        <p className="text-sm text-gray-400">Freelancing & Gigs</p>
                                    </div>
                                    <ChevronRight className="text-gray-500" />
                                </Link>

                                {/* Forum Button */}
                                <Link
                                    to="/forum"
                                    onClick={() => setIsServicesSheetOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-white">Community Forum</h4>
                                        <p className="text-sm text-gray-400">Posts & Discussions</p>
                                    </div>
                                    <ChevronRight className="text-gray-500" />
                                </Link>
                            </div>

                            <button
                                onClick={() => setIsServicesSheetOpen(false)}
                                className="mt-6 w-full py-4 text-center text-gray-500 font-medium hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
