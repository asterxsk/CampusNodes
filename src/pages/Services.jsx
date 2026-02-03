import React, { useEffect } from 'react';
import Button from '../components/ui/Button';

import { BookOpen, Box, Calendar, PenTool, Search, Printer, Wrench, Camera, Code } from 'lucide-react';

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

const ServiceCard = ({ service, index }) => {
    return (
        <div className="service-card group relative p-8 bg-surface border border-white/5 hover:border-white/20 hover:z-[50] transition-all duration-500 min-h-[300px] flex flex-col justify-end">
            <div className="absolute top-8 right-8 text-gray-700 group-hover:text-accent transition-colors duration-500">
                {service.icon}
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">
                    {service.title}
                </h3>
                <p className="text-gray-400 max-w-sm mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                    {service.description}
                </p>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                            {service.availableCount} Active Listed
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500">
                            Head: {service.provider}
                        </span>
                    </div>
                    <Button variant="outline" className="px-6 py-2 ml-auto">
                        View
                    </Button>
                </div>
            </div>

            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
};

const Services = () => {
    return (
        <div className="min-h-screen bg-background pt-4 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="w-full mx-auto">
                <div className="mb-16 animate-fade-in">
                    <span className="text-accent text-sm font-bold uppercase tracking-widest mb-2 block">Our Ecosystem</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8">
                        Campus Services
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl font-light">
                        Everything you need to survive and thrive on campus. From academic support to logistical solutions.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {SERVICES_DATA.map((service, index) => (
                        <div
                            key={service.id}
                            style={{ animationDelay: `${index * 150}ms` }}
                            className="opacity-0 animate-fade-in fill-mode-forwards"
                        >
                            <ServiceCard service={service} index={index} />
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-12 bg-zinc-900 border border-white/5 relative overflow-hidden text-center opacity-0 animate-fade-in fill-mode-forwards" style={{ animationDelay: '600ms' }}>
                    <h2 className="text-3xl font-display font-bold text-white mb-6">Need a custom service?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Post a request for tasks, tutoring, or help. The community is here to support you.
                    </p>
                    <Button variant="primary" className="px-8 py-3">
                        Post Request
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Services;
