import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ShoppingCart, Menu, X, Bitcoin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { name: 'Rólunk', page: 'About' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`
        :root {
          --crypto-gold: #F7931A;
          --crypto-dark: #0a0a0a;
          --crypto-gray: #1a1a1a;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #F7931A #1a1a1a;
        }
        *::-webkit-scrollbar {
          width: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        *::-webkit-scrollbar-thumb {
          background: #F7931A;
          border-radius: 4px;
        }
      `}</style>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7931A] to-[#f5a623] flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <Bitcoin className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold">
                Crypto<span className="text-[#F7931A]">Club</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`relative text-sm font-medium tracking-wide transition-colors hover:text-[#F7931A] ${
                    currentPageName === link.page ? 'text-[#F7931A]' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                  {currentPageName === link.page && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#F7931A]"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Link
                to={createPageUrl('Cart')}
                className="relative p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:text-[#F7931A] transition-colors" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7931A] text-black text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
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
              className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 text-lg font-medium ${
                      currentPageName === link.page ? 'text-[#F7931A]' : 'text-gray-300'
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
      <footer className="bg-[#0a0a0a] border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7931A] to-[#f5a623] flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-bold">
                  Crypto<span className="text-[#F7931A]">Club</span>
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                Mi is befektetünk, de nem csak coinokba, hanem stílusba is. 
                Nálunk a póló nem csak egy ruha, hanem egy életérzés.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Navigáció</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.page}>
                    <Link
                      to={createPageUrl(link.page)}
                      className="text-gray-400 hover:text-[#F7931A] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Információk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Gyors szállítás</li>
                <li>Biztonságos fizetés</li>
                <li>Könnyű visszaküldés</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CryptoClub. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>
  );
}