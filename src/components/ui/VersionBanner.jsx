import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENT_VERSION = '7.7.4';

// Patch Notes Data - Keep updated with latest features!
const PATCH_NOTES = [
    {
        title: "Performance Boost",
        description: "Optimized background animation - smoother, faster, and preloaded during loading screen."
    },
    {
        title: "Monochrome Nodes",
        description: "LED grid now uses clean white/gray aesthetic with faster node transitions."
    },
    {
        title: "Themed Notifications",
        description: "Signup alerts now use styled toast popups matching the app theme."
    },
    {
        title: "Mobile Nav Redesign",
        description: "Profile centered in bottom bar, Connections added, floating home button."
    },
    {
        title: "Pixel LED Background",
        description: "Animated background with glowing LED nodes that light up randomly and connect when close."
    },
    {
        title: "Lighter & Faster",
        description: "Removed heavy 3D rendering. The app now loads faster and uses less resources."
    },
    {
        title: "Mobile Text Fix",
        description: "Loading screen text now wraps properly on smaller screens."
    },
    {
        title: "End-to-End Encrypted Chat",
        description: "Your messages are encrypted client-side. Only you and your friend can read them."
    },
    {
        title: "Storage Optimization",
        description: "Removing a friend clears chat history to save database space."
    },
    {
        title: "Mobile Bottom Bar",
        description: "New 5-icon navigation bar: Services, Market, Home, Chat, and Profile."
    }
];

const VersionBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showPatchNotes, setShowPatchNotes] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';
        if (isHome) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [location]);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: -50, x: "-50%", opacity: 0 }}
                        animate={{ y: 0, x: "-50%", opacity: 1 }}
                        exit={{ y: -50, x: "-50%", opacity: 0 }}
                        // Added 'group' for hover effects on children based on parent hover
                        // Added hover glow effect to the main container
                        className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto min-w-[320px] md:min-w-[500px] z-[40] group"
                    >
                        <div className="relative overflow-hidden rounded-full bg-black/80 backdrop-blur-md border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:border-blue-500/50">
                            <div className="px-4 py-2 flex items-center justify-between gap-4 text-xs md:text-sm">
                                {/* Left Side: Tag & Version Info */}
                                <div className="flex items-center gap-3 text-white shrink-0">
                                    <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                                        New
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-blue-400 animate-pulse" />
                                        <span className="text-gray-200">Updated to</span>
                                        <span className="font-bold font-mono text-blue-400">{CURRENT_VERSION}</span>
                                    </span>
                                </div>

                                {/* Right Side: Buttons Container */}
                                <div className="flex items-center gap-2">
                                    {/* Patch Notes Button */}
                                    <motion.button
                                        onClick={() => setShowPatchNotes(true)}
                                        initial="idle"
                                        whileHover="hover"
                                        animate="idle"
                                        className="relative flex items-center justify-center h-8 rounded-full transition-all duration-300 border border-transparent"
                                    >
                                        <motion.div
                                            variants={{
                                                idle: { width: "auto", paddingLeft: 0, paddingRight: 0, backgroundColor: "rgba(59, 130, 246, 0)" },
                                                hover: isMobile
                                                    ? { width: "auto", paddingLeft: 0, paddingRight: 0, backgroundColor: "rgba(59, 130, 246, 0)" }
                                                    : { width: "auto", paddingLeft: "12px", paddingRight: "12px", backgroundColor: "rgba(37, 99, 235, 1)" }
                                            }}
                                            className="flex items-center gap-2 overflow-hidden h-full rounded-full"
                                        >
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-blue-500/0 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300 group/btn">
                                                <FileText size={14} className="text-blue-400 group-hover/btn:text-white transition-colors" />
                                            </span>
                                            {!isMobile && (
                                                <motion.span
                                                    variants={{
                                                        idle: { width: 0, opacity: 0, display: "none" },
                                                        hover: { width: "auto", opacity: 1, display: "block" }
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                    className="whitespace-nowrap font-medium text-white"
                                                >
                                                    Patch Notes
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    </motion.button>

                                    {/* Dismiss Button */}
                                    <motion.button
                                        onClick={handleDismiss}
                                        initial="idle"
                                        whileHover="hover"
                                        animate="idle"
                                        className="relative flex items-center justify-center h-8 rounded-full transition-all duration-300 border border-transparent"
                                    >
                                        <motion.div
                                            variants={{
                                                idle: { width: "auto", paddingLeft: 0, paddingRight: 0, backgroundColor: "rgba(239, 68, 68, 0)" },
                                                hover: isMobile
                                                    ? { width: "auto", paddingLeft: 0, paddingRight: 0, backgroundColor: "rgba(239, 68, 68, 0)" }
                                                    : { width: "auto", paddingLeft: "12px", paddingRight: "12px", backgroundColor: "rgba(220, 38, 38, 1)" }
                                            }}
                                            className="flex items-center gap-2 overflow-hidden h-full rounded-full"
                                        >
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-red-500/0 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-300 group/btn">
                                                <X size={14} className="text-red-400 group-hover/btn:text-white transition-colors" />
                                            </span>
                                            {!isMobile && (
                                                <motion.span
                                                    variants={{
                                                        idle: { width: 0, opacity: 0, display: "none" },
                                                        hover: { width: "auto", opacity: 1, display: "block" }
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                    className="whitespace-nowrap font-medium text-white"
                                                >
                                                    Close
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Patch Notes Modal */}
            <AnimatePresence>
                {showPatchNotes && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPatchNotes(false)}
                            className="absolute inset-0 bg-black/80"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#0f1115] border border-blue-500/20 w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col max-h-[70vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-transparent flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Sparkles className="text-blue-400" size={20} />
                                        Patch Notes
                                    </h2>
                                    <p className="text-blue-400/60 text-xs font-mono mt-1">Version {CURRENT_VERSION}</p>
                                </div>
                                <button
                                    onClick={() => setShowPatchNotes(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    {PATCH_NOTES.map((note, index) => (
                                        <div key={index} className="group">
                                            <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                <ChevronRight size={14} className="text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                                                {note.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed pl-6">
                                                {note.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0 text-center">
                                <p className="text-xs text-gray-500">Thank you for being part of our beta.</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VersionBanner;
