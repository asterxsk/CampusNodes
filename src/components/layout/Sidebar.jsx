
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, ArrowLeftCircle, ChevronRight, UserCheck } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import Magnetic from '../ui/Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Marketplace', path: '/market', icon: <ShoppingBag size={24} /> },
        { name: 'Services', path: '/services', icon: <Wrench size={24} /> },
        { name: 'Connections', path: '/connections', icon: <Users size={24} /> },
        { name: 'Friends', path: '/friends', icon: <UserCheck size={24} /> },
    ];

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-screen bg-black border-r border-white/10 z-50 flex flex-col overflow-hidden"
        >
            {/* Header / Logo */}
            <div className="h-24 flex items-center px-5 relative shrink-0">
                <Link to="/" className="hover:scale-110 transition-transform flex-shrink-0 z-20">
                    <Logo className="w-10 h-10" />
                </Link>

                {/* Toggle Button - always present but moves/fades */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute right-5 text-gray-500 hover:text-white transition-colors z-10"
                >
                    {isCollapsed ? (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 ">
                            {/* Invisible overlay hit area if needed, but chevron is clearer */}
                            <ChevronRight size={24} className="ml-1 opacity-50 hover:opacity-100" />
                        </div>
                    ) : (
                        <ArrowLeftCircle size={24} />
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

            {/* User Section */}
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
    );
};

export default Sidebar;
