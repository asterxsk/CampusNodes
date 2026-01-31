
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, ArrowLeftCircle, ChevronRight, UserCheck, Home, Menu as MenuIcon, X } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import Magnetic from '../ui/Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Marketplace', path: '/market', icon: <ShoppingBag size={24} /> },
        { name: 'Services', path: '/services', icon: <Wrench size={24} /> },
        { name: 'Connections', path: '/connections', icon: <Users size={24} /> },
        { name: 'Friends', path: '/friends', icon: <UserCheck size={24} /> },
    ];

    const handleProtectedNavigation = (e, path) => {
        if (!user) {
            e.preventDefault();
            navigate('/signup');
            setIsMobileMenuOpen(false);
        } else {
            // Allow default Link behavior
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            {/* ==================== DESKTOP SIDEBAR (Floating) ==================== */}
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 80 : 320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden md:flex fixed top-4 bottom-4 left-4 h-[calc(100vh-2rem)] rounded-2xl bg-black border border-white/10 z-50 flex-col overflow-hidden shadow-2xl"
            >
                {/* Header / Logo */}
                <div className={`flex items-center px-5 relative shrink-0 transition-all duration-300 ${isCollapsed ? 'h-32 flex-col justify-start pt-6 gap-4' : 'h-24 flex-row justify-between'}`}>
                    <Link to="/" className="hover:scale-110 transition-transform flex-shrink-0 z-20">
                        <Logo className="w-10 h-10" />
                    </Link>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`${isCollapsed
                            ? 'relative'
                            : 'absolute right-4 top-1/2 -translate-y-1/2'
                            } flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all z-50`}
                    >
                        {isCollapsed ? (
                            <ChevronRight size={18} />
                        ) : (
                            <ArrowLeftCircle size={18} />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-2 px-3 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Magnetic key={item.name}>
                                <Link
                                    to={item.path}
                                    onClick={(e) => handleProtectedNavigation(e, item.path)}
                                    className={`flex items-center gap-4 p-3 rounded-lg transition-all group overflow-hidden whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="shrink-0 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="font-display font-medium tracking-wide"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </Magnetic>
                        );
                    })}
                </nav>

                {/* User Section (Unprotected / Standard Login) */}
                {user ? (
                    <div className="shrink-0 border-t border-white/10 p-4 overflow-hidden">
                        <Link to="/profile" className="flex items-center gap-4 group relative whitespace-nowrap">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold shrink-0 border border-white/20 group-hover:border-white transition-colors overflow-hidden">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    user.user_metadata?.first_name ? user.user_metadata.first_name[0] : user.email[0].toUpperCase()
                                )}
                            </div>

                            {/* Collapsed Tooltip */}
                            {isCollapsed && (
                                <div className="fixed left-20 bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl z-50">
                                    {user.user_metadata?.first_name || 'My Profile'}
                                </div>
                            )}

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p className="text-sm font-bold text-white truncate max-w-[180px]">
                                            {user.user_metadata?.first_name || 'My Profile'}
                                        </p>
                                        <p className="text-xs text-gray-500">View Profile</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>
                ) : (
                    <div className="shrink-0 p-4 border-t border-white/10 overflow-hidden">
                        <Link to="/login" className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                            <User size={24} className="shrink-0" />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-display"
                                    >
                                        Sign In
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>
                )}
            </motion.div>

            {/* ==================== MOBILE BOTTOM BAR ==================== */}
            <div className="md:hidden fixed bottom-5 left-4 right-4 h-16 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full z-50 flex items-center justify-between px-8 shadow-2xl safe-area-bottom">

                {/* Left: Home */}
                <Link to="/" className="text-white/60 hover:text-white transition-colors">
                    <Home size={24} />
                </Link>

                {/* Center: Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <MenuIcon size={24} />
                </button>

                {/* Right: User */}
                <Link to={user ? "/profile" : "/login"} className="text-white/60 hover:text-white transition-colors overflow-hidden flex items-center justify-center">
                    {user ? (
                        <div className="w-8 h-8 rounded-full bg-gray-700 border border-white/20 overflow-hidden">
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
                </Link>
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
                                    onClick={(e) => handleProtectedNavigation(e, item.path)}
                                    className="text-4xl font-display font-bold text-white hover:text-accent transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {!user && (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-bold text-gray-400 mt-8"
                                >
                                    Sign In
                                </Link>
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
