import React from 'react';

/**
 * A simple skeleton component for loading states.
 * Uses Tailwind's pulse animation.
 * 
 * @param {string} className - Additional CSS classes (e.g., width, height, rounded corners)
 */
const Skeleton = ({ className }) => {
    return (
        <div className={`animate-pulse bg-surface border border-white/5 ${className}`}></div>
    );
};

export default Skeleton;
