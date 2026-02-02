import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, User, MessageSquare, LayoutGrid, ShoppingBag, MessageCircle, Wrench, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const MobileNavbar = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount, pendingRequestCount } = useUI();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleUserClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            openAuthModal();
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    // Menu Item Component for the Sheet
    const MenuItem = ({ icon: Icon, label, desc, path, color }) => (
        <button
            onClick={() => handleMenuNavigation(path)}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-20`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                <div className="text-left">
                    <h3 className="text-white font-bold text-lg">{label}</h3>
                    <p className="text-gray-400 text-xs">{desc}</p>
                </div>
            </div>
            <ChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
        </button>
    );

    return (
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
                        className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl z-[90] p-6 pb-24 safe-area-bottom shadow-2xl"
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
                                icon={MessageCircle}
                                label="Forum"
                                desc="Join the campus discussion"
                                path="/forum"
                                color="text-pink-500"
                            />
                            <MenuItem
                                icon={ShoppingBag}
                                label="Marketplace"
                                desc="Buy and sell items"
                                path="/market"
                                color="text-blue-500"
                            />
                            <MenuItem
                                icon={Wrench}
                                label="Services"
                                desc="Find compiled gigs & help"
                                path="/services"
                                color="text-yellow-500"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 z-[100] safe-area-bottom pb-safe backdrop-blur-md">
                <div className="flex items-center justify-around py-2 px-2">
                    {/* 1. Home */}
                    <Link to="/" className={`flex flex-col items-center gap-0.5 transition-all ${location.pathname === '/' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}>
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
                        className="relative -mt-6 flex flex-col items-center"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-black transition-all ${location.pathname === '/profile' ? 'bg-accent text-black scale-105' : 'bg-zinc-800 text-gray-400'}`}>
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                    </button>

                    {/* 4. Chats */}
                    <Link to="/messages" className={`flex flex-col items-center gap-0.5 transition-all relative ${location.pathname === '/messages' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}>
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
                    <Link to="/connections" className={`flex flex-col items-center gap-0.5 transition-all relative ${location.pathname === '/connections' ? 'text-accent' : 'text-gray-500 hover:text-white'}`}>
                        <div className="relative">
                            <Users size={22} strokeWidth={location.pathname === '/connections' ? 2.5 : 2} />
                            {pendingRequestCount > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-black shadow-sm">
                                    <span className="text-[9px] font-bold text-black">{pendingRequestCount > 9 ? '9+' : pendingRequestCount}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px]">Social</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default MobileNavbar;
