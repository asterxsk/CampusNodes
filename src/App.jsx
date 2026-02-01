import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext'; // Import UIProvider
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import CustomCursor from './components/ui/CustomCursor';
import Preloader from './components/ui/Preloader';
import Hero from './components/hero/Hero';
import PixelGrid from './components/hero/PixelGrid';

import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import Connections from './pages/Connections';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import ProductDetails from './pages/ProductDetails';

import VersionBanner from './components/ui/VersionBanner';
import AuthModal from './components/ui/AuthModal'; // Import AuthModal
import ChatWidget from './components/chat/ChatWidget';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Wrapper to handle background visibility based on route
const GlobalBackground = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';

  return (
    <div
      className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isHome ? 'opacity-100 pointer-events-auto' : 'opacity-10 pointer-events-none'}`}
    >
      <PixelGrid />
    </div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { isSidebarCollapsed } = useUI();
  const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-accent selection:text-white cursor-none relative z-10 transition-all duration-300 ${isHome ? 'bg-transparent' : 'bg-background'} ${isSidebarCollapsed ? 'md:pl-0' : 'md:pl-[260px]'}`}>
      {children}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <UIProvider>
          <Router>
            <Preloader />
            <ScrollToTop />
            <VersionBanner />

            {/* Global Persistent 3D Background */}
            <GlobalBackground />

            <Sidebar />

            <MainLayout>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/market" element={<Marketplace />} />
                <Route path="/services" element={<Services />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/market/:id" element={<ProductDetails />} />
              </Routes>
            </MainLayout>

            <AuthModal />
            <ChatWidget />
            <CustomCursor />
          </Router>
        </UIProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
