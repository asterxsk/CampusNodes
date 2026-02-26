## Toast Stack – Design

Context: The current toast system floods the UI with multiple toasts when errors occur offline. We want a bottom-aligned, space-efficient toast stack that shows only the newest toast and stacks older toasts behind it. This will improve UX during offline scenarios and reduce visual noise.

Goals / Non-Goals:
- Goals:
- Implement a bottom-fixed ToastStack with a configurable maxVisible (default 1).
- Keep older toasts in the DOM for transitions but not overwhelm the screen.
- Add offline-detection and a preload hook to prepare essential data/assets for offline users.
- Non-Goals:
- Do not remove existing toast behavior entirely; simply adapt it to a stacked model.

Decisions:
- UI: Introduce a ToastStack component mounted at the bottom of the viewport. Toasts are pushed into a stack with z-order = bottom-to-top. Only the top toast is fully visible; others are offset slightly and dimmed.
- Logic: Maintain a toast queue in ToastContext; render with maxVisible = 1 by default. When a new toast arrives, push it to the stack and animate the entrance; when dismissed, remove it and reveal the next one.
- Animation: Use CSS/JS transitions for vertical stacking and fade/slide effects. Ensure stacking height remains bounded.
- Offline: Implement an OfflinePreload hook that fetches or caches critical assets / strings during online time so offline users have a baseline experience.
- Integration: Continue using existing ToastContext/ToastManager; the stack is an additional presentation layer, not a replacement.

Migration Plan:
- Add ToastStack component and export from UI layer.
- Update ToastManager to enqueue toasts into the stack (if not already supported).
- Implement maxVisible logic and stack rendering in a single component.
- Implement OfflinePreload hook and wire into the app's offline handling flow.
- QA to ensure one visible toast, stacked back-ups, and no floods; test offline path for preload.

Risks / Mitigations:
- Risk: Regaining perf cost due to complex stacking; Mitigation: cap stack height and use efficient transitions.
- Risk: Interactions with existing toasts; Mitigation: keep one consistent entry point for toasts.

Open Questions:
- What should be the exact maxVisible default? (Set to 1 here; allow override via config)
- How should offline preload handle dynamic content that changes when online again?
