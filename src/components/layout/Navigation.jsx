import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, MessageSquare, Home, X, MessageCircle, ChevronDown } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Magnetic from '../ui/Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Market', path: '/market', icon: <ShoppingBag size={20} /> },
    { name: 'Services', path: '/services', icon: <Wrench size={20} /> },
    { name: 'Forum', path: '/forum', icon: <MessageCircle size={20} /> },
    { name: 'Social', path: '/connections', icon: <Users size={20} /> },
    { name: 'Chat', path: '/messages', icon: <MessageSquare size={20} />, isMessages: true },
];

const Navigation = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount, setIsNavHovered, isNavHovered, setIsChatOpen } = useUI();
    const location = useLocation();
    const navigate = useNavigate();
    const [isServicesSheetOpen, setIsServicesSheetOpen] = useState(false);

    // Simplified Hover Logic (No expensive mouse tracking)
    const [isHovered, setIsHovered] = useState(false);

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
            {/* ==================== DESKTOP TOP BAR (Dynamic Island) ==================== */}
            <div className="hidden md:flex fixed top-6 left-0 right-0 justify-center z-50 pointer-events-none">
                <motion.div
                    layout
                    className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
                    initial={{ width: 140, height: 50, borderRadius: 30 }}
                    animate={{
                        width: isHovered ? 'auto' : 140,
                        height: 50,
                    }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className="flex items-center h-full px-2">
                        {/* Brand / Toggle */}
                        <div className="flex items-center justify-center shrink-0 w-[40px] h-full">
                            <Logo className="w-6 h-6" />
                        </div>

                        <AnimatePresence mode="wait">
                            {!isHovered ? (
                                <motion.div
                                    key="label"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.15 }}
                                    className="pr-4 whitespace-nowrap"
                                >
                                    <span className="font-bold text-sm text-white font-display tracking-wider">CNODES</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="flex items-center gap-1 pr-2"
                                >
                                    {menuItems.map((item) => {
                                        const isActive = location.pathname === item.path;

                                        // Component for the Item Content
                                        const ItemContent = () => (
                                            <div className="relative p-2 rounded-full hover:bg-white/10 transition-colors group/item">
                                                <div className={`transition-colors ${isActive ? 'text-accent' : 'text-gray-400 group-hover/item:text-white'}`}>
                                                    {item.icon}
                                                </div>
                                                {item.isMessages && unreadCount > 0 && (
                                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black" />
                                                )}
                                                {/* Tooltip */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none">
                                                    <div className="bg-black/90 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap border border-white/10">
                                                        {item.name}
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-white/5 rounded-full border border-white/5" />
                                                )}
                                            </div>
                                        );

                                        if (item.isPopup) {
                                            return (
                                                <button key={item.name} onClick={() => setIsServicesSheetOpen(true)}>
                                                    <ItemContent />
                                                </button>
                                            );
                                        }
                                        if (item.isMessages) {
                                            return (
                                                <button key={item.name} onClick={() => setIsChatOpen(true)}>
                                                    <ItemContent />
                                                </button>
                                            );
                                        }
                                        return (
                                            <Link key={item.name} to={item.path}>
                                                <ItemContent />
                                            </Link>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* ==================== DESKTOP PROFILE (Fixed Top Right) ==================== */}
            <div className="hidden md:block fixed top-6 right-6 z-50">
                <button
                    onClick={handleUserClick}
                    className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/10 pl-1 pr-4 py-1 rounded-full hover:bg-black/70 transition-all hover:border-white/30 group"
                >
                    <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/20 relative group-hover:scale-105 transition-transform">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={16} />}
                            </div>
                        )}
                    </div>
                    <div className="text-left">
                        {user ? (
                            <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{user.user_metadata?.first_name}</p>
                        ) : (
                            <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">Sign In</p>
                        )}
                    </div>
                </button>
            </div>


            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 z-[70] safe-area-bottom pb-safe">
                <div className="flex items-center justify-around py-2 px-2">
                    {/* 1. Home */}
                    <Link to="/" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/' ? 'text-accent' : 'text-white/50'}`}>
                        <Home size={22} />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>

                    {/* 2. Campus (was Services) */}
                    <Link to="/services" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/services' ? 'text-accent' : 'text-white/50'}`}>
                        <Wrench size={22} />
                        <span className="text-[10px] font-medium">Campus</span>
                    </Link>

                    {/* 3. Profile (Center) */}
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
                        <span className="text-[10px] font-medium">Chats</span>
                    </Link>

                    {/* 5. Connections */}
                    <Link to="/connections" className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${location.pathname === '/connections' ? 'text-accent' : 'text-white/50'}`}>
                        <Users size={22} />
                        <span className="text-[10px] font-medium">Net</span>
                    </Link>
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

                        {/* Sheet - Adaptive for Desktop/Mobile */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[400px] md:bottom-24 md:rounded-3xl z-[90] bg-[#1a1a1a] border border-white/10 rounded-t-3xl p-6 pb-safe safe-area-bottom shadow-2xl"
                        >
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />

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

export default Navigation;
