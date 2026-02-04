import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
    setCart(savedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cryptoCart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    updateCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-semibold mb-8"
        >
          Kosár
        </motion.h1>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-black/40" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">A kosarad üres</h2>
            <p className="text-black/60 mb-8">Még nem adtál hozzá termékeket a kosaradhoz.</p>
            <Link
              to={createPageUrl('Products')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--candlie-pink-secondary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--candlie-pink-primary)]/25 transition-all"
            >
              Vásárlás megkezdése
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white rounded-2xl p-4 md:p-6 border border-black/10"
                  >
                    <div className="flex gap-4 md:gap-6">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-[#f0f0f0] flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-black truncate">{item.name}</h3>
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-black/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-[#f0f0f0] rounded-lg">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="w-10 h-10 flex items-center justify-center text-black/40 hover:text-black"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="w-10 h-10 flex items-center justify-center text-black/40 hover:text-black"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-lg font-semibold text-[var(--candlie-pink-secondary)]">
                            {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link
                to={createPageUrl('Products')}
                className="inline-flex items-center gap-2 text-black/60 hover:text-black mt-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Vásárlás folytatása
              </Link>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-6 border border-black/10 sticky top-28">
                <h2 className="text-xl font-semibold mb-6">Összesítés</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-black/60">
                    <span>Részösszeg</span>
                    <span>{total.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between text-black/60">
                    <span>Szállítás</span>
                    <span className="text-black/50">A pénztárnál választod ki</span>
                  </div>
                  <div className="border-t border-black/10 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Fizetendő (szállítás nélkül)</span>
                      <span className="text-[var(--candlie-pink-secondary)]">{total.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </div>

                  {total < 15000 && (
                    <p className="text-sm text-[var(--candlie-pink-secondary)]">
                      Még {(15000 - total).toLocaleString('hu-HU')} Ft és ingyenes a szállítás!
                    </p>
                  )}
                </div>

                <Link to={createPageUrl('Checkout')}>
                  <Button className="w-full h-14 bg-[var(--candlie-pink-secondary)] text-white font-semibold text-lg rounded-xl hover:shadow-lg hover:shadow-[var(--candlie-pink-primary)]/25 transition-all">
                    Pénztár
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-black/50 text-center mt-4">
                  Biztonságos fizetés • 14 napos visszaküldés
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
