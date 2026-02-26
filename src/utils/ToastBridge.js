// Lightweight bridge to funnel toasts into the ToastStack.
// It emits a global event that the ToastStack listens for.
export function emitToast(message, options = {}) {
  const detail = { message, ...options, icon: options.icon }
  const ev = new CustomEvent('global-toast', { detail })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(ev)
  }
}

// Optional: wrap window.toast if available to route through the stack
if (typeof window !== 'undefined' && typeof window.toast === 'function') {
  const original = window.toast
  window.toast = function(type, message) {
    emitToast(message, { type })
    return original(type, message)
  }
}
