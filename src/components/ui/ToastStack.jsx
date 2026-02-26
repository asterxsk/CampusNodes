import React, { useEffect, useState, useMemo } from 'react'

// Minimal, self-contained bottom-aligned toast stack.
// It observes a global toast event stream (via a custom event) and renders
// a small stack with the newest on bottom and others behind it.

const ToastStack = ({ maxVisible = 1 }) => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Local event for pushes from application code or the ToastBridge
    const onToast = (e) => {
      const t = e?.detail || {};
      if (!t?.message) return
      setToasts((prev) => {
        const next = [...prev, t]
        // Keep stack bounded by maxVisible + a small buffer for animation
        if (next.length > maxVisible + 2) next.shift()
        return next
      })
    }

    window.addEventListener('global-toast', onToast)
    return () => window.removeEventListener('global-toast', onToast)
  }, [maxVisible])

  // Remove a toast at given index
  const dismiss = (idx) => {
    setToasts((t) => t.filter((_, i) => i !== idx))
  }

  // Offline handling: show a single offline toast if the user goes offline
  useEffect(() => {
    const offlineHandler = () => {
      setToasts((prev) => {
        // If offline toast already exists, don't duplicate
        const exists = prev.find((x) => x.isOffline);
        if (exists) return prev
        return [...prev, { message: 'You are offline. Some features may be unavailable.', icon: '📡', isOffline: true }]
      })
    }
    window.addEventListener('offline', offlineHandler)
    window.addEventListener('online', () => {
      // Remove offline toast when back online
      setToasts((prev) => prev.filter((t) => !t.isOffline))
    })
    return () => {
      window.removeEventListener('offline', offlineHandler)
      window.removeEventListener('online', () => {})
    }
  }, [])

  // Inline styles to anchor at bottom and keep small footprint
  const containerStyle = useMemo(() => ({
    position: 'fixed',
    bottom: 12,
    left: 12,
    right: 12,
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 9999
  }), [])

  return (
    <div style={containerStyle} aria-live="polite" aria-atomic variance="polite">
      {toasts.map((t, idx) => (
        <div key={idx} style={{
          marginTop: 8,
          minWidth: 240,
          maxWidth: 'min(90vw, 420px)',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          opacity: idx === toasts.length - 1 ? 1 : 0.75 - (toasts.length - idx - 1) * 0.2,
          transform: `translateY(${(idx - (toasts.length - 1)) * 4}px)`,
          transition: 'opacity 240ms ease, transform 240ms ease',
          display: 'block',
          pointerEvents: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: '0 0 auto' }}>{t.icon ?? '💬'}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button aria-label="Dismiss" onClick={() => dismiss(idx)} style={{ background: 'transparent', border: 0, color: '#fff' }}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
