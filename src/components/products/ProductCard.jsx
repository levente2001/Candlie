import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  const badgeColors = {
    new: 'bg-[var(--candlie-pink-primary)]',
    sale: 'bg-[var(--candlie-pink-secondary)]',
    limited: 'bg-black',
  };

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === 'ONE');
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        size: 'ONE',
        quantity: 1,
      });
    }
    
    localStorage.setItem('cryptoCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={createPageUrl(`ProductDetail?id=${product.id}`)}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-white rounded-2xl overflow-hidden border border-black/10 hover:border-[var(--candlie-pink-primary)]/40 transition-all duration-500">
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-4 left-4 z-10 ${badgeColors[product.badge]} px-3 py-1 rounded-full text-xs font-bold text-white uppercase`}>
              {product.badge === 'new' && 'Új'}
              {product.badge === 'sale' && 'Akció'}
              {product.badge === 'limited' && 'Limitált'}
            </div>
          )}

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#f7f2f7] to-white">
            <motion.img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.5 }}
            />
            {product.hover_image_url && (
              <motion.img
                src={product.hover_image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Overlay Actions */}
            <motion.div
              className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addToCart}
                className="w-12 h-12 bg-[var(--candlie-pink-secondary)] rounded-xl flex items-center justify-center text-white hover:bg-[var(--candlie-pink-primary)] transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black border border-black/10"
              >
                <Eye className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-semibold text-black group-hover:text-[var(--candlie-pink-primary)] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xl font-semibold text-[var(--candlie-pink-secondary)]">
                {product.price?.toLocaleString('hu-HU')} Ft
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-black/40 line-through">
                  {product.original_price?.toLocaleString('hu-HU')} Ft
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
