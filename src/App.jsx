import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
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

import VersionBanner from './components/ui/VersionBanner';
import AuthModal from './components/ui/AuthModal'; // Import AuthModal
import ProfileModal from './components/ui/ProfileModal';

import MessagesModal from './components/chat/MessagesModal';
import CartIcon from './components/layout/CartIcon';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import LiquidEther from './components/hero/LiquidEther';
import ChatFAB from './components/chat/ChatFAB';
import CustomCursor from './components/ui/CustomCursor';

// Wrapper to handle background visibility based on route
const GlobalBackground = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';

  return (
    <div className="fixed inset-0 z-0 bg-black">
      {/* Persistent Liquid Ether Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther />
      </div>

      {/* Dimming Overlay for non-home pages */}
      <div
        className={`absolute inset-0 z-10 bg-black transition-opacity duration-1000 ${isHome ? 'opacity-30' : 'opacity-85'}`}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';

  return (
    <div
      className={`min-h-screen text-white font-sans selection:bg-accent selection:text-white relative z-10 ${isHome ? 'bg-transparent' : 'bg-background'}`}
    >
      {children}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <UIProvider>
          <ToastProvider>
            <ModalProvider>
              <Router>
                <Preloader />
                <ScrollToTop />
                <VersionBanner />

                {/* Global Persistent 3D Background */}
                <GlobalBackground />

                <Navigation />

                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/market" element={<Marketplace />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/connections" element={<Connections />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/market/:id" element={<ProductDetails />} />
                    <Route path="/services/:id" element={<ServiceDetails />} />
                    <Route path="/book" element={<Checkout />} />
                  </Routes>
                </MainLayout>

                <AuthModal />
                <ProfileModal />
                <MessagesModal />
                <ChatFAB />
                <CustomCursor />
                <CartIcon />
              </Router>
            </ModalProvider>
          </ToastProvider>
        </UIProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
