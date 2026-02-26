import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, User, MessageSquare, LayoutGrid, ShoppingBag, MessageCircle, Wrench, X, ChevronRight } from 'lucide-react';
import Avatar from '../ui/Avatar';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

// Menu Item Component for the Sheet
const MenuItem = ({ label, desc, onClick, color, icon: Icon }) => {
    const bgColor = color.replace('text-', 'bg-');
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} bg-opacity-20`}>
                    {Icon ? <Icon size={24} className={color} /> : <div className={`w-6 h-6 rounded-full ${bgColor}`} />}
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold text-lg">{label}</h3>
                    <p className="text-gray-400 text-xs">{desc}</p>
                </div>
            </div>
            <ChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
        </button>
    );
};

const MobileNavbar = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount, pendingRequestCount, openProfileModal } = useUI();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleUserClick = () => {
        if (user) {
            openProfileModal();
        } else {
            openAuthModal();
        }
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    // Use portal to render at body level (fixes fixed positioning with parent transforms)

    // Use portal to render at body level (fixes fixed positioning with parent transforms)
    return createPortal(
        <>
            {/* Dark Overlay for Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
                    />
                )}
            </AnimatePresence>

            {/* Slide-up Menu Sheet */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl md:rounded-3xl z-[99] p-6 pb-[90px] md:pb-24 shadow-2xl"
                        style={{ maxHeight: '70vh' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-white">Campus Hub</h2>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <MenuItem
                                label="Forum"
                                desc="Join the campus discussion"
                                onClick={() => handleMenuNavigation('/forum')}
                                color="text-pink-500"
                                icon={MessageCircle}
                            />
                            <MenuItem
                                label="Marketplace"
                                desc="Buy and sell items"
                                onClick={() => handleMenuNavigation('/market')}
                                color="text-blue-500"
                                icon={ShoppingBag}
                            />
                            <MenuItem
                                label="Services"
                                desc="Find compiled gigs & help"
                                onClick={() => handleMenuNavigation('/services')}
                                color="text-yellow-500"
                                icon={Wrench}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-[100] safe-area-bottom pb-safe transform translate-z-0 will-change-transform">
                <div className="flex items-center justify-around py-2 px-2">
                    {/* 1. Home */}
                    {/* 1. Home */}
                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center gap-0.5 transition-all ${location.pathname === '/' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Home size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                        <span className="text-[10px]">Home</span>
                    </Link>

                    {/* 2. Campus (Menu Trigger) */}
                    <button
                        onClick={toggleMenu}
                        className={`flex flex-col items-center gap-0.5 transition-all ${isMenuOpen ? 'text-accent' : 'text-gray-500 hover:text-white'}`}
                    >
                        <LayoutGrid size={22} strokeWidth={isMenuOpen ? 2.5 : 2} />
                        <span className="text-[10px]">Campus</span>
                    </button>

                    {/* 3. Profile (Center) */}
                    <button
                        onClick={handleUserClick}
                        className="relative -mt-6 flex flex-col items-center z-[105]"
                    >
                        <div className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center aspect-square shrink-0 border-4 border-black transition-all overflow-hidden ${location.pathname === '/profile' ? 'bg-accent text-black scale-105' : 'bg-zinc-800 text-gray-400'}`}>
                            <Avatar
                                url={user?.user_metadata?.avatar_url}
                                firstName={user?.user_metadata?.first_name}
                                size="md"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>

                    {/* 4. Chats */}
                    {/* 4. Chats */}
                    <Link
                        to="/messages"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center gap-0.5 transition-all relative ${location.pathname === '/messages' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}
                    >
                        <div className="relative">
                            <MessageSquare size={22} strokeWidth={location.pathname === '/messages' ? 2.5 : 2} />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black shadow-sm">
                                    <span className="text-[9px] font-bold text-white">{unreadCount}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px]">Chats</span>
                    </Link>

                    {/* 5. Connections */}
                    {/* 5. Connections */}
                    <Link
                        to="/connections"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center gap-0.5 transition-all relative ${location.pathname === '/connections' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}
                    >
                        <div className="relative">
                            <Users size={22} strokeWidth={location.pathname === '/connections' ? 2.5 : 2} />
                            {pendingRequestCount > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center border border-black shadow-sm">
                                    <span className="text-[9px] font-bold text-black">{pendingRequestCount > 9 ? '9+' : pendingRequestCount}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px]">Social</span>
                    </Link>
                </div>
            </div>
        </>,
        document.body
    );
};

export default MobileNavbar;
