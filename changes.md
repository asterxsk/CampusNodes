# Changelog

## 8.6.0 (Current)
-   **UI**: **Desktop Nav Refined**: Navbar expands naturally based on content width, Cart moved below Profile for cleaner layout.
-   **FEATURE**: **Chat Cleanup**: "Clear Chat" now deletes messages for BOTH users. Added auto-cleanup for messages older than 24h.
-   **FIX**: **Cart Pricing**: Fixed issue where prices displayed as 0 due to formatting characters. Removed double currency symbols.
-   **SEC**: **Signup**: Enforced strict password rules (8+ chars, upper, lower, number) and valid name checks.
-   **PERF**: **Database**: Optimized indexes and removed redundant RLS policies for 8+ tables.

## 8.5.15
-   **PERF**: **PixelGrid Optimization**: Dynamic node density based on screen size. Caps at 800 nodes, throttled to target FPS (20-30), pauses when tab hidden.
-   **PERF**: **GPU Acceleration**: Added `will-change`, `transform: translateZ(0)` hints for smoother animations.
-   **UI**: **Smooth Scroll**: Added `scroll-behavior: smooth` for smooth scrolling throughout the site.
-   **UI**: **Fluid Containers**: Content now scales to fill available space on wide screens (max-w-[1800px]).
-   **UI**: **Responsive Grids**: Marketplace now shows up to 5 columns on 2xl screens.
-   **CSS**: Added `.gpu-accelerated`, `.contain-paint`, `.container-fluid` utility classes.

## 8.5.14
-   **FEATURE**: **Forum Likes**: Full like/unlike functionality with optimistic UI and real-time updates.
-   **FEATURE**: **Forum Comments**: Comment counts now display in real-time next to posts.
-   **FIX**: **Cart Button**: Now properly appears on mobile (top-right corner) when items are added. Toast feedback on add to cart.
-   **UI**: **Forum Real-time**: Posts, likes, and comments now auto-refresh when updated by anyone.
-   **UI**: **Version Notes**: Updated patch notes in version banner with current changes.

## 8.5.13
-   **FEATURE**: **Cart Button**: Now dynamically appears only when 1+ items are added to cart, with smooth animations.
-   **FIX**: **Chat Notifications**: Notification badges now properly update in real-time for both mobile and desktop.
-   **FIX**: **Mobile Chat Keyboard**: Chat interface now dynamically adjusts height when keyboard opens (no more content going too high).
-   **UI**: **Mobile Layout**: Reduced top padding on all pages from pt-24/pt-32 to pt-4 on mobile devices (content starts closer to top).
-   **DB**: **Cleanup Script**: Added `cleanup_unverified_users.sql` to automatically delete user accounts that don't complete OTP verification within 24 hours.

## 8.5.12
-   **UI**: **Desktop Nav**: Fine-tuned the expanded width to 640px to eliminate excess space while preventing clipping.

## 8.5.11

## 8.5.10

## 8.5.9

## 8.5.8

## 8.5.7

## 8.5.6

## 8.5.5
-   **UI**: **Navigation**: Chat button in desktop top-right now correctly opens the Chat Popup instead of navigating to page.

## 8.5.4

## 8.5.3
-   **FIX**: **Forum Comments**: Added toast feedback (success/error) for posting comments.
-   **DB**: **Schema**: Added SQL script (`fix_forum_comments.sql`) to create missing `post_comments` table and enable RLS/Realtime.

## 8.5.2

## 8.5.1

## 8.5.0

## 8.4.1

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
