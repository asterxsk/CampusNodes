import React, { useState, useEffect } from 'react';

const messages = [
    "Finishing the prompt...",
    "Stuck in traffic...",
    "Uploading the assignment...",
    "Wearing ID card...",
    "Taking the fish for a walk...",
    "Mass bunking...",
    "Eating ice cream...",
    "ICA farming...",
    "Checking Defalter List...",
    "Avoiding eye contact with faculty...",
    "Avoiding the library...",
    "Connecting to VPN...",
    "Pretending to understand quantum physics...",
    "Attempting Re-Exam... ",
    "Finding an empty class...",
    "Scrolling Reels..."
];

const Preloader = () => {
    const [loading, setLoading] = useState(true);
    const [shuffledMessages, setShuffledMessages] = useState([]);
    const [messageIndex, setMessageIndex] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Fisher-Yates shuffle for better randomness
        const shuffled = [...messages];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledMessages(shuffled);
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

    // Simulated progress bar
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + Math.random() * 15 + 5;
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Show for minimum time then fade out
    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => setLoading(false), 500);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className={`fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-white text-3xl md:text-4xl font-display font-bold mb-4 tracking-widest animate-pulse text-center px-4">
                CAMPUS NODES
            </div>
            <div className="text-zinc-400 font-mono text-xs md:text-sm h-6 text-center px-4">
                {shuffledMessages.length > 0 ? shuffledMessages[messageIndex] : "Loading..."}
            </div>

            {/* Progress Bar */}
            <div className="w-48 md:w-64 h-1 bg-zinc-800 mt-8 rounded-full overflow-hidden">
                <div
                    className="h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
        </div>
    );
};

export default Preloader;
