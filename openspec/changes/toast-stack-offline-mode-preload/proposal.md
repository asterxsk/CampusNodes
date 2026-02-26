## Toast Stack at Bottom with Offline Preload

Summary: Implement a bottom-aligned ToastStack that keeps only the latest toast visible and stacks older toasts behind it. Add offline mode error handling and preload critical assets for offline UX.

## Why
- The current toast system floods the screen with multiple toasts on offline events; this degrades user experience and wastes space.
- A bottom-aligned stack that shows one visible toast with others queued behind improves readability and consistency.
- Offline preload ensures essential UI data/assets are available offline, improving resilience.

## What Changes
- Add a ToastStack UI container anchored to the bottom of the viewport.
- Change the toast dispatch flow to push to a stack; render with a single visible toast and stacked behind it.
- Add maxVisible default to 1; older toasts remain in the DOM for transitions.
- Add offline detection and an OfflinePreload hook to preload assets and strings for offline UX.
- Integrate with existing ToastContext/ToastManager without removing existing toast capabilities.
- Animate stack transitions when new toasts appear or are dismissed.

## Capabilities

### New Capabilities
- toast-stack-bottom: A bottom-anchored toast stack with a single visible toast and a behind-stack.

### Modified Capabilities
- None (no existing capabilities are modified in this proposal)

## Impact
- UI/UX: More readable toast behavior in offline scenarios.
- Code: New ToastStack component; new offline preload hook; updates to ToastManager.
- Dependencies: CSS for fixed-bottom stack; a small offline preload implementation.

## Notes
- Capabilities section is the contract that drives subsequent specs. Each capability will generate a spec under specs/.
 
