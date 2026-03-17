import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import anime from 'animejs/lib/anime.es.js';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import Logo from '../components/ui/Logo';
import Skeleton from '../components/ui/Skeleton';
import StarDisplay from '../components/ui/StarDisplay';
import { MARKET_ITEMS } from '../data/marketItems';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { supabase, getMappedUUID, getFriendlyId } from '../lib/supabaseClient';
import { flushSync } from 'react-dom';

const MarketCard = ({ item }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  const toast = useToast();
  const scrollContainer = useRef(null);
  const hasImages = item.images?.length > 0;

  const scroll = (direction) => {
    if (!scrollContainer.current) return;
    const scrollAmount = direction === 'left' ? -scrollContainer.current.clientWidth : scrollContainer.current.clientWidth;
    scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }

    const success = addToCart(item);
    toast[success ? 'success' : 'info'](success ? `${item.title} added to cart!` : 'Item already in cart');
  };

  return (
    <div
      className="group relative bg-surface border-2 border-white/10 hover:border-white/30 hover:z-[50] transition-all duration-300 cursor-pointer focus:border-white/50 focus:outline-none rounded-2xl overflow-hidden"
      onClick={() => navigate(`/market/${item.id}`, { state: { item } })}

    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        {hasImages ? (
          <>
            <div
              ref={scrollContainer}
              className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
              onClick={(e) => { e.stopPropagation(); navigate(`/market/${item.id}`); }}
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

            <button
              onClick={(e) => { e.stopPropagation(); scroll('left'); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); scroll('right'); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="flex items-center gap-2 text-white font-medium">
                <Eye size={18} />
                <span className="text-sm">Click to view details</span>
              </div>
            </div>
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
          <StarDisplay
            rating={item.rating || 0}
            count={item.rating_count || 0}
            size="sm"
          />
        </div>
        <h3 className="text-white font-medium truncate mb-1">{item.title}</h3>
        <p className="text-lg font-bold text-white">{item.price}</p>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
          <span>@{item.seller}</span>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors"
          >
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const Marketplace = () => {
  const location = useLocation();
  const [filter, setFilter] = useState(location.state?.category || 'All');

  const categories = ['All', 'Lab Gear', 'Electronics', 'Tools'];

  const [isLoading, setIsLoading] = useState(true);
  const [dbItems, setDbItems] = useState([]);

  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map database fields to our frontend component expected fields
        const mappedItems = (data || []).map(item => ({
          id: getFriendlyId(item.id),
          title: item.title,
          price: item.price,
          category: item.category,
          seller: item.seller,
          trustScore: item.trust_score ?? 0,
          rating: item.rating ?? 0,
          rating_count: item.rating_count ?? 0,
          images: item.image_url ? [item.image_url] : [],
          isDbItem: true
        }));

        setDbItems(mappedItems);
      } catch (error) {
        console.error('Error fetching marketplace items:', error);
      } finally {
        // Essential delay to prevent double-loading during page transition
        setTimeout(() => setIsLoading(false), 600);
      }
    };

    fetchMarketplaceItems();
  }, []);

  // Create combined list, prioritizing DB items over static fallback
  const allItems = (() => {
    const items = [...dbItems];
    const dbFriendlyIds = new Set(dbItems.map(i => i.id));
    const dbTitles = new Set(dbItems.map(i => i.title.toLowerCase()));

    MARKET_ITEMS.forEach(staticItem => {
      // Deduplicate by ID OR by title to catch old version of the same product
      if (!dbFriendlyIds.has(staticItem.id) && !dbTitles.has(staticItem.title.toLowerCase())) {
        items.push(staticItem);
      }
    });

    return items;
  })();

  // Map old admin categories to new categories for backward compatibility
  const categoryMap = {
    'Stationary': 'Lab Gear',
    'Tech': 'Electronics',
    'Essentials': 'Lab Gear',
    'Transport': 'Tools',
    'Textbooks': 'Lab Gear'
  };

  const normalizedItems = allItems.map(item => ({
    ...item,
    category: categoryMap[item.category] || item.category
  }));

  const sortedItems = [...normalizedItems].sort((a, b) => {
    // Sort by rating first (highest first)
    if ((b.rating || 0) !== (a.rating || 0)) {
      return (b.rating || 0) - (a.rating || 0);
    }
    // Fallback to trust score
    if ((b.trustScore || 0) !== (a.trustScore || 0)) {
      return (b.trustScore || 0) - (a.trustScore || 0);
    }
    // Final fallback to preserve stable order
    return String(a.title).localeCompare(b.title);
  });

  const filteredItems = filter === 'All'
    ? sortedItems
    : sortedItems.filter(item => item.category === filter);

  const handleFilterChange = (e, newFilter) => {
    if (newFilter === filter) return;

    // Fallback if browser doesn't support View Transitions
    if (!document.startViewTransition) {
      setFilter(newFilter);
      return;
    }

    // Get click coordinates
    const x = e.clientX;
    const y = e.clientY;

    // Set CSS variables for origin
    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    // Add class for specific transition
    document.documentElement.classList.add('filter-transition');

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setFilter(newFilter);
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('filter-transition');
      document.documentElement.style.removeProperty('--click-x');
      document.documentElement.style.removeProperty('--click-y');
    });
  };

  // Header slides in naturally with page transition


  // Filter change animation only (no entrance animation - handled by page transition)
  useEffect(() => {
    if (!isLoading) {
      anime({
        targets: '.market-card',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80, { start: 400 }),
        easing: 'easeOutExpo',
        duration: 800
      });
    }
  }, [filter, isLoading]);

  return (
    <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-6 md:mb-0">
            Marketplace
          </h1>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1 }}
            className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto p-1 scrollbar-hide"
          >
            {isLoading ? (
              // Filter Skeletons
              Array(6).fill(0).map((_, i) => (
                <div key={`filter-skeleton-${i}`} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 min-w-[100px]">
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              ))
            ) : (
              categories.map((cat, idx) => (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: idx * 0.05 }}
                  onClick={(e) => handleFilterChange(e, cat)}
                  className={`px-6 py-2.5 text-sm font-medium border transition-all duration-300 whitespace-nowrap rounded-full
                    ${filter === cat
                      ? 'bg-white text-black border-white'
                      : 'text-gray-400 border-white/10 hover:border-white/50 hover:text-white'
                    }`}
                >
                  {cat}
                </motion.button>
              ))
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-surface border-2 border-white/10 rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full border-none rounded-none" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-4 w-20 rounded border-none" />
                    <Skeleton className="h-4 w-12 rounded border-none" />
                  </div>
                  <Skeleton className="h-6 w-3/4 rounded mb-2 border-none" />
                  <Skeleton className="h-8 w-1/4 rounded mb-4 border-none" />
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded border-none" />
                    <Skeleton className="h-10 w-24 rounded-full border-none" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="market-card opacity-0">
                <MarketCard item={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
