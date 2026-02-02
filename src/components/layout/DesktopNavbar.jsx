import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Wrench, MessageCircle, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const menuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Market', path: '/market', icon: <ShoppingBag size={20} /> },
    { name: 'Services', path: '/services', icon: <Wrench size={20} /> },
    { name: 'Forum', path: '/forum', icon: <MessageCircle size={20} /> },
    { name: 'Social', path: '/connections', icon: <Users size={20} /> },
    { name: 'Chat', path: '/messages', icon: <MessageSquare size={20} />, isMessages: true },
];

const DesktopNavbar = () => {
    const { unreadCount, setIsChatOpen } = useUI();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const [isServicesSheetOpen, setIsServicesSheetOpen] = useState(false);

    return (
        <div className="hidden md:flex fixed top-6 left-0 right-0 justify-center z-50 pointer-events-none">
            <motion.div
                layout
                className="pointer-events-auto bg-black/90 border border-white/10 rounded-full shadow-2xl overflow-hidden"
                initial={false}
                animate={{
                    width: isHovered ? 'auto' : 180,
                    height: 50,
                }}
                style={{ minWidth: 180 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            >
                <div className="flex items-center h-full px-2">
                    {/* Brand / Toggle */}
                    <div className="flex items-center justify-center shrink-0 w-[40px] h-full">
                        <Logo className="w-6 h-6" />
                    </div>

                    <div className="flex items-center overflow-hidden h-full">
                        <AnimatePresence initial={false}>
                            {!isHovered ? (
                                <motion.div
                                    key="label"
                                    initial={{ opacity: 0, x: -20, position: 'absolute' }}
                                    animate={{ opacity: 1, x: 0, position: 'relative' }}
                                    exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                    transition={{ duration: 0.2 }}
                                    className="px-4 whitespace-nowrap"
                                >
                                    <span className="font-bold text-sm text-white font-display tracking-wider">CampusNodes</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.2, delay: 0.05 }}
                                    className="flex items-center gap-1 pr-2"
                                >
                                    {menuItems.map((item) => {
                                        const isActive = location.pathname === item.path;

                                        const ItemContent = () => (
                                            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors group/item">
                                                <div className={`transition-colors ${isActive ? 'text-accent' : 'text-gray-400 group-hover/item:text-white'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-accent' : 'text-gray-300 group-hover/item:text-white'}`}>
                                                    {item.name}
                                                </span>

                                                {item.isMessages && unreadCount > 0 && (
                                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black" />
                                                )}

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
                </div>
            </motion.div>
        </div>
    );
};

export default DesktopNavbar;
