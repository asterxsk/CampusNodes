/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { getAvatarUrl } from '../lib/avatarUtils';

const getIsLocalhost = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('127.0.0.1');
};

export const useAvatarUrl = (publicAvatarUrl) => {
  const isLocalhost = getIsLocalhost();
  const [resolvedUrl, setResolvedUrl] = useState(isLocalhost ? null : publicAvatarUrl);
  
  const resolveUrl = useCallback(async (url) => {
    try {
      const signedUrl = await getAvatarUrl(url);
      setResolvedUrl(() => signedUrl);
    } catch {
      setResolvedUrl(() => url);
    }
  }, []);
  
  useEffect(() => {
    if (isLocalhost) return;
    if (!publicAvatarUrl) {
      setResolvedUrl(() => null);
      return;
    }
    resolveUrl(publicAvatarUrl);
  }, [publicAvatarUrl, isLocalhost, resolveUrl]);
  
  return resolvedUrl;
};
