import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { HashRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import Navigation from './components/layout/Navigation';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Preloader from './components/ui/Preloader';
import Hero from './components/hero/Hero';
import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import Forum from './pages/Forum';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import ServiceDetails from './pages/ServiceDetails';
import ForgotPassword from './pages/ForgotPassword';
import VersionButton from './components/ui/VersionButton';
import AuthModal from './components/ui/AuthModal';
import ProfileModal from './components/ui/ProfileModal';
import EditProfileModal from './components/ui/EditProfileModal';
import ChangePasswordModal from './components/ui/ChangePasswordModal';
import MessagesModal from './components/chat/MessagesModal';
import CartIcon from './components/layout/CartIcon';
import LiquidEther from './components/hero/LiquidEther';
import ChatFAB from './components/chat/ChatFAB';
import ClickSpark from './components/effects/ClickSpark';
import OnboardingFlow from './components/ui/OnboardingFlow';
import Offline404 from './components/offline/Offline404';
import { useOfflinePreload } from './hooks/useOfflinePreload';
import ErrorBoundary from './components/ui/ErrorBoundary';

const routeOrder = ['/', '/market', '/services', '/forum', '/connections'];

const MemoHero = memo(Hero);
const MemoMarketplace = memo(Marketplace);
const MemoServices = memo(Services);
const MemoForum = memo(Forum);
const MemoConnections = memo(Connections);

const routeComponents = {
  '/': MemoHero,
  '/market': MemoMarketplace,
  '/services': MemoServices,
  '/forum': MemoForum,
  '/connections': MemoConnections
};

const PageCache = memo(() => (
  <div className="fixed w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
    {routeOrder.map(route => {
      const Component = routeComponents[route];
      return Component ? <div key={route}><Component /></div> : null;
    })}
  </div>
));

const FluidPage = memo(({ route, progress, index }) => {
  const Component = routeComponents[route];
  const basePosition = index * 100;
  const currentPosition = basePosition - (progress * 100);
  const velocity = Math.abs(progress - Math.floor(progress));
  const blurAmount = velocity > 0.1 && velocity < 0.9 ? 2 + (velocity * 3) : 0;
  const isVisible = currentPosition > -150 && currentPosition < 150;

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        transform: `translateX(${currentPosition}%)`,
        filter: `blur(${blurAmount}px)`,
        zIndex: 50 + index,
        willChange: 'transform, filter'
      }}
    >
      {Component && <Component />}
    </div>
  );
});

