import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TrackPageView from '../components/TrackPageView';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Minus, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/products/ProductCard';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => base44.entities.Product.filter({ id: productId }),
    select: (data) => data[0],
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => base44.entities.Product.filter({ 
      is_active: true, 
      category: product?.category 
    }, '-created_date', 4),
    enabled: !!product?.category,
  });

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === 'ONE');
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        size: 'ONE',
        quantity: quantity,
      });
    }
    
    localStorage.setItem('cryptoCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl bg-[#eaeaea]" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4 bg-[#eaeaea]" />
              <Skeleton className="h-8 w-1/3 bg-[#eaeaea]" />
              <Skeleton className="h-32 w-full bg-[#eaeaea]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[var(--candlie-bg)]">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold mb-2">Termék nem található</h2>
          <Link to={createPageUrl('Products')} className="text-[var(--candlie-pink-primary)] hover:underline">
            Vissza a termékekhez
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)]">
      <TrackPageView pageName={`ProductDetail - ${product?.name || 'Unknown'}`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to={createPageUrl('Products')}
          className="inline-flex items-center gap-2 text-black/60 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Vissza a termékekhez
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative bg-white rounded-3xl overflow-hidden border border-black/10">
              {product.badge && (
                <div className={`absolute top-6 left-6 z-10 px-4 py-2 rounded-full text-sm font-bold text-white uppercase ${
                  product.badge === 'new' ? 'bg-[var(--candlie-pink-primary)]' :
                  product.badge === 'sale' ? 'bg-[var(--candlie-pink-secondary)]' : 'bg-black'
                }`}>
                  {product.badge === 'new' && 'Új'}
                  {product.badge === 'sale' && 'Akció'}
                  {product.badge === 'limited' && 'Limitált'}
                </div>
              )}
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="text-sm text-[var(--candlie-pink-secondary)] font-medium mb-2 uppercase tracking-wide">
              {product.category?.replace('_', ' ')}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-black mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-semibold text-[var(--candlie-pink-secondary)]">
                {product.price?.toLocaleString('hu-HU')} Ft
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-black/40 line-through">
                  {product.original_price?.toLocaleString('hu-HU')} Ft
                </span>
              )}
            </div>

            <p className="text-black/70 leading-relaxed mb-8">
              {product.description || 'Prémium minőségű, kézzel készített koktélgyertya, amely különleges illatával és hangulatával emeli a pillanatot.'}
            </p>

            {/* Product Info */}
            {(product.wax_type || product.weight || product.burn_time) && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.wax_type && (
                  <div className="bg-white border border-black/10 rounded-xl p-4">
                    <div className="text-xs text-black/50 mb-1">Alapanyag</div>
                    <div className="text-sm font-semibold">{product.wax_type}</div>
                  </div>
                )}
                {product.weight && (
                  <div className="bg-white border border-black/10 rounded-xl p-4">
                    <div className="text-xs text-black/50 mb-1">Súly</div>
                    <div className="text-sm font-semibold">{product.weight}</div>
                  </div>
                )}
                {product.burn_time && (
                  <div className="bg-white border border-black/10 rounded-xl p-4">
                    <div className="text-xs text-black/50 mb-1">Égési idő</div>
                    <div className="text-sm font-semibold">{product.burn_time}</div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-black/70 mb-3">Mennyiség</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl border border-black/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-black/40 hover:text-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-black/40 hover:text-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={addToCart}
              className={`w-full h-14 text-lg font-semibold rounded-xl transition-all ${
                addedToCart
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-[var(--candlie-pink-secondary)] hover:shadow-lg hover:shadow-[var(--candlie-pink-primary)]/25 text-white'
              }`}
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Hozzáadva!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Kosárba
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-semibold mb-8">Kapcsolódó termékek</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelated.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
