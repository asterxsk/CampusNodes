import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs/lib/anime.es.js';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

import {
    BookOpen, Printer, Wrench, Camera, Code, Calendar,
    Zap, Star, Sparkles, X, Hexagon, Triangle, ArrowUp, ArrowDown
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const SERVICES_DATA = [
    {
        id: 'tutoring',
        title: 'Peer Tutoring',
        description: 'Ace your mid-terms with help from seniors who topped the class.',
        icon: <BookOpen size={40} />,
        availableCount: 42,
        provider: 'Aarya Nadiger'
    },
    {
        id: 'printing',
        title: 'Print & Bind',
        description: 'Fast, cheap printing delivered to your hostel room. Assignments & theses.',
        icon: <Printer size={40} />,
        availableCount: 8,
        provider: 'Rushi Shah'
    },
    {
        id: 'repair',
        title: 'Tech Repair',
        description: 'Broken laptop screen or phone issues? Student-run reliable fixes.',
        icon: <Wrench size={40} />,
        availableCount: 12,
        provider: 'Meemoh Shukla'
    },
    {
        id: 'coding',
        title: 'Coding Mentorship',
        description: 'Debug help for C++, Python, and Java semester projects.',
        icon: <Code size={40} />,
        availableCount: 25,
        provider: 'Prithish Gurbani'
    },
    {
        id: 'photography',
        title: 'Event Media',
        description: 'Hire photographers and videographers for your club events.',
        icon: <Camera size={40} />,
        availableCount: 5,
        provider: 'Tanish Parekh'
    },
    {
        id: 'events',
        title: 'Committee Events',
        description: 'Find committees recruiting new members or hosting workshops.',
        icon: <Calendar size={40} />,
        availableCount: 7,
        provider: 'Sarvesh Nimbalkar'
    }
];

// Doodle component for hover effect
const ServiceDoodle = ({ icon: IconComponent, size, initialPosition, direction, rotation, delay }) => { // eslint-disable-line no-unused-vars
    const directionStyles = {
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        topLeft: { x: -0.707, y: -0.707 },
        topRight: { x: 0.707, y: -0.707 },
        bottomLeft: { x: -0.707, y: 0.707 },
        bottomRight: { x: 0.707, y: 0.707 },
    };

    const dir = directionStyles[direction] || directionStyles.top;
    const distance = 80;

    return (
        <span
            className="absolute pointer-events-none will-change-transform"
            style={{
                left: initialPosition.x,
                top: initialPosition.y,
            }}
        >
            <span
                className="inline-block service-doodle-item"
                style={{
                    animationDelay: `${delay}ms`,
                }}
                data-direction-x={dir.x}
                data-direction-y={dir.y}
                data-rotation={rotation}
                data-distance={distance}
            >
                <IconComponent
                    size={size}
                    strokeWidth={2}
                    className="text-[#f0fff0]"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        filter: 'drop-shadow(0 0 6px rgba(240,255,240,0.8))'
                    }}
                />
            </span>
        </span>
    );
};

const ServiceCard = ({ service }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [doodles, setDoodles] = useState([]);

    const generateDoodles = useCallback(() => {
        const newDoodles = [
            { icon: Zap, size: 16, pos: { x: '20%', y: '20%' }, dir: 'topLeft', rotation: -45, delay: 0 },
            { icon: Star, size: 14, pos: { x: '80%', y: '25%' }, dir: 'topRight', rotation: 30, delay: 50 },
            { icon: Sparkles, size: 14, pos: { x: '15%', y: '75%' }, dir: 'bottomLeft', rotation: 45, delay: 100 },
            { icon: Hexagon, size: 16, pos: { x: '85%', y: '70%' }, dir: 'bottomRight', rotation: 0, delay: 150 },
            { icon: ArrowUp, size: 14, pos: { x: '50%', y: '15%' }, dir: 'top', rotation: 0, delay: 25 },
            { icon: ArrowDown, size: 14, pos: { x: '50%', y: '85%' }, dir: 'bottom', rotation: 0, delay: 75 },
            { icon: Triangle, size: 12, pos: { x: '75%', y: '50%' }, dir: 'right', rotation: 90, delay: 125 },
            { icon: X, size: 12, pos: { x: '25%', y: '50%' }, dir: 'left', rotation: 0, delay: 175 },
        ];
        setDoodles(newDoodles);
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        generateDoodles();

        // Animate doodles with anime.js
        setTimeout(() => {
            anime({
                targets: '.service-doodle-item',
                translateX: (el) => {
                    const dirX = parseFloat(el.dataset.directionX);
                    const distance = parseFloat(el.dataset.distance);
                    return [0, dirX * distance];
                },
                translateY: (el) => {
                    const dirY = parseFloat(el.dataset.directionY);
                    const distance = parseFloat(el.dataset.distance);
                    return [0, dirY * distance];
                },
                scale: [0.3, 1, 0.3],
                opacity: [0, 1, 0],
                rotate: (el) => {
                    const baseRotation = parseFloat(el.dataset.rotation);
                    return [baseRotation, baseRotation + 45];
                },
                duration: 600,
                delay: anime.stagger(50),
                easing: 'easeOutExpo'
            });
        }, 10);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTimeout(() => setDoodles([]), 300);
    };

    return (
        <Link
            to={`/services/${service.id}`}
            className="service-card group relative p-8 bg-surface border border-white/5 hover:border-white/20 hover:z-[50] transition-all duration-500 min-h-[300px] flex flex-col justify-end block overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Honeydew glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0fff0]/0 to-[#f0fff0]/0 group-hover:from-[#f0fff0]/5 group-hover:to-transparent transition-all duration-700 opacity-0 group-hover:opacity-100 pointer-events-none" />

            {/* Doodles on hover */}
            {isHovered && doodles.length > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
                    {doodles.map((doodle, idx) => (
                        <ServiceDoodle
                            key={idx}
                            icon={doodle.icon}
                            size={doodle.size}
                            initialPosition={doodle.pos}
                            direction={doodle.dir}
                            rotation={doodle.rotation}
                            delay={doodle.delay}
                        />
                    ))}
                </div>
            )}

            <div className="absolute top-8 right-8 text-gray-700 group-hover:text-white transition-colors duration-500">
                {service.icon}
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">
                    {service.title}
                </h3>
                <p className="text-gray-400 max-w-sm mb-6 opacity-80 group-hover:text-white transition-all duration-300">
                    {service.description}
                </p>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-white mb-1 transition-colors duration-300">
                            {service.availableCount} Active Listed
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500">
                            Head: {service.provider}
                        </span>
                    </div>
                    <Button variant="outline" className="px-6 py-2 ml-auto group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300">
                        View
                    </Button>
                </div>
            </div>

            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Link>
    );
};

