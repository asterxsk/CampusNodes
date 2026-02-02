# Changelog

## 8.4.1 (Current)
-   **FIX**: **Mobile Nav**: Fixed bottom bar not sticking (removed problematic transform).
-   **FIX**: **Messages**: Page now uses fixed positioning to prevent scrolling issues with bottom bar.
-   **FIX**: **Clear Chat**: Now properly clears only user's sent messages (RLS limitation) and updates UI correctly.
-   **NOTE**: Forum already has real-time updates for new posts.

## 8.4.0

## 8.3.9

## 8.3.8

## 8.3.7

## 8.3.6

## 8.2.0

## 8.1.0
-   **UI**: **Desktop Nav**: Replaced Sidebar with a Floating Top Bar ("Glass Pill" design).
-   **UI**: **Layout**: Removed left sidebar padding for a full-width desktop layout.
-   **UI**: **Profile**: Moved to fixed top-right corner.
-   **FEATURE**: **Forum**: Added as a top-level navigation item.

## 8.0.0
-   **FEATURE**: **Social Feed (Forum)**: Added a new page for campus-wide posts (`/forum`).
-   **UI**: **Mobile Nav**: Reordered icons (Home, Services, Market, Chat, Profile).
-   **UI**: **Services Sheet**: "Services" button now opens a slide-up drawer to select Gigs or Forum.
-   **DB**: Added `posts` and `post_likes` tables with RLS.

## 7.9.5
-   **UI**: **Sidebar**: Switched to edge-to-edge selection style in expanded mode (Supabase-like).
-   **UI**: **Polish**: Refined active states for better visual hierarchy.

## 7.9.4
-   **UI**: **Sidebar Refactor**: Minimized sidebar now displays centered icons for all navigation items (Market, Services, Connections, Chat).
-   **UI**: **Cleanup**: Removed the global floating chat button (FAB) in favor of the sidebar "Chat" link.
-   **FIX**: Navbar logic now properly handles collapsed state visibility.

## 7.9.0
-   **FIX**: ChatWidget crash resolved by adding missing `openAuthModal` import.
-   **DEBUG**: Comprehensive debug logging added for OTP verification flow.
-   **DEPLOY**: Switched to Vercel as primary deployment platform (from GitHub Pages).
-   **DOC**: Updated `publish.md` with Vercel deployment instructions.

## 7.8.5
-   **UI**: Unified Sidebar alignment (Logo/Items/Toggle aligned to px-5).
-   **UI**: Added "Messages" link directly to the desktop sidebar.
-   **UI**: Chat floating button is now visible for all users (prompts login on click).
-   **DOC**: Updated `publish.md` and `README.md` with new release rules and features.

## 7.8.4

## 7.8.3

## 7.8.2
-   **UI**: Mobile nav now shows Services instead of Home.

## 7.8.1
-   **UI**: Sidebar toggle button moved below logo and above navigation.
-   **UI**: Improved sidebar icon alignment when collapsed.

## 7.8.0
-   **FEATURE**: Dedicated Messages page for mobile.
-   **UI**: Mobile nav now taller with text labels under icons.
-   **UI**: Home button integrated into bottom bar (removed floating button).

## 7.7.5
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
