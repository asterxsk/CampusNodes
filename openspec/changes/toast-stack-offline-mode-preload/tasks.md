## 1. Setup

- [ ] 1.1 Initialize toast stack UI container at bottom of viewport with maxVisible = 1
- [ ] 1.2 Create ToastStack component and integrate with ToastContext/ToastManager

## 2. Core Implementation

- [ ] 2.1 Implement stacking logic: new toasts push stack; only the latest visible
- [ ] 2.2 Animate transitions between stack states (enter/exit)
- [ ] 2.3 Ensure older toasts are off-screen/hidden but kept in DOM for animation
- [ ] 2.4 Add bounded height to stack; prevent overflow

## 3. Offline Preload

- [ ] 3.1 Detect offline state and implement an OfflinePreload hook
- [ ] 3.2 Preload essential data/assets for offline UX
- [ ] 3.3 Integrate offline preload results with ToastStack behavior

## 4. Tests / QA
- [ ] 4.1 Verify only one visible toast; stacking behind works as expected
- [ ] 4.2 Simulate offline mode; verify offline toast precedence and no flood
- [ ] 4.3 Regression: run existing toasts and ensure current behavior remains
