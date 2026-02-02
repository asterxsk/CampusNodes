import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Wrench, MessageCircle, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';
import { useUI } from '../../context/UIContext';

const menuItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Market', path: '/market', icon: <ShoppingBag size={20} /> },
    { name: 'Services', path: '/services', icon: <Wrench size={20} /> },
    { name: 'Forum', path: '/forum', icon: <MessageCircle size={20} /> },
    { name: 'Social', path: '/connections', icon: <Users size={20} />, isSocial: true },
];

const DesktopNavbar = () => {
    const { unreadCount, pendingRequestCount, setIsChatOpen } = useUI();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const [isServicesSheetOpen, setIsServicesSheetOpen] = useState(false);

    // Total notification count for collapsed state indicator
    const totalNotifications = unreadCount + pendingRequestCount;

    return (
        <div className="hidden md:flex fixed top-6 left-0 right-0 justify-center z-50 pointer-events-none">
            <motion.div
                className="pointer-events-auto bg-black/90 border border-white/10 rounded-full overflow-hidden relative"
                initial={false}
                animate={{
                    width: isHovered ? 520 : 180,
                    height: 50,
                    boxShadow: isHovered
                        ? '0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.05)'
                        : '0 10px 40px rgba(0,0,0,0.5)',
                    borderColor: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
                }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                {/* Notification indicator when collapsed */}
                {!isHovered && totalNotifications > 0 && (
                    <div className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse" />
                )}

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
                                                <div className={`relative transition-colors ${isActive ? 'text-accent' : 'text-gray-400 group-hover/item:text-white'}`}>
                                                    {item.icon}
                                                    {/* Badge for messages */}
                                                    {item.isMessages && unreadCount > 0 && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black">
                                                            <span className="text-[8px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                                        </div>
                                                    )}
                                                    {/* Badge for friend requests */}
                                                    {item.isSocial && pendingRequestCount > 0 && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center border border-black">
                                                            <span className="text-[8px] font-bold text-black">{pendingRequestCount > 9 ? '9+' : pendingRequestCount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-accent' : 'text-gray-300 group-hover/item:text-white'}`}>
                                                    {item.name}
                                                </span>

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
