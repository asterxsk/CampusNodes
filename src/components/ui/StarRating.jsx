import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * Supports discrete clicks and continuous drag interactions for fractional ratings.
 * 
 * @param {number} initialRating - Initial rating value (0-5)
 * @param {function} onRate - Callback triggered when a rating is finalized
 * @param {boolean} readonly - Whether the component is interactive
 */
const StarRating = ({ initialRating = 0, onRate, readonly = false }) => {
    const [rating, setRating] = useState(initialRating);

    // Sync internal state with prop changes when the product loads from Supabase
    useEffect(() => {
        setRating(initialRating);
    }, [initialRating]);
    const [tempRating, setTempRating] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const calculateRating = useCallback((e) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (clientX === undefined) return 0;
        
        const x = clientX - rect.left;
        const width = rect.width;
        let val = (x / width) * 5;
        val = Math.max(0, Math.min(5, val));
        
        // Return precise fractional value
        return Math.round(val * 10) / 10;
    }, []);

    const handleMouseDown = (e) => {
        if (readonly) return;
        setIsDragging(true);
        const val = calculateRating(e);
        setTempRating(val);
    };

    const handleMouseMove = useCallback((e) => {
        if (readonly) return;
        if (isDragging || tempRating > 0) {
            setTempRating(calculateRating(e));
        }
    }, [isDragging, tempRating, calculateRating, readonly]);

    const handleTouchMove = useCallback((e) => {
        if (readonly || !isDragging) return;
        // Don't prevent default here to allow vertical scroll if not dragging precisely?
        // Actually, for a star rating, we usually want to capture it.
        setTempRating(calculateRating(e));
    }, [isDragging, calculateRating, readonly]);

    const handleMouseUp = useCallback((e) => {
        if (readonly || !isDragging) return;
        const val = calculateRating(e);
        setRating(val);
        setTempRating(0);
        setIsDragging(false);
        if (onRate) onRate(val);
    }, [readonly, isDragging, calculateRating, onRate]);

    const handleMouseLeave = () => {
        if (readonly) return;
        if (!isDragging) {
            setTempRating(0);
        }
    };

    const handleMouseEnter = (e) => {
        if (readonly) return;
        setTempRating(calculateRating(e));
    };

    // Global mouse up to catch releases outside the container
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    const displayRating = tempRating || rating;

    return (
        <div className="flex flex-col gap-2">
            <div 
                ref={containerRef}
                className={`relative flex items-center gap-1 w-fit select-none ${readonly ? '' : 'cursor-pointer active:cursor-grabbing'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onTouchStart={handleMouseDown}
                style={{ touchAction: 'none' }}
            >
                {/* Background Stars (Base) */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                            key={s} 
                            size={24} 
                            className="text-white/10" 
                            fill="currentColor"
                        />
                    ))}
                </div>

                {/* Filled Stars (Overlay) */}
                <div 
                    className="absolute inset-0 flex items-center gap-1 overflow-hidden pointer-events-none"
                    style={{ width: `${(displayRating / 5) * 100}%` }}
                >
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                            key={s} 
                            size={24} 
                            className="text-[#facc15] shrink-0" 
                            fill="currentColor"
                        />
                    ))}
                </div>
            </div>

            {!readonly && (
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest h-4">
                    Rating: <span className="text-white">{(tempRating || rating).toFixed(1)}</span> / 5.0
                </div>
            )}
        </div>
    );
};

export default StarRating;
