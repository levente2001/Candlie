import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

    const handleStorage = () => {
      const cart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cartUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cartUpdated', handleStorage);
    };
  }, []);

  const isAdminPage = currentPageName?.toLowerCase().includes('admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  const navLinks = [
    { name: 'Főoldal', page: 'Home' },
    { name: 'Termékek', page: 'Products' },
    { name: 'Candlie', page: 'Candlie' },
    { name: 'Kapcsolat', page: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <style>{`
        :root {
          --crypto-gold: var(--candlie-pink-primary);
          --crypto-dark: #f6f6f6;
          --crypto-gray: #ffffff;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: var(--candlie-pink-primary) #f6f6f6;
        }
        *::-webkit-scrollbar {
          width: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #f6f6f6;
        }
        *::-webkit-scrollbar-thumb {
          background: var(--candlie-pink-primary);
          border-radius: 4px;
        }
      `}</style>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <span className="text-3xl font-semibold tracking-[0.35em] text-black">
                CANDLIE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`relative text-sm font-semibold tracking-wide transition-colors hover:text-[var(--candlie-pink-primary)] ${
                    currentPageName === link.page ? 'text-[var(--candlie-pink-primary)]' : 'text-black/70'
                  }`}
                >
                  {link.name}
                  {currentPageName === link.page && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--candlie-pink-primary)]"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Link
                to={createPageUrl('Cart')}
                className="relative p-3 rounded-xl bg-white hover:bg-black/5 transition-colors group border border-black/5"
              >
                <ShoppingCart className="w-5 h-5 group-hover:text-[var(--candlie-pink-primary)] transition-colors" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--candlie-pink-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl bg-white hover:bg-black/5 transition-colors border border-black/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/98 backdrop-blur-xl border-t border-black/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 text-lg font-medium ${
                      currentPageName === link.page ? 'text-[var(--candlie-pink-primary)]' : 'text-black/70'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-semibold tracking-[0.3em] text-black">
                  CANDLIE
                </span>
              </div>
              <p className="text-black/70 max-w-md">
                A kedvenc italod, gyertya formában!
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Navigáció</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.page}>
                    <Link
                      to={createPageUrl(link.page)}
                      className="text-black/60 hover:text-[var(--candlie-pink-primary)] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Információk</h4>
              <ul className="space-y-2 text-sm text-black/60">
                <li>
                  <Link to={createPageUrl('Aszf')} className="hover:text-[var(--candlie-pink-primary)] transition-colors">
                    ÁSZF
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl('Privacy')} className="hover:text-[var(--candlie-pink-primary)] transition-colors">
                    Adatkezelési tájékoztató
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-black/10 mt-12 pt-8 text-center text-black/50 text-sm">
            © {new Date().getFullYear()} CANDLIE. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>
  );
}
