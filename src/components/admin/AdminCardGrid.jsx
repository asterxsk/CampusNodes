import React from 'react';
import AdminLoadingSpinner from './AdminLoadingSpinner';
import AdminEmptyState from './AdminEmptyState';

/**
 * Reusable grid layout wrapper for admin console cards
 * @param {boolean} loading - Loading state
 * @param {string} [error] - Error message
 * @param {Array} data - Data array to render
 * @param {Function} onRetry - Optional retry callback
 * @param {React.ReactNode} children - Card components to render
 * @param {string} [gridClassName='grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'] - Grid classes
 * @param {string} [loadingMessage] - Custom loading message
 */
const AdminCardGrid = ({
    loading,
    error,
    data,
    onRetry,
    children,
    gridClassName = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    loadingMessage
}) => {
    if (loading) {
        return <AdminLoadingSpinner message={loadingMessage} />;
    }

    if (error) {
        return (
            <div className="col-span-full py-12 text-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 p-6">
                <p className="font-medium mb-2">Error Loading Data</p>
                <p className="text-sm text-red-300">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return <AdminEmptyState onRetry={onRetry} />;
    }

    return (
        <div className={`grid ${gridClassName}`}>
            {children}
        </div>
    );
};

export default AdminCardGrid;
