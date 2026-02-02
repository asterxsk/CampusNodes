import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VersionBanner = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Hardcoded patch notes for now
    const patchNotes = [
        { version: "v8.3.1", date: "Feb 2026", changes: ["Redesigned Mobile Bottom Bar", "Forum Comments & PFPs", "Performance Improvements"] },
        { version: "v8.3.0", date: "Feb 2026", changes: ["Added Messages Modal for Desktop", "Dynamic Navigation Bar", "Performance & UI Enhancements"] },
        { version: "v8.2.0", date: "Jan 2026", changes: ["Enhanced Global Chat", "Mobile UI Fixes"] },
    ];

    return (
        <>
            {/* Minimal Version Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed top-20 left-4 md:top-auto md:bottom-4 md:left-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/5 text-gray-500 hover:bg-white hover:text-black transition-all group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-xs font-mono font-bold">v8.3.1</span>
                <span className="w-0 overflow-hidden group-hover:w-auto group-hover:pl-1 transition-all duration-300 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100">
                    Patch Notes
                </span>
            </motion.button>

            {/* Patch Notes Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-16 left-4 w-80 md:w-96 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-xl z-[101] overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <FileText size={16} className="text-accent" /> Patch Notes
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {patchNotes.map((note, index) => (
                                    <div key={index} className="mb-6 last:mb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-accent font-mono font-bold text-sm">{note.version}</span>
                                            <span className="text-gray-600 text-xs">{note.date}</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1">
                                            {note.changes.map((change, i) => (
                                                <li key={i} className="text-gray-400 text-xs leading-relaxed">
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default VersionBanner;
