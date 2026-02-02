import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, GitCommit } from 'lucide-react';
import pkg from '../../../package.json';

const VersionBanner = () => {
    const [isOpen, setIsOpen] = useState(false);
    const version = pkg.version;
    const location = useLocation();

    // Only show on the home page
    const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';

    if (!isHome) return null;

    return (
        <>
            {/* Floating Version Pill */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed z-40 flex items-center gap-2 px-4 py-2 rounded-full 
                           bg-black/40 backdrop-blur-md border border-white/10 
                           text-white/80 hover:text-white hover:bg-black/60 hover:border-white/20 
                           transition-all shadow-lg
                           top-4 left-4 md:top-auto md:bottom-6 md:left-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <GitCommit size={14} className="text-accent" />
                <span className="font-mono text-xs font-bold tracking-wider">v{version}</span>
                <span className="w-px h-3 bg-white/20 mx-1" />
                <span className="text-[10px] uppercase tracking-widest font-medium opacity-60 group-hover:opacity-100">
                    Release
                </span>
            </motion.button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/90"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-accent/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white leading-none">What's New</h3>
                                        <p className="text-xs text-white/40 mt-1 font-mono">Current Version: v{version}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="relative pl-4 border-l-2 border-accent">
                                        <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-accent ring-4 ring-[#0f0f0f]" />
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">Latest Update</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-mono">v{version}</span>
                                        </div>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            Chat is back in the main menu! We've also fixed the &quot;Clear Chat&quot; button overlap and improved the mobile messaging experience with auto-scroll and better layout.
                                        </p>
                                    </div>

                                    {/* Placeholder for older history to make it look populated */}
                                    <div className="relative pl-4 border-l-2 border-white/10 opacity-50">
                                        <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-white/20 ring-4 ring-[#0f0f0f]" />
                                        <div className="mb-1">
                                            <span className="text-xs font-bold text-white">Previous Releases</span>
                                        </div>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            Includes major UI overhauls, navigation restructuring, and core stability fixes.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-white/30">Build: Validated</span>
                                    <span className="text-[10px] text-accent font-mono tracking-widest">FOE SYSTEM</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VersionBanner;
