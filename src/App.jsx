import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import CustomCursor from './components/ui/CustomCursor';
import Preloader from './components/ui/Preloader';
import Hero from './components/hero/Hero';
import Scene3D from './components/hero/Scene3D';

import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import Connections from './pages/Connections';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import ProductDetails from './pages/ProductDetails';

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
  const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/'; // Handle potential subpath issues

  // Debug log
  useEffect(() => {
    console.log("Current Path:", location.pathname, "Is Home:", isHome);
  }, [location.pathname]);

  return (
    <div
      className={`fixed inset-0 z-0 transition-opacity duration-1000 ${isHome ? 'opacity-100 pointer-events-auto' : 'opacity-10 pointer-events-none'}`}
    >
      <Scene3D />
    </div>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/campusnodes/' || location.pathname === '/CampusNodes/';

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-accent selection:text-white pl-20 cursor-none relative z-10 transition-colors duration-500 ${isHome ? 'bg-transparent' : 'bg-background'}`}>
      <CustomCursor />
      <Sidebar />
      {children}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Preloader />
          <ScrollToTop />

          {/* Global Persistent 3D Background */}
          <GlobalBackground />

          <MainLayout>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/friends" element={<Friends />} />
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
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
