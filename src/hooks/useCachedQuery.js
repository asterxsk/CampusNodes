import { useState, useEffect } from 'react';

// Basic cache object in memory, falls back to localStorage
const cacheStore = {};

/**
 * A hook to fetch data and cache it for offline use.
 * 
 * @param {string} key Unique key for the cache (e.g., 'market_items')
 * @param {Function} fetcher Async function that returns the data
 * @param {object} options Options like { initialData: [] }
 */
export function useCachedQuery(key, fetcher, options = {}) {
    const [data, setData] = useState(options.initialData || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        let mounted = true;

        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => {
            setIsOffline(false);
            fetchData(); // Refetch when coming back online
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        const loadCachedData = () => {
            try {
                const cached = localStorage.getItem(`cache_${key}`);
                if (cached) {
                    if (mounted) {
                        setData(JSON.parse(cached));
                    }
                }
            } catch {
                console.warn('Failed to load cache for', key);
            }
        };

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            if (!navigator.onLine) {
                loadCachedData();
                setLoading(false);
                return;
            }

            try {
                const result = await fetcher();
                if (mounted) {
                    setData(result);
                    cacheStore[key] = result;
                    try {
                        localStorage.setItem(`cache_${key}`, JSON.stringify(result));
                    } catch {
                        // Ignore quota errors
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                    loadCachedData(); // Fallback to cache on error
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            mounted = false;
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]); // Assuming fetcher is stable or wrapped in useCallback

    return { data, loading, error, isOffline };
}
