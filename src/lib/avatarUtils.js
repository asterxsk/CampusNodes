import { supabase } from './supabaseClient';

const signedUrlCache = new Map();
const CACHE_DURATION = 55 * 60 * 1000;

const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('127.0.0.1');
};

export const getAvatarUrl = async (avatarUrl) => {
  if (!avatarUrl) return null;
  
  // Don't make any storage requests on localhost to avoid Cloudflare errors
  if (isLocalhost()) {
    return null;
  }
  
  const cached = signedUrlCache.get(avatarUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }
  
  try {
    const pathMatch = avatarUrl.match(/\/avatars\/(.*)/);
    if (!pathMatch) return avatarUrl;
    
    const path = pathMatch[1];
    
    const { data, error } = await supabase
      .storage
      .from('avatars')
      .createSignedUrl(path, 3600, {
        download: false,
        transform: { width: 200, height: 200, resize: 'cover' }
      });
    
    if (error) {
      console.warn('Failed to create signed URL:', error);
      return avatarUrl;
    }
    
    signedUrlCache.set(avatarUrl, { url: data.signedUrl, timestamp: Date.now() });
    
    return data.signedUrl;
  } catch (err) {
    console.error('Error getting signed avatar URL:', err);
    return avatarUrl;
  }
};

export const clearAvatarCache = () => signedUrlCache.clear();
