import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

const messages = [
    "Finishing the prompt...",
    "Stuck in traffic...",
    "Uploading the assignment...",
    "Wearing ID card..."
];

const Preloader = () => {
    const { active, progress } = useProgress();
    const [loading, setLoading] = useState(true);
    const [messageIndex, setMessageIndex] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    // Cycle messages every 1.5s
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [loading]);

    // Effect to watch progress
    useEffect(() => {
        // Minimum load time to read messages
        const minLoadTime = 2500;
        const start = Date.now();

        if (progress === 100 && !active) {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, minLoadTime - elapsed);

            const timeout = setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setLoading(false), 500);
            }, remaining);
            return () => clearTimeout(timeout);
        }
    }, [progress, active]);

    if (!loading) return null;

    return (
        <div className={`fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-white text-4xl font-display font-bold mb-4 tracking-widest animate-pulse">
                CAMPUS NODES
            </div>
            <div className="text-zinc-400 font-mono text-sm h-6">
                {messages[messageIndex]}
            </div>

            {/* Optional Progress Bar */}
            <div className="w-64 h-1 bg-zinc-800 mt-8 rounded-full overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Preloader;
