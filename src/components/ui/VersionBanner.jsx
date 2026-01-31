import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENT_VERSION = '6.7.9';

const VersionBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check local storage for dismissed version
        const dismissedVersion = localStorage.getItem('dismissed_version');
        if (dismissedVersion !== CURRENT_VERSION) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('dismissed_version', CURRENT_VERSION);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gradient-to-r from-accent/20 to-purple-600/20 border-b border-white/10 backdrop-blur-md z-[100] relative overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-white">
                            <span className="bg-accent text-black font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                New
                            </span>
                            <span className="flex items-center gap-1">
                                <Sparkles size={12} className="text-yellow-400" />
                                Updated to version <span className="font-bold font-mono text-accent">{CURRENT_VERSION}</span>
                            </span>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VersionBanner;
