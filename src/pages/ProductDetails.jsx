import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { MARKET_ITEMS } from '../data/marketItems';
import { supabase, getMappedUUID, getFriendlyId, isUUID } from '../lib/supabaseClient';
import {
    ChevronRight,
    Tag,
    ShieldCheck,
    Truck,
    Clock,
    ShoppingCart,
    Hash,
    ArrowLeft,
    ZoomIn,
    ZoomOut,
    X,
    Maximize2,
    Shield,
    Star,
    CreditCard,
    User
} from 'lucide-react';

import StarRating from '../components/ui/StarRating';
import StarDisplay from '../components/ui/StarDisplay';


// ─── Helpers ─────────────────────────────────────────────────────────────────

// isUUID and getMappedUUID now imported from ../lib/supabaseClient

/**
 * Generates a deterministic product code (0-100000) from an item ID.
 * Uses a simple hash so the same item always gets the same code.
 */
const generateProductCode = (id) => {
    // If it's already a numeric ID (string or number), return it directly
    const friendlyId = getFriendlyId(id);
    if (!isUUID(friendlyId) && !isNaN(friendlyId)) {
        return friendlyId;
    }

    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // convert to 32-bit int
    }
    // Generate a code in the range 100,000 - 999,999
    return (Math.abs(hash) % 900000) + 100000;
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-background pt-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
            <div className="h-4 w-48 bg-white/10 rounded mb-8 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                <div className="space-y-5">
                    <div className="h-9 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-5 w-1/3 bg-white/10 rounded animate-pulse" />
                    <div className="h-px bg-white/10 my-4" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="h-12 w-full bg-white/10 rounded-full animate-pulse" />
                    <div className="h-12 w-full bg-white/10 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    </div>
);

// ─── Not Found State ──────────────────────────────────────────────────────────
const NotFound = ({ navigate }) => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 text-center"
        >
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <ShoppingCart size={40} className="text-gray-500" strokeWidth={1.5} />
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Item not found
                </h2>
                <p className="text-gray-400 max-w-sm leading-relaxed">
                    This product doesn&apos;t exist or may have been removed by the seller.
                </p>
            </div>
            {/* Centered "Back to market" button */}
            <button
                onClick={() => navigate('/market')}
                className="mt-2 px-8 py-3 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all"
            >
                ← Back to Market
            </button>
        </motion.div>
    </div>
);

