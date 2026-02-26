## ADDED Requirements

### Requirement: bottom-aligned toast stack
The system SHALL present a bottom-aligned stack of toasts where only the newest toast is fully visible and older toasts are visually stacked behind it.

#### Scenario: New toast arrival
- WHEN a new toast is emitted
- THEN the new toast appears at the bottom, the existing toast shifts upward with a smooth animation, and only the newest toast remains fully visible.

#### Scenario: Dismiss top toast
- WHEN the visible toast is dismissed
- THEN the next toast in the stack becomes visible and animates into place from the bottom.

#### Scenario: Stack height cap
- WHEN the stack reaches the maximum visible height
- THEN older toasts are kept in the DOM for animation but are not individually visible unless the top toast is dismissed.

### Requirement: offline preload integration
The system SHALL detect offline state and preload essential data/assets so the user experience remains usable while offline.

#### Scenario: Offline mode detected
- WHEN network is unavailable
- THEN an offline toast is shown and the stack does not flood with additional toasts.

## Impact

This spec affects the ToastStack component and the ToastManager integration, plus a lightweight offline preload hook.
