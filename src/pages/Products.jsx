import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/products/ProductCard';
import TrackPageView from '../components/TrackPageView';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EditableText from '@/components/editable/EditableText';

const categories = [
  { id: 'all', name: 'Összes' },
  { id: 'bitcoin', name: 'Bitcoin' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'altcoin', name: 'Altcoin' },
  { id: 'meme', name: 'Meme' },
  { id: 'limited', name: 'Limitált' },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const activeProducts = products.filter(p => p.is_active !== false);

  const filteredProducts = activeProducts
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <TrackPageView pageName="Products" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <EditableText as="span" contentKey="products.hero.title_1" defaultValue="Crypto" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
              <EditableText as="span" contentKey="products.hero.title_2" defaultValue="Kollekció" />
            </span>
          </h1>

          <EditableText
            as="p"
            contentKey="products.hero.subtitle"
            defaultValue="Válassz a legjobb crypto témájú pólóink közül és mutasd meg a világnak, hogy te is a közösséghez tartozol!"
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a1a] rounded-2xl p-4 mb-8 border border-white/5"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Keresés..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-[#252525] border-white/10 h-12 rounded-xl text-white placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categories - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#F7931A] text-black'
                      : 'bg-[#252525] text-gray-400 hover:text-white hover:bg-[#303030]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full border-white/10 bg-[#252525]"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Szűrők
            </Button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 rounded-xl bg-[#252525] border border-white/10 text-white text-sm"
            >
              <option value="newest">Legújabb</option>
              <option value="price-asc">Ár: növekvő</option>
              <option value="price-desc">Ár: csökkenő</option>
            </select>
          </div>

          {/* Mobile Categories */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#F7931A] text-black'
                          : 'bg-[#252525] text-gray-400'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          <span className="text-white font-semibold">{filteredProducts.length}</span> termék található
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square bg-[#252525]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-[#252525]" />
                  <Skeleton className="h-6 w-1/2 bg-[#252525]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Nincs találat</h3>
            <p className="text-gray-400">Próbálj más keresési feltételeket!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}