const Services = () => {
    const { user } = useAuth();
    const { openAuthModal } = useUI();
    const [isLoading, setIsLoading] = useState(true);
    const [dbServices, setDbServices] = useState([]);

    React.useEffect(() => {
        const fetchDbServices = async () => {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Map database fields to frontend fields
                const mappedServices = (data || []).map(service => {
                    // Reconstruct icon
                    let IconComp = BookOpen;
                    if (service.icon_name === 'Printer') IconComp = Printer;
                    if (service.icon_name === 'Wrench') IconComp = Wrench;
                    if (service.icon_name === 'Camera') IconComp = Camera;
                    if (service.icon_name === 'Code') IconComp = Code;
                    if (service.icon_name === 'Calendar') IconComp = Calendar;

                    return {
                        id: service.id,
                        title: service.title,
                        description: service.description,
                        icon: <IconComp size={40} />,
                        availableCount: service.available_count,
                        provider: service.provider,
                        isDbService: true
                    };
                });

                setDbServices(mappedServices);
            } catch (error) {
                console.error("Error fetching admin services:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDbServices();
    }, []);

    const allServices = [...dbServices, ...SERVICES_DATA];

    // Header and CTA slide in naturally with page transition


    React.useEffect(() => {
        if (isLoading) return;

        // Animate cards with stagger
        anime({
            targets: '.service-card-wrapper',
            opacity: [0, 1],
            translateY: [40, 0],
            delay: anime.stagger(100, { start: 400 }),
            duration: 800,
            easing: 'easeOutExpo'
        });

        // Optional CTA animation wait logic if needed

    }, [isLoading]);

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="w-full mx-auto">
                <div className="mb-16">
                    <span className="text-[#f0fff0] text-sm font-bold uppercase tracking-widest mb-2 block">Our Ecosystem</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8">
                        Campus Services
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl font-light">
                        Everything you need to survive and thrive on campus. From academic support to logistical solutions.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={`skeleton-${i}`} className="service-card-wrapper">
                                <div className="service-card p-8 bg-surface border border-white/5 min-h-[300px] flex flex-col justify-end">
                                    <Skeleton className="absolute top-8 right-8 w-10 h-10 rounded-full border-none" />
                                    <div className="relative z-10 w-full">
                                        <Skeleton className="h-8 w-3/4 rounded mb-4 border-none" />
                                        <Skeleton className="h-4 w-full rounded mb-2 border-none" />
                                        <Skeleton className="h-4 w-5/6 rounded mb-6 border-none" />
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col flex-1">
                                                <Skeleton className="h-3 w-24 rounded mb-1 border-none" />
                                                <Skeleton className="h-2 w-32 rounded border-none" />
                                            </div>
                                            <Skeleton className="h-10 w-24 rounded-full ml-auto border-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        allServices.map((service) => (
                            <div
                                key={service.id}
                                className="service-card-wrapper opacity-0"
                            >
                                <ServiceCard service={service} />
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-20 p-12 bg-zinc-900 border border-white/5 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f0fff0]/5 via-transparent to-[#f0fff0]/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />
                    <h2 className="text-3xl font-display font-bold text-white mb-6">Need a custom service?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Post a request for tasks, tutoring, or help. The community is here to support you.
                    </p>
                    <Button
                        variant="primary"
                        className="px-8 py-3 hover:bg-[#f0fff0] hover:text-black transition-all duration-300"
                        onClick={() => !user ? openAuthModal() : null}
                    >
                        Post Request
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Services;
