import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

/**
 * Reusable empty state component for admin console
 * @param {string} [message='No data found'] - Message to display
 * @param {React.ReactNode} [icon] - Optional custom icon
 * @param {Function} [onRetry] - Optional retry callback
 * @param {string} [className=''] - Additional CSS classes
 */
const AdminEmptyState = ({
    message = 'No data found',
    icon,
    onRetry,
    className = ''
}) => {
    return (
        <div className={`col-span-full py-12 text-center ${className}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                {icon || <Inbox className="w-8 h-8 text-gray-500" />}
            </div>
            <p className="text-gray-500 text-sm">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={14} />
                    Retry
                </button>
            )}
        </div>
    );
};

export default AdminEmptyState;
