# Changelog

## 7.7.5 (Current)
-   **UI**: Collapsed sidebar now shows logo and has better center alignment.

## 7.7.4
-   **UI**: Sidebar menu items now span full width when expanded.
-   **UI**: Page content now responds dynamically to sidebar state.

## 7.7.3
-   **FIX**: Mobile chat overlay now extends to bottom of screen.
-   **UI**: Discover People section now left-aligned on mobile.

## 7.7.2
-   **UI**: Collapsed sidebar is now a floating pill, centered vertically with no wasted space.

## 7.7.1
-   **UI**: Fixed sidebar spacing and alignment when collapsed.
-   **UI**: Version banner icons now turn white with glowing background on hover.

## 7.7.0
-   **PERF**: Optimized PixelGrid - monochrome nodes, faster transitions, preloaded during loading.
-   **UI**: Themed toast notifications for signup instead of browser alerts.

## 7.6.2
-   **UI**: Mobile nav redesigned - Profile centered, Connections added, floating home button in top-left.

## 7.6.1
-   **UI**: Sidebar items now left-aligned with logo and span full width when expanded.

## 7.6.0
-   **UI**: New Pixel LED grid background replaces heavy 3D icosahedrons.
-   **PERF**: Removed Three.js 3D scene for faster loading and lower resource usage.
-   **FIX**: Preloader text now wraps correctly on smaller screens.

## 7.5.0
-   **UI**: Fixed sidebar layout and logo alignment with menu items.

## 7.4.9
-   **OPT**: Removing a friend now deletes all chat messages with them (storage optimization).

## 7.4.8
-   **FIX**: Signup Email Verification now has "Resend Code" and properly creates profiles after verification.
-   **FIX**: Profile edits now sync correctly to Connections page.
-   **UX**: Mobile Chat is now fullscreen with Bottom Bar visibility retained (Z-Index fix).

## 7.4.7
-   **UI**: Redesigned mobile bottom bar (Services, Market, Home, Chat, Profile).

## 7.4.4
-   **FEAT**: Added "Pending Requests" management in Connections.
-   **UX**: "Remove Friend" button is now always visible.

## 7.4.3
-   **FEAT**: Added "Pending Requests" section to Connections page with Accept/Decline actions.
-   **UX**: Made "Remove Friend" button always visible in Your Circle.
-   **FIX**: Resolved `ReferenceError: showPatchNotes is not defined`.

## 7.4.2
-   **FIX**: Resolved `ReferenceError: handleUserClick is not defined` in mobile sidebar.
-   **FEAT**: Implemented End-to-End Encryption for Chat (Client-side AES).
-   **FIX**: Resolved `ReferenceError: menuItems is not defined` in Sidebar.
-   **FIX**: Restored missing Desktop Sidebar.
-   **FIX**: Optimized Version Banner animations and performance (removed blur).
