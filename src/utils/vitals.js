export function reportWebVitals(onPerfEntry) {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
            onCLS(onPerfEntry);
            onINP(onPerfEntry);
            onFCP(onPerfEntry);
            onLCP(onPerfEntry);
            onTTFB(onPerfEntry);
        }).catch((err) => {
            console.warn("Failed to load web-vitals dynamically:", err);
        });
    }
}
