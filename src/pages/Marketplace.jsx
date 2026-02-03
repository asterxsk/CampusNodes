import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Filter, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { MARKET_ITEMS } from '../data/marketItems';

const MarketCard = ({ item }) => {
    const scrollContainer = useRef(null);
    const hasImages = item.images && item.images.length > 0;

    const scroll = (direction) => {
        if (scrollContainer.current) {
            const { clientWidth } = scrollContainer.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="group relative bg-surface border border-white/5 hover:border-white/20 hover:z-[50] transition-colors duration-300">
            {/* Image Area */}
            <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                {hasImages ? (
                    <>
                        <div
                            ref={scrollContainer}
                            className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
                        >
                            {item.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${item.title} ${idx + 1}`}
                                    className="w-full h-full object-cover shrink-0 snap-center"
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons (Visible on Hover) */}
                        <button
                            onClick={(e) => { e.preventDefault(); scroll('left'); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); scroll('right'); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-50">
                        <Logo className="w-12 h-12 mb-3" />
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                            Seller has not uploaded any images for this product
                        </p>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">{item.category}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Star size={12} className="text-yellow-500 fill-current" /> {item.trustScore}
                    </div>
                </div>
                <h3 className="text-white font-medium truncate mb-1">{item.title}</h3>
                <p className="text-lg font-bold text-white">{item.price}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
                    <span>@{item.seller}</span>
                    <Button to={`/market/${item.id}`} variant="primary" className="px-4 py-2 text-xs">
                        View
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Marketplace = () => {
    const [filter, setFilter] = useState('All');
    const categories = ['All', 'Stationary', 'Tech', 'Essentials', 'Transport', 'Textbooks'];

    const filteredItems = filter === 'All'
        ? MARKET_ITEMS
        : MARKET_ITEMS.filter(item => item.category === filter);

    useEffect(() => {
        anime({
            targets: '.market-card',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
            easing: 'easeOutExpo'
        });
    }, [filter]);

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="w-full mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <h1 className="text-5xl font-display font-bold text-white mb-6 md:mb-0">Marketplace</h1>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto p-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 text-sm font-medium border transition-all duration-300 whitespace-nowrap
                  ${filter === cat
                                        ? 'bg-white text-black border-white'
                                        : 'text-gray-400 border-white/10 hover:border-white/50 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredItems.map((item, index) => (
                        <div key={item.id} className="market-card opacity-0">
                            <MarketCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
