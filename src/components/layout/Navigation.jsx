import React, { useState } from 'react';
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

    // Proximity Effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (window.innerWidth < 768) return; // Disable on mobile

            // Nav is fixed at top center. Approx center coordinates.
            const navX = window.innerWidth / 2;
            const navY = 40; // Approx center of pill

            const dist = Math.hypot(e.clientX - navX, e.clientY - navY);

            // Threshold for proximity (e.g., 250px radius)
            if (dist < 250) {
                setIsNavHovered(true);
            } else {
                setIsNavHovered(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [setIsNavHovered]);

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
            {/* ==================== DESKTOP TOP BAR (Floating Pill) ==================== */}
            <div className="hidden md:flex fixed top-6 left-0 right-0 justify-center z-50 pointer-events-none">
                <motion.div
                    className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-hidden"
                    initial={{ height: 60, padding: "0px 24px" }}
                    animate={{
                        height: isNavHovered ? 80 : 50, // Slightly smaller idle height
                        width: isNavHovered ? 'auto' : 'auto',
                        padding: isNavHovered ? "0px 24px" : "0px 16px"
                    }}
                    onHoverStart={() => setIsNavHovered(true)}
                    onHoverEnd={() => { }} // Let proximity handle closing
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className="flex items-center gap-2 h-full relative">
                        {/* === IDLE STATE (Logo + Text) === */}
                        <AnimatePresence mode="wait">
                            {!isNavHovered && (
                                <motion.div
                                    key="idle-brand"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-3 px-2"
                                >
                                    <div className="scale-75"><Logo className="w-8 h-8" /></div>
                                    <span className="font-bold text-white text-sm font-display tracking-wide">CampusNodes</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* === HOVER STATE (Full Menu) === */}
                        <AnimatePresence mode="wait">
                            {isNavHovered && (
                                <motion.div
                                    key="hover-menu"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: 0.05 }}
                                    className="flex items-center gap-2"
                                >
                                    {/* Logo */}
                                    <Link to="/" className="mr-4 flex items-center gap-2">
                                        <div className="scale-75"><Logo /></div>
                                    </Link>

                                    <div className="h-6 w-[1px] bg-white/10 mx-1" />

                                    {menuItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        // Special handling for Services popup
                                        if (item.isPopup) {
                                            return (
                                                <button
                                                    key={item.name}
                                                    onClick={() => setIsServicesSheetOpen(true)}
                                                    className={`relative group flex flex-col items-center justify-center w-16 h-full transition-colors ${isServicesSheetOpen ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    <div className="relative z-10 p-2">
                                                        {item.icon}
                                                    </div>
                                                    <AnimatePresence>
                                                        {isNavHovered && (
                                                            <motion.span
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="text-[10px] font-medium mt-1 whitespace-nowrap"
                                                            >
                                                                {item.name}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                            );
                                        }



                                        if (item.isMessages) {
                                            return (
                                                <div key={item.name} className="relative group flex flex-col items-center justify-center w-16 h-full">
                                                    <button
                                                        onClick={(e) => {
                                                            if (window.innerWidth >= 768) {
                                                                e.preventDefault();
                                                                setIsChatOpen(true);
                                                            } else {
                                                                navigate(item.path);
                                                            }
                                                        }}
                                                        className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        <div className="relative z-10 p-2">
                                                            {item.icon}
                                                            {unreadCount > 0 && (
                                                                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
                                                            )}
                                                        </div>
                                                        <AnimatePresence>
                                                            {isNavHovered && (
                                                                <motion.span
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="text-[10px] font-medium mt-1 whitespace-nowrap"
                                                                >
                                                                    {item.name}
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                    </button>

                                                    {/* Active Dot */}
                                                    {isActive && !isNavHovered && (
                                                        <motion.div
                                                            layoutId="navDot"
                                                            className="absolute bottom-2 w-1 h-1 bg-accent rounded-full pointer-events-none"
                                                        />
                                                    )}
                                                </div>
        

                                        return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    className={`relative group flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    <div className="relative z-10 p-2">
                                                        {item.icon}
                                                        {item.isMessages && unreadCount > 0 && (
                                                            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
                                                        )}
                                                    </div>
                                                    <AnimatePresence>
                                                        {isNavHovered && (
                                                            <motion.span
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="text-[10px] font-medium mt-1 whitespace-nowrap"
                                                            >
                                                                {item.name}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Active Dot */}
                                                    {isActive && !isNavHovered && (
                                                        <motion.div
                                                            layoutId="navDot"
                                                            className="absolute bottom-2 w-1 h-1 bg-accent rounded-full"
                                                        />
                                                    )}
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
