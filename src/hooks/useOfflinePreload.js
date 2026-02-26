import { useEffect } from 'react';

// Simple offline preload hook: prefetch a list of URLs when online and cache them
export function useOfflinePreload(urls = []) {
  useEffect(() => {
    const canCache = typeof caches !== 'undefined';
    // Preload immediately if online and caches available
    const preload = async () => {
      if (!canCache || !urls.length) return;
      try {
        await caches.open('offline-preload');
        await Promise.all(urls.map(async (u) => {
          try {
            // Use GET with no-cors to best-effort fetch resources for offline use
            await fetch(u, { mode: 'no-cors' });
            // Ignore response; just ensure request completes for caching side-effects
            // Actual caching would require writing to the cache with a Request/Response, which may be restricted
            // so we rely on the browser's fetch caching behavior when allowed
          } catch {
            // Ignore individual fetch failures to avoid breaking app startup
          }
        }));
      } catch {
        // Ignore cache failures; offline UX will degrade gracefully
      }
    };

    // Learn from offline/online transitions
    window.addEventListener('online', preload);
    // Run once on mount
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      preload();
    }
    return () => window.removeEventListener('online', preload);
  }, [urls]);
}
