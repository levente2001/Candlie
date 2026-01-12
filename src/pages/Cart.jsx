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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-8"
        >
          Kosár
        </motion.h1>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">A kosarad üres</h2>
            <p className="text-gray-400 mb-8">Még nem adtál hozzá termékeket a kosaradhoz.</p>
            <Link
              to={createPageUrl('Products')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all"
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
                    className="bg-[#1a1a1a] rounded-2xl p-4 md:p-6 border border-white/5"
                  >
                    <div className="flex gap-4 md:gap-6">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-[#252525] flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white truncate">{item.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">Méret: {item.size}</p>
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-[#252525] rounded-lg">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-lg font-bold text-[#F7931A]">
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
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mt-4 transition-colors"
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
              <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 sticky top-28">
                <h2 className="text-xl font-bold mb-6">Összesítés</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Részösszeg</span>
                    <span>{total.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Szállítás</span>
                    <span className="text-gray-500">A pénztárnál választod ki</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Fizetendő (szállítás nélkül)</span>
                      <span className="text-[#F7931A]">{total.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </div>

                  {total < 15000 && (
                    <p className="text-sm text-[#F7931A]">
                      Még {(15000 - total).toLocaleString('hu-HU')} Ft és ingyenes a szállítás!
                    </p>
                  )}
                </div>

                <Link to={createPageUrl('Checkout')}>
                  <Button className="w-full h-14 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-semibold text-lg rounded-xl hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all">
                    Pénztár
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center mt-4">
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