import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

const messages = [
    "Finishing the prompt...",
    "Stuck in traffic...",
    "Uploading the assignment...",
    "Wearing ID card...",
    "Taking the fish for a walk...",
    "Mass bunking...",
    "Eating ice cream...",
    "ICA farming..."
];

const Preloader = () => {
    const { active, progress } = useProgress();
    const [loading, setLoading] = useState(true);
    // Shuffle messages on mount
    const [shuffledMessages, setShuffledMessages] = useState([]);
    const [messageIndex, setMessageIndex] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Fisher-Yates shuffle for better randomness
        const shuffled = [...messages];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledMessages(shuffled);
        // Also start at a random index just in case
        setMessageIndex(Math.floor(Math.random() * shuffled.length));
    }, []);

    // Cycle messages every 1.5s
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [loading]);

    // Fail-safe: Force load after 8 seconds if assets get stuck
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("Preloader timed out, forcing display.");
                setFadeOut(true);
                setTimeout(() => setLoading(false), 500);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Effect to watch progress
    useEffect(() => {
        // Minimum load time to read messages
        const minLoadTime = 2500;
        const start = Date.now();

        // If progress is 100 OR we decide to treat it as done
        if ((progress === 100 && !active)) {
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
                {shuffledMessages.length > 0 ? shuffledMessages[messageIndex] : "Loading..."}
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
