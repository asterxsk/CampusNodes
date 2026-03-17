import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook for unified data fetching from Supabase
 * @param {string} table - The table name to fetch from
 * @param {string} [orderColumn='created_at'] - Column to order by
 * @param {string} [orderDirection='desc'] - Order direction ('asc' or 'desc')
 * @param {string[]} [selectColumns='*'] - Columns to select
 * @param {boolean} [autoFetch=true] - Whether to fetch automatically on mount
 * @returns {Object} { data, loading, error, fetch, setData }
 */
const useAdminFetch = (table, orderColumn = 'created_at', orderDirection = 'desc', selectColumns = '*', autoFetch = true) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: result, error: fetchError } = await supabase
                .from(table)
                .select(selectColumns)
                .order(orderColumn, { ascending: orderDirection === 'asc' });

            if (fetchError) {
                setError(fetchError.message || `Failed to fetch ${table}`);
                console.error(`Error fetching ${table}:`, fetchError);
            }

            setData(result || []);
        } catch (err) {
            const errorMsg = err.message || 'Unknown error';
            setError(errorMsg);
            console.error(`Error fetching ${table}:`, err);
        } finally {
            setLoading(false);
        }
    }, [table, orderColumn, orderDirection, selectColumns]);

    useEffect(() => {
        if (autoFetch) {
            fetch();
        }
    }, [fetch, autoFetch]);

    return { data, setData, loading, error, fetch };
};

export default useAdminFetch;
