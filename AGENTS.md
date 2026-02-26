# OpenCode Agent Context & System Profile

## Hardware Environment
- **CPU:** Intel Core i7-12600H (12 Cores / 16 Threads)
- **GPU:** NVIDIA GeForce RTX 4050 Laptop GPU
- **RAM:** 16GB DDR5
- **Storage:** 2TB SSD (3Gbps throughput)

## Project Goals
- **Optimization:** Maximize performance for local development and execution.
- **Efficiency:** Streamline workflows to respect hardware thermal and memory limits.
- **Persistence:** Maintain a high-level overview of the environment to prevent redundant configuration steps.

## Developer Instructions
- Prioritize efficient code that takes advantage of multi-core processing (i7-12600H).
- Utilize GPU acceleration where applicable (CUDA/Tensor Cores on the RTX 4050).
- Keep an eye on memory usage, as 16GB is shared with system processes and development tools.

## Session History
- [2026-02-05] Initial system profile established.

---

# AGENTS.md - Guidelines for AI Agents Working on This Codebase

## Project Overview
Campus Nodes - A campus marketplace and social platform built with React 19, Vite, Supabase, Tailwind CSS, and Framer Motion.

---

## Essential Commands

### Development & Testing
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Production build
npm run lint         # Run ESLint (fixes most issues automatically)
npm run preview      # Preview production build
```

### Linting & Quality
- ESLint is configured with React Hooks and React Refresh rules
- Run `npm run lint` before committing changes
- No test framework is currently configured

---

## Code Style Guidelines

### File Organization
```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Modal, etc.)
│   ├── layout/       # Navigation, Navbar, MobileNavbar
│   ├── chat/         # Chat-related components
│   ├── forum/        # Forum-related components
│   └── hero/         # Homepage hero components
├── pages/            # Route-level components
├── context/          # Context providers (Auth, Cart, UI, Modal, Toast)
├── lib/              # Utilities (supabaseClient, encryption)
├── data/             # Static data (marketItems)
└── main.jsx          # Entry point
```

### Import Order & Conventions
```jsx
// 1. React imports
import React, { useState, useEffect, useCallback } from 'react';

// 2. Third-party libraries (grouped)
import { motion, useMotionValue } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, MessageSquare, X } from 'lucide-react';

// 3. Context hooks
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

// 4. Local components
import Button from '../components/ui/Button';

// 5. Data/constants
import { MARKET_ITEMS } from '../data/marketItems';
```

### Naming Conventions
- **Components**: PascalCase (`CustomCursor`, `Button`)
- **Functions**: camelCase (`handleClick`, `fetchPosts`)
- **Constants**: UPPER_SNAKE_CASE or PascalCase for data (`MARKET_ITEMS`, `SERVICES_DATA`)
- **CSS classes**: kebab-case (`service-card`, `nav-item`)
- **Event handlers**: `handle` prefix (`handleSubmit`, `handleClick`)
- **Async functions**: `fetch` or `load` prefix (`fetchMessages`, `loadData`)
- **Boolean states**: `is` or `has` prefix (`isLoading`, `hasError`)
- **Props**: camelCase (`onClick`, `className`)

### Component Structure
```jsx
// 1. Imports
// 2. Helper functions (outside component)
// 3. Component definition
const Component = ({ prop1, prop2 }) => {
    // 4. Hooks in order: useState -> useEffect -> useCallback -> useRef
    const [state, setState] = useState(initial);
    
    useEffect(() => {
        // Side effects
    }, [deps]);

    const handleEvent = useCallback(() => {
        // Event handlers
    }, [deps]);

    // 5. Derived values
    const computedValue = useMemo(() => {
        return state * 2;
    }, [state]);

    // 6. Early returns
    if (!condition) return null;

    // 7. JSX return
    return <div>{content}</div>;
};

