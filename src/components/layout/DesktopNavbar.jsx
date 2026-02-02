import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Wrench, MessageCircle, Users, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

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
    const [isServicesSheetOpen, setIsServicesSheetOpen] = useState(false); // Kept for API consistency if needed, though desktop usually doesn't need sheet if all items are visible

    return (
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
                                <span className="font-bold text-sm text-white font-display tracking-wider">CampusNodes</span>
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
                                        // For desktop, usually we navigate or use same sheet. Assuming simple navigation for now or keeping popup if requested.
                                        // User asked for "icons and text under them". I am doing side-by-side for desktop as it fits the "pill" better.
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
    );
};

export default DesktopNavbar;
