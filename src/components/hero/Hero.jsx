
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Magnetic from '../ui/Magnetic';
import TextType from '../ui/TextType';

const Hero = () => {
    const { user } = useAuth();

    return (
        <section className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-transparent">
            {/* Background Liquid Ether removed - moved to App.jsx for global persistence */}

            {/* Background Abstract Elements */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10 pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 text-center px-4 max-w-5xl mx-auto pointer-events-auto">
                <h1 className="text-6xl md:text-9xl font-bold font-display tracking-tighter text-white mb-6 animate-fade-in">
                    <TextType
                        as="span"
                        text={["CAMPUS NODES", "NOTES", "TEXTBOOKS", "TOOLS", "ELECTRONICS", "ESSENTIAL"]}
                        typingSpeed={100}
                        deletingSpeed={50}
                        pauseDuration={2000}
                        loop={true}
                        cursorCharacter="_"
                        className="whitespace-nowrap"
                    />
                </h1>

                <p className="text-blue-200 text-lg md:text-2xl max-w-2xl mx-auto font-light tracking-wide mb-12 animate-fade-in pointer-events-auto" style={{ animationDelay: '200ms' }}>
                    The decentralized marketplace for everything on campus.
                    <br />
                    Trade gears, find mentors, build your network.
                </p>

                <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fade-in pointer-events-auto" style={{ animationDelay: '400ms' }}>
                    <Magnetic>
                        <Button to={user ? "/market" : "/signup"} variant="primary" className="px-8 py-4 text-sm">
                            {user ? 'Go to Market' : 'Start Trading'} <ArrowRight size={18} className="inline ml-2" />
                        </Button>
                    </Magnetic>

                    <Magnetic>
                        <Button to="/services" variant="outline" className="px-8 py-4 text-sm">
                            Explore Services
                        </Button>
                    </Magnetic>
                </div>
            </div>
        </section>
    );
};

export default Hero;