// 8. Export
export default Component;
```

### React Best Practices
- **Use functional components with hooks** - No class components
- **Destructure props** at component signature
- **Avoid calling setState in useEffect** - Use `useState` initial value instead
- **Use useCallback** for event handlers passed to children
- **Use useMemo** for expensive computations
- **Clean up effects** - Always return cleanup function in useEffect
- **Avoid prop drilling** - Use context providers for shared state
- **Framer Motion** for animations - Use `motion.div`, `AnimatePresence`
- **GSAP** for entrance animations - Use anime.js for stagger animations

### Error Handling
```jsx
const fetchData = async () => {
    try {
        const { data, error } = await supabase
            .from('table')
            .select('*');
        
        if (error) throw error;
        
        setData(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
        // Optionally: setError(err.message);
    }
};
```

### Styling Guidelines
- **Primary**: Tailwind CSS utility classes
- **Custom styles**: Inline style objects only for dynamic values
- **Animations**: Framer Motion for interactive, anime.js for entrance
- **Theme colors**:
  - Background: `#050505` (nearly black)
  - Surface: `#121212` (dark gray)
  - Accent: `#3b82f6` (blue)
  - Primary: `#ffffff` (white)
- **Fonts**: Space Grotesk for display, Inter for body
- **Mobile-first**: Use `md:` and `lg:` prefixes for responsive design

### State Management Patterns
- **Global state**: Context providers (AuthContext, CartContext, UIContext)
- **Local state**: useState hook
- **Complex state**: useReducer or custom hooks
- **Server state**: Direct Supabase queries with realtime subscriptions
- **Realtime**: Use Supabase channels for live updates
- **Optimistic UI**: Update state immediately, revert on error

### TypeScript / Types
- Project uses JavaScript, not TypeScript
- Prop validation via PropTypes is NOT used
- Use JSDoc comments for complex props when needed

### ESLint Rules
- Unused imports: Error (comment with `// eslint-disable-next-line no-unused-vars` if intentional)
- React Hooks: Warning on exhaustive-deps (review before fixing)
- No console.log in production (use for debugging only)

### Supabase Patterns
```jsx
// Query
const { data, error } = await supabase
    .from('table')
    .select('*, related_table(field)')
    .eq('column', value)
    .order('created_at', { ascending: false });

// Insert
const { error } = await supabase
    .from('table')
    .insert({ field: value });

// Realtime subscription
const channel = supabase
    .channel('channel_name')
    .on('postgres_changes', { event: '*', table: 'table' }, callback)
    .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

### Comments & Documentation
- **No inline comments** for obvious code
- **JSDoc** for complex functions when needed
- **TODO comments** for future improvements
- **FIXME comments** for known issues

### Common Patterns
```jsx
// Animated entrance with anime.js
useEffect(() => {
    anime({
        targets: '.element-class',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 800
    });
}, []);

// Framer Motion hover effect
<motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
>
    {content}
</motion.div>

// Conditional rendering
{condition && <Component />}

// Null checks
user?.user_metadata?.avatar_url || fallbackValue

// Optional chaining
data?.map(item => item.id)
```

### Performance Guidelines
- **Code splitting**: Use lazy loading for pages when needed
- **Memoization**: Use React.memo for expensive components
- **Avoid inline functions** in render (use useCallback)
- **Avoid inline objects** in render (use useMemo)
- **Key props**: Always provide stable keys for lists
- **Image optimization**: Use WebP when possible, lazy load images
- **Supabase queries**: Select only needed columns

### Security Best Practices
- **Never commit**: API keys, secrets, or passwords
- **Supabase RLS**: Always enforce Row Level Security
- **User input**: Validate and sanitize before database operations
- **Authentication**: Use Supabase auth, never handle passwords directly
- **Encryption**: Use crypto-js for sensitive message content

### Git Workflow
- Branch from main
- Commit message format: `TYPE: Brief description`
- Types: FEAT, FIX, UI, PERF, SEC, BUILD, DOCS, REFACTOR
- Run `npm run lint` before committing
- Ensure build passes (`npm run build`)

### Browser Compatibility
- **Target**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **No IE support**
- **Mobile**: iOS 14+, Android 10+
- **Features**: Use web standards, avoid experimental APIs

---

## Quick Reference

### Available Contexts
- `useAuth()` - User authentication state
- `useCart()` - Shopping cart state
- `useUI()` - UI state (modals, chat, notifications)
- `useModal()` - Confirmation dialogs
- `useToast()` - Toast notifications

### Common Utilities
- `supabase` - Supabase client instance
- `encryptMessage/decryptMessage` - E2E encryption for chat
- `timeAgo()` - Relative time formatting

### Color Palette
```jsx
colors: {
    background: '#050505',
    surface: '#121212',
    primary: '#ffffff',
    accent: '#3b82f6',
}
```

### Key Libraries
- **Routing**: react-router-dom v7
- **Animations**: framer-motion, anime.js, gsap
- **Icons**: lucide-react
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v3
- **Build**: Vite v7

---

## Important Notes

1. **HashRouter** is used for routing (not BrowserRouter)
2. **Custom cursor** is enabled (hides default cursor)
3. **No testing framework** currently set up
4. **Real-time features** use Supabase subscriptions
5. **Dark mode only** - no light theme support
6. **Mobile-first** design approach
7. **Performance critical** - avoid re-renders
8. **Accessibility** - Use semantic HTML, ARIA labels where needed