// ─── Star Rating Display ───────────────────────────────────────────────────────
const TrustStars = ({ score, rating, count }) => {
    // If we have a 0-5 rating, use StarDisplay
    if (rating !== undefined && rating > 0) {
        return (
            <StarDisplay
                rating={rating}
                count={count}
                size="md"
            />
        );
    }
    // Fallback to trust score display (0-100)
    const filled = score > 0 ? Math.round(score / 20) : 0;
    return (
        <div className="flex items-center group">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={14}
                        className={s <= filled ? "text-[#facc15] fill-current" : "text-gray-700"}
                    />
                ))}
            </div>
            <span className={`ml-2 text-xs uppercase tracking-wider font-medium ${score > 0 ? 'text-yellow-500/90' : 'text-gray-500 italic'}`}>
                {score > 0 ? `${score}% seller trust` : 'No ratings yet'}
            </span>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract ID from pathname — useParams() doesn't work here because
    // RouteController renders this component outside any <Route> element.
    const pathParts = location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const { addToCart } = useCart();
    const { user } = useAuth();
    const { openAuthModal } = useUI();
    const toast = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [cartAdded, setCartAdded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [userRating, setUserRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);


    const fetchProduct = useCallback(async () => {
        setLoading(true);
        try {
            // Get combined mapped ID if it's a static integer
            const mappedId = getMappedUUID(id);

            // ── Priority 1: Data passed via navigation state (DB items) ──────
            const stateItem = location.state?.item;
            if (stateItem && (String(stateItem.id) === String(id) || String(stateItem.id) === String(mappedId))) {
                // Normalize the state item to ensure consistent field names
                setProduct({
                    ...stateItem,
                    id: getFriendlyId(stateItem.id),
                    trustScore: stateItem.trust_score ?? stateItem.trustScore ?? 0,
                    images: stateItem.images?.length
                        ? stateItem.images
                        : stateItem.image_url
                            ? [stateItem.image_url]
                            : [],
                });
                return;
            }

            // ── Priority 2: Supabase (Mapped or Real UUIDs) ──────────────────
            // We check DB first now to get up-to-date ratings, even for "static" items
            let { data, error } = await supabase
                .from('marketplace_items')
                .select('*')
                .eq('id', mappedId)
                .single();

            // Fallback to market_items (standard table)
            if (error || !data) {
                const { data: altData } = await supabase
                    .from('market_items')
                    .select('*')
                    .eq('id', mappedId)
                    .single();

                if (altData) {
                    data = altData;
                    error = null;
                }
            }

            if (data) {
                setProduct({
                    ...data,
                    id: getFriendlyId(data.id),
                    trustScore: data.trust_score ?? data.trustScore ?? 0,
                    images: data.image_url
                        ? [data.image_url]
                        : Array.isArray(data.images)
                            ? data.images
                            : [],
                });
                // Hydrate the stars from the database rating
                if (data.rating !== undefined) {
                    // This is the product average
                }

                // Check if THIS user has already rated
                if (user) {
                    const { data: ratingData } = await supabase
                        .from('marketplace_ratings')
                        .select('rating')
                        .eq('item_id', mappedId)
                        .eq('user_id', user.id)
                        .single();

                    if (ratingData) {
                        setUserRating(Number(ratingData.rating));
                        setHasRated(true);
                    }
                }
                return;
            }

            // ── Priority 3: Local Fallback (Static items if not in DB yet) ────
            const staticItem = MARKET_ITEMS.find(
                (item) => String(item.id) === String(id)
            );
            if (staticItem) {
                setProduct(staticItem);
                return;
            }

            if (error) {
                console.error('ProductDetails Supabase error:', error.message);
            }
        } catch (err) {
            console.error('ProductDetails unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }, [id, location.state, user]);

    useEffect(() => {
        // Redirection logic: if we are on an ugly UUID URL but it matches a friendly static ID, 
        // redirect to the friendly version.
        if (id && isUUID(id)) {
            const friendlyId = getFriendlyId(id);
            if (friendlyId !== id) {
                navigate(`/market/${friendlyId}`, { replace: true });
                return;
            }
        }
        fetchProduct();
    }, [id, fetchProduct, navigate]);

    const productCode = product ? generateProductCode(product.id) : null;

    const handleBuy = () => {
        if (!user) { openAuthModal(); return; }
        navigate('/checkout', { state: { directPurchase: true, item: product } });
    };

    const handleAddToCart = () => {
        if (!user) { openAuthModal(); return; }
        const success = addToCart(product);
        if (success) {
            setCartAdded(true);
            toast.success(`${product.title} added to cart!`);
            setTimeout(() => setCartAdded(false), 2500);
        } else {
            toast.info('Item already in cart');
        }
    };

    /**
     * Map a 0-5 star rating to a 0-100 trust score.
     */
    const mapRatingToScore = (stars) => {
        if (stars <= 0) return 0;
        // Simple linear mapping: 5 stars = 100%, 1 star = 20%
        return Math.min(100, Math.round(stars * 20));
    };

    const handleRate = async (ratingValue) => {
        if (!user) {
            toast.info('Please sign in to rate products');
            openAuthModal();
            return;
        }

        const isUpdate = hasRated;
        const oldUserRating = userRating;

        const newScore = mapRatingToScore(ratingValue);
        setUserRating(ratingValue);
        setHasRated(true);

        // Update local state immediately for visual feedback
        setProduct((prev) => {
            if (!prev) return null;
            const oldCount = prev.rating_count || 0;
            const oldRating = prev.rating || 0;

            let newCount = oldCount;
            let newRollingRating;

            if (isUpdate) {
                // Formula for updating average: (Total - oldVal + newVal) / Count
                // We ensure count is at least 1 to avoid division by zero (though it should be >= 1 if isUpdate is true)
                newRollingRating = oldCount > 0
                    ? (oldRating * oldCount - oldUserRating + ratingValue) / oldCount
                    : ratingValue;
            } else {
                newCount = oldCount + 1;
                newRollingRating = (oldRating * oldCount + ratingValue) / newCount;
            }

            return {
                ...prev,
                trustScore: newScore,
                rating: newRollingRating,
                rating_count: newCount
            };
        });

        // Persistence for database items
        const mappedId = getMappedUUID(product.id);
        if (product && isUUID(mappedId)) {
            try {
                // Call the atomic RPC function unit with user ID as rater_id
                // The backend RPC should handle the logic: if rater_id exists for target_id, update it; else insert.
                const { data: response, error: rpcError } = await supabase.rpc('increment_product_rating', {
                    target_id: mappedId,
                    new_rating_val: ratingValue,
                    rater_id: user.id
                });

                if (rpcError || (response && response.success === false)) {
                    // Revert the optimistic update
                    setProduct((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            trustScore: mapRatingToScore(prev.rating || 0),
                            rating: prev.rating || 0,
                            rating_count: prev.rating_count || 0
                        };
                    });
                    setUserRating(oldUserRating);
                    setHasRated(isUpdate);
                    toast.error(rpcError?.message || response?.message || 'Failed to submit rating.');
                } else {
                    toast.success(isUpdate ? 'Rating changed!' : 'Thank you for your rating!');
                }
            } catch (err) {
                // Revert the optimistic update
                setProduct((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        trustScore: mapRatingToScore(prev.rating || 0),
                        rating: prev.rating || 0,
                        rating_count: prev.rating_count || 0
                    };
                });
                setUserRating(oldUserRating);
                setHasRated(isUpdate);
                toast.error('Failed to sync rating. Please try again.');
                console.error('Failed to sync rating to DB:', err);
            }
        }
    };

    if (loading) return <LoadingSkeleton />;
    if (!product) return <NotFound navigate={navigate} />;

    const images = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [];

    return (
        <div className="min-h-screen bg-background pt-20 pb-24 relative overflow-hidden">
            
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/3 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            {/* ─── Breadcrumb Header ───────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 flex items-center gap-6 relative z-10">
                {/* Circular Back Button */}
                <button
                    onClick={() => navigate('/market')}
                    className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:bg-zinc-200 transition-all duration-300 shadow-xl group border border-white/5"
                    title="Back to Marketplace"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Path Navigation */}
                <div className="flex items-center gap-3 text-sm font-medium tracking-wide">
                    <button
                        onClick={() => navigate('/market')}
                        className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                        Marketplace
                    </button>
                    <ChevronRight size={14} className="text-gray-700" />
                    <button
                        onClick={() => navigate('/market', { state: { category: product.category } })}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {product.category || 'Category'}
                    </button>
                    <ChevronRight size={14} className="text-gray-700" />
                    <span className="text-white font-semibold truncate max-w-[200px] md:max-w-none">
                        {product.title}
                    </span>
                </div>
            </div>

            {/* ─── Main Content ─────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="grid grid-cols-1 lg:grid-cols-[44%_1fr] gap-10 xl:gap-16"
                >
                    {/* ── LEFT: Image Gallery ──────────────────────────── */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                        {/* Main image */}
                        <div
                            className="aspect-square bg-white/3 rounded-2xl overflow-hidden flex items-center justify-center relative cursor-zoom-in group/image"
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            {images.length > 0 ? (
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImage}
                                        src={images[selectedImage]}
                                        alt={product.title}
                                        initial={{ opacity: 0, scale: 1.04 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full h-full object-contain"
                                    />
                                </AnimatePresence>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-gray-600">
                                    <ShoppingCart size={52} strokeWidth={1} />
                                    <p className="text-xs uppercase tracking-widest">No image</p>
                                </div>
                            )}

                            {/* Zoom Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                                    <Maximize2 size={24} className="text-white" />
                                </div>
                            </div>

                            {/* Product code badge */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                                <Hash size={10} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {productCode}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-16 shrink-0 border-2 rounded-xl overflow-hidden transition-all ${selectedImage === idx
                                                ? 'border-accent shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                                                : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Product Info ──────────────────────────── */}
                    <div className="flex flex-col">

                        {/* Category + Trust */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase tracking-widest">
                                <Tag size={9} />
                                {product.category || 'Uncategorized'}
                            </span>
                            <TrustStars
                                score={product.trustScore}
                                rating={product.rating}
                                count={product.rating_count}
                            />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-2">
                            {product.title}
                        </h1>

                        <div className="mb-6 flex flex-col gap-2">
                            <StarRating onRate={handleRate} initialRating={userRating} />
                            {userRating > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] text-green-500 font-medium uppercase tracking-wider"
                                >
                                    Thank you for your feedback!
                                </motion.p>
                            )}
                        </div>

                        {/* Seller */}
                        <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
                            <User size={14} className="text-gray-500" />
                            <span>Listed by</span>
                            <span className="text-white font-medium">
                                @{product.seller || 'Campus Seller'}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Price</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-light text-white">
                                    {product.price}
                                </span>
                                {product.price && (
                                    <span className="text-sm text-gray-600 line-through">
                                        ₹{Math.round(
                                            parseInt(String(product.price).replace(/[^0-9]/g, '') || '0') * 1.2
                                        ).toLocaleString('en-IN')}
                                    </span>
                                )}
                                <span className="text-xs text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
                                    ~17% off
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-white/8 mb-6" />

                        {/* Description */}
                        {product.description ? (
                            <div className="mb-6">
                                <h3 className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
                                    About this item
                                </h3>
                                <p className="text-gray-300 leading-relaxed text-base">
                                    {product.description}
                                </p>
                            </div>
                        ) : (
                            <div className="mb-6 p-4 rounded-xl bg-white/3 border border-white/8">
                                <p className="text-gray-500 text-sm italic">
                                    The seller hasn&apos;t added a description for this item. Contact them for more details.
                                </p>
                            </div>
                        )}

                        <div className="h-px bg-white/8 mb-6" />

                        {/* Product ID */}
                        <div className="flex items-center gap-2 mb-6 text-xs text-gray-600">
                            <Hash size={12} />
                            <span className="font-mono">
                                Product Code: <span className="text-gray-400">{String(productCode).padStart(5, '0')}</span>
                            </span>
                        </div>

                        {/* ─── Action Buttons ──────────────────────────── */}
                        <div className="flex flex-col gap-3 max-w-sm mb-6">
                            {/* Buy Now */}
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleBuy}
                                className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
                            >
                                <CreditCard size={16} />
                                Buy Now
                            </motion.button>

                            {/* Add to Cart */}
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleAddToCart}
                                className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 transition-all"
                            >
                                <ShoppingCart size={16} />
                                {cartAdded ? '✓ Added to Cart' : 'Add to Cart'}
                            </motion.button>
                        </div>

                        {/* Trust badge */}
                        <div className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl max-w-sm">
                            <Shield size={16} className="text-accent shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-white mb-0.5">Secure Transaction</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Verified campus seller · Buyer protection included
                                </p>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>

            {/* ─── Lightbox Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setIsLightboxOpen(false);
                                setZoomLevel(1);
                            }}
                            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all z-[110]"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Container */}
                        <div className="relative w-full h-full flex items-center justify-center overflow-auto no-scrollbar">
                            <motion.img
                                src={images[selectedImage]}
                                alt={product.title}
                                animate={{ scale: zoomLevel }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
                                style={{ transformOrigin: 'center' }}
                            />
                        </div>

                        {/* Zoom Controls Pill */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl z-[110]">
                            <button
                                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                                className="p-2 text-white/70 hover:text-white transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut size={20} />
                            </button>

                            <div className="w-px h-4 bg-white/10" />

                            <span className="text-[10px] font-mono text-white/50 w-8 text-center uppercase tracking-tighter">
                                {Math.round(zoomLevel * 100)}%
                            </span>

                            <div className="w-px h-4 bg-white/10" />

                            <button
                                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                                className="p-2 text-white/70 hover:text-white transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn size={20} />
                            </button>

                            <div className="w-px h-4 bg-white/10" />

                            <button
                                onClick={() => {
                                    setIsLightboxOpen(false);
                                    setZoomLevel(1);
                                }}
                                className="p-2 text-white/50 hover:text-white transition-colors"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetails;