const FluidConveyor = ({ from, to, pages, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const totalPages = pages.length + 2;
  const pageRoutes = [from, ...pages, to];

  useEffect(() => {
    const duration = 250 + (pages.length * 80);
    let rafId;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Snappier easing (quintic easeOut)
      const easedProgress = 1 - Math.pow(1 - rawProgress, 5);

      setProgress(easedProgress * (totalPages - 1));

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setTimeout(onComplete, 50);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [from, to, pages.length, totalPages, onComplete]);

  return (
    <>
      {pageRoutes.map((route, index) => (
        <FluidPage
          key={`${route}-${index}`}
          route={route}
          progress={progress}
          index={index}
        />
      ))}
    </>
  );
};

const RouteController = () => {
  const location = useLocation();
  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const [pendingPath, setPendingPath] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationConfig, setAnimationConfig] = useState(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const newPath = location.pathname;
    const oldPath = prevPathRef.current;

    if (newPath === oldPath || isAnimating) return;

    const oldIndex = routeOrder.indexOf(oldPath);
    const newIndex = routeOrder.indexOf(newPath);

    if (oldIndex !== -1 && newIndex !== -1) {
      const pagesBetween = [];
      const direction = newIndex > oldIndex ? 1 : -1;

      for (let i = oldIndex + direction; i !== newIndex; i += direction) {
        pagesBetween.push(routeOrder[i]);
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingPath(newPath);
      setAnimationConfig({ from: oldPath, to: newPath, pages: pagesBetween });
      setIsAnimating(true);
    } else {
      setDisplayedPath(newPath);
    }

    prevPathRef.current = newPath;
  }, [location.pathname, isAnimating]);

  const handleAnimationComplete = useCallback(() => {
    if (pendingPath) {
      setDisplayedPath(pendingPath);
      setPendingPath(null);
    }
    setIsAnimating(false);
    setAnimationConfig(null);
  }, [pendingPath]);

  const getComponentForPath = (path) => {
    const componentMap = {
      '/': <MemoHero />,
      '/market': <MemoMarketplace />,
      '/services': <MemoServices />,
      '/forum': <MemoForum />,
      '/connections': <MemoConnections />,
      '/login': <Login />,
      '/signup': <Signup />,
      '/profile': <ProtectedRoute><Profile /></ProtectedRoute>,
      '/messages': <ProtectedRoute><Messages /></ProtectedRoute>,
      '/settings': <ProtectedRoute><Settings /></ProtectedRoute>,
      '/payment': <ProtectedRoute><Payment /></ProtectedRoute>,
      '/cart': <ProtectedRoute><Cart /></ProtectedRoute>,
      '/checkout': <ProtectedRoute><Checkout /></ProtectedRoute>,
      '/forgot-password': <ForgotPassword />,
      '/book': <ProtectedRoute><Checkout /></ProtectedRoute>
    };

    if (componentMap[path]) return componentMap[path];
    if (path.startsWith('/market/')) return <ProductDetails />;
    if (path.startsWith('/services/')) return <ServiceDetails />;
    return <MemoHero />;
  };

  return (
    <>
      <PageCache />

      {!isAnimating && (
        <div className="relative">
          {getComponentForPath(displayedPath)}
        </div>
      )}

      {isAnimating && animationConfig && (
        <>
          <div className="fixed inset-0 bg-black z-0" />
          <FluidConveyor
            from={animationConfig.from}
            to={animationConfig.to}
            pages={animationConfig.pages}
            onComplete={handleAnimationComplete}
          />
        </>
      )}
    </>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const isHomeRoute = (pathname) => pathname === '/' || pathname === '/campusnodes/' || pathname === '/CampusNodes/';

const GlobalBackground = () => {
  const { pathname } = useLocation();
  const isHome = isHomeRoute(pathname);

  return (
    <div className="fixed inset-0 z-0 bg-black">
      {isHome && (
        <div className="absolute inset-0 z-0">
          <LiquidEther />
        </div>
      )}
      <div
        className={`absolute inset-0 z-10 bg-black transition-opacity duration-1000 ${isHome ? 'opacity-30' : 'opacity-95'}`}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

const MainLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isHome = isHomeRoute(pathname);

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-accent selection:text-white relative z-10 ${isHome ? 'bg-transparent' : 'bg-background'}`}>
      {children}
    </div>
  );
};

import AdminConsoleButton from './components/admin/AdminConsoleButton';
import AdminConsole from './components/admin/AdminConsole';

const AppContent = memo(() => {
  const { user } = useAuth();
  const location = useLocation();
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  // Preload essential assets for offline experience

  useOfflinePreload([
    '/offline/essential.json',
    '/assets/config.json',
    '/assets/logo.png'
  ]);

  // Connectivity state is now managed in the parent <App /> component
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Offline 404 flag that blocks the app when offline
  // (updated below in the effect)

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('campus-nodes-onboarding') === 'completed';
    const isHomePage = location.pathname === '/';

    if (!hasCompletedOnboarding && isHomePage && !user) {
      // Disabled temporarily due to bugs
      // const timer = setTimeout(() => setShowOnboarding(true), 500);
      // return () => clearTimeout(timer);
    }
  }, [location.pathname, user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('campus-nodes-onboarding', 'completed');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('campus-nodes-onboarding', 'skipped');
    setShowOnboarding(false);
  };

  return (
    <>
      <Preloader />
      <ScrollToTop />
      <VersionButton />
      <GlobalBackground />
      <Navigation />

      <ClickSpark sparkColor="#3b82f6" sparkSize={8} sparkRadius={20} sparkCount={10} duration={600}>
        <MainLayout>
          <RouteController />
        </MainLayout>
      </ClickSpark>

      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <AuthModal />
      <ProfileModal />
      <EditProfileModal />
      <ChangePasswordModal />
      <MessagesModal />
      <ChatFAB />
      <CartIcon />

      <AdminConsoleButton onClick={() => setIsAdminConsoleOpen(true)} />
      <AdminConsole isOpen={isAdminConsoleOpen} onClose={() => setIsAdminConsoleOpen(false)} />
    </>
  );
});

const App = () => {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const updateOffline = () => setOffline(!navigator.onLine);
    window.addEventListener('offline', updateOffline);
    window.addEventListener('online', updateOffline);
    updateOffline();
    return () => {
      window.removeEventListener('offline', updateOffline);
      window.removeEventListener('online', updateOffline);
    };
  }, []);

  if (offline) {
    return <Offline404 />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <UIProvider>
            <ToastProvider>
              <ModalProvider>
                <ThemeProvider>
                  <AdminProvider>
                    <Router>
                      <AppContent />
                    </Router>
                  </AdminProvider>
                </ThemeProvider>
              </ModalProvider>
            </ToastProvider>
          </UIProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
