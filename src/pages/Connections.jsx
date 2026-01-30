import React, { useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import Button from '../components/ui/Button';
import { Shield, Trophy } from 'lucide-react';

const Connections = () => {
    // For now, default to 0 for new users. In future, this comes from user profile.
    const score = 0;

    useEffect(() => {
        // Score counter animation
        anime({
            targets: '.trust-score-counter',
            innerHTML: [0, score],
            round: 1,
            easing: 'easeInOutExpo',
            duration: 2000,
        });

        // Circle progress animation
        const maxDash = 283;
        const dashOffset = maxDash - (maxDash * score) / 100;

        anime({
            targets: '.trust-ring-path',
            strokeDashoffset: [maxDash, dashOffset],
            easing: 'easeInOutExpo',
            duration: 2500,
            delay: 500
        });
    }, [score]);

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left: Trust Score Visualization */}
                <div className="relative">
                    <div className="relative w-80 h-80 mx-auto lg:mx-0 flex items-center justify-center">
                        {/* Outer Ring */}
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="2" />
                            <circle
                                className="trust-ring-path"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeDasharray="283"
                                strokeDashoffset="283"
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Center Content */}
                        <div className="text-center z-10 px-6 flex flex-col items-center justify-center w-full h-full absolute inset-0">
                            <span className="block text-gray-400 text-xs tracking-widest uppercase mb-1">Your Trust Score</span>
                            <span className="trust-score-counter text-7xl font-display font-bold text-white mb-2">0</span>
                            <span className="block text-accent text-[10px] uppercase font-bold tracking-wider max-w-[180px] leading-tight">
                                {score === 0 ? "Complete an order to increase score" : "Excellent"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-accent/20 flex items-center justify-center text-accent rounded-full">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Verified NMIMS Student</h4>
                                <p className="text-gray-400 text-xs">Email Verification Complete</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center text-green-500 rounded-full">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Top Seller Badge</h4>
                                <p className="text-gray-400 text-xs">Based on 15+ successful trades</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
                        Build meaningful <br />
                        <span className="text-gray-500">connections.</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        A community built on trust. Verify your college ID to unlock exclusive trading privileges, mentorship opportunities, and committee events.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Button variant="primary" className="px-8 py-4">
                            Connect ID Card
                        </Button>
                        <Button variant="outline" className="px-8 py-4">
                            Join Community Design
                        </Button>
                    </div>

                    <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-1">2.5k+</h3>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Verified Students</p>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-1">500+</h3>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Daily Trades</p>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-1">50+</h3>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Active Events</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Connections;
