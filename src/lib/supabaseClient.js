import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Maps a static integer ID (from marketItems.js) to a stable UUID
 * used in the Supabase marketplace_items table.
 */
export const getMappedUUID = (id) => {
    if (!id) return id;
    if (isUUID(id)) return id;
    
    // Normalization: If it's a 6-digit ID in our standard range (100,001 - 100,999)
    // we map it back to the legacy seed ID (1 - 999) for DB compatibility.
    let numericId = Number(id);
    if (!isNaN(numericId) && numericId > 100000 && numericId < 110000) {
        numericId -= 100000;
    }
    
    // Convert to 00000000-0000-4000-8000-00000000000X
    const hexId = String(numericId).padStart(12, '0');
    return `00000000-0000-4000-8000-${hexId}`;
};

/**
 * Checks if a string is a standard UUID.
 */
export const isUUID = (str) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Returns the original numeric ID if it was a mapped UUID,
 * otherwise returns the original string.
 */
export const getFriendlyId = (id) => {
    if (!id || typeof id !== 'string') return id;
    if (id.startsWith('00000000-0000-4000-8000-')) {
        const lastPart = id.split('-').pop();
        const num = parseInt(lastPart, 10);
        if (isNaN(num)) return id;
        
        // If it's a legacy seed ID (1-999), show it as 6-digit (100,001+)
        if (num > 0 && num < 10000) {
            return num + 100000;
        }
        return num;
    }
    return id;
};
