import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner component for admin console
 * @param {string} [message='Loading...'] - Optional loading message
 * @param {string} [size='md'] - Size: 'sm', 'md', or 'lg'
 * @param {string} [className=''] - Additional CSS classes
 */
const AdminLoadingSpinner = ({
    message = 'Loading...',
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <Loader2
                className={`animate-spin text-accent ${sizeClasses[size]}`}
            />
            {message && (
                <p className={`mt-3 text-gray-400 ${textSizeClasses[size]}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default AdminLoadingSpinner;
