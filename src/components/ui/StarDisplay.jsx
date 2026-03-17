import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarDisplay Component
 * A read-only star rating display for showing ratings in the UI.
 * 
 * @param {number} rating - Rating value (0-5)
 * @param {number} count - Optional rating count
 * @param {string} size - Size of stars ('sm', 'md', 'lg')
 */
const StarDisplay = ({ rating = 0, count, size = 'md' }) => {
    // Clamp rating between 0-5
    const clampedRating = Math.max(0, Math.min(5, rating));
    const filled = Math.round(clampedRating);

    // Size configurations
    const sizeConfig = {
        sm: { star: 12, text: 'text-[10px]' },
        md: { star: 14, text: 'text-xs' },
        lg: { star: 16, text: 'text-sm' }
    };

    const { star: starSize, text: textClass } = sizeConfig[size] || sizeConfig.md;

    return (
        <div className="flex items-center gap-1.5">
            {/* Stars */}
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={starSize}
                        className={s <= filled ? "text-[#facc15] fill-current" : "text-gray-700"}
                    />
                ))}
            </div>

            {/* Rating text */}
            <span className={`${textClass} font-medium tracking-wide ${clampedRating > 0 ? 'text-yellow-500/90' : 'text-gray-500 italic'}`}>
                {clampedRating > 0 ? `${clampedRating.toFixed(1)}` : 'No ratings'}
            </span>

            {/* Rating count */}
            {count !== undefined && count > 0 && (
                <span className={`${textClass} text-gray-500`}>
                    ({count})
                </span>
            )}
        </div>
    );
};

export default StarDisplay;
