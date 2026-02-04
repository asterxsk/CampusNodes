import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Printer, Wrench, Code, Camera, Calendar, ArrowLeft, CheckCircle, Star } from 'lucide-react';
import Button from '../components/ui/Button';

// Reusing data for consistency - ideally this comes from a shared constant or Supabase
const SERVICES_DATA = [
    {
        id: 'tutoring',
        title: 'Peer Tutoring',
        description: 'Ace your mid-terms with help from seniors who topped the class.',
        details: 'Get personalized 1-on-1 tutoring sessions from top seniors. Subjects include Engineering Maths, Physics, and Data Structures. Flexible timing and affordable rates.',
        pricing: '₹150 / hour',
        icon: <BookOpen size={64} />,
        availableCount: 42,
        provider: 'Aarya Nadiger',
        rating: 4.8
    },
    {
        id: 'printing',
        title: 'Print & Bind',
        description: 'Fast, cheap printing delivered to your hostel room.',
        details: 'We print, bind, and deliver your assignments directly to your room. Supports Black & White and Color printing. Spiral binding available.',
        pricing: '₹2 / page (B&W)',
        icon: <Printer size={64} />,
        availableCount: 8,
        provider: 'Rushi Shah',
        rating: 4.9
    },
    {
        id: 'repair',
        title: 'Tech Repair',
        description: 'Broken laptop screen or phone issues? Reliable fixes.',
        details: 'Expert diagnosis and repair for laptops and mobile phones. Screen replacements, battery issues, and software troubleshooting.',
        pricing: 'From ₹300',
        icon: <Wrench size={64} />,
        availableCount: 12,
        provider: 'Meemoh Shukla',
        rating: 4.7
    },
    {
        id: 'coding',
        title: 'Coding Mentorship',
        description: 'Debug help for C++, Python, and Java semester projects.',
        details: 'Stuck on a bug? Need code review? Get help from experienced competitive coders and developers. Code walkthroughs and logic building.',
        pricing: 'Free for First Year',
        icon: <Code size={64} />,
        availableCount: 25,
        provider: 'Prithish Gurbani',
        rating: 5.0
    },
    {
        id: 'photography',
        title: 'Event Media',
        description: 'Hire photographers and videographers for your club events.',
        details: 'Professional coverage for cultural fests, workshops, and seminars. 4K recording and same-day editing available.',
        pricing: '₹2000 / event',
        icon: <Camera size={64} />,
        availableCount: 5,
        provider: 'Tanish Parekh',
        rating: 4.6
    },
    {
        id: 'events',
        title: 'Committee Events',
        description: 'Find committees recruiting new members or hosting workshops.',
        details: 'Stay updated with the latest workshops, hackathons, and recruitment drives happening on campus. Register directly.',
        pricing: 'Varies',
        icon: <Calendar size={64} />,
        availableCount: 7,
        provider: 'Sarvesh Nimbalkar',
        rating: 4.5
    }
];

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const service = SERVICES_DATA.find(s => s.id === id);

    if (!service) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
                <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
                <Button onClick={() => navigate('/services')}>Back to Services</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Services
                </button>

                <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-6 bg-white/5 rounded-2xl text-accent border border-white/5 shrink-0">
                                {service.icon}
                            </div>

                            <div className="flex-1">
                                <h1 className="text-4xl font-display font-bold text-white mb-4">{service.title}</h1>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center gap-2 text-yellow-400">
                                        <Star fill="currentColor" size={18} />
                                        <span className="font-bold">{service.rating}</span>
                                    </div>
                                    <div className="text-gray-400">
                                        Head: <span className="text-white">{service.provider}</span>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
                                        {service.availableCount} Active Providers
                                    </div>
                                </div>

                                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                                    {service.details}
                                </p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Verified Student Providers</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Secure Payment via Campus Nodes</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Pricing: <span className="text-white font-semibold">{service.pricing}</span></span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="primary" className="px-8 py-3">
                                        Book Now
                                    </Button>
                                    <Button variant="outline" className="px-8 py-3">
                                        Contact Provider
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
