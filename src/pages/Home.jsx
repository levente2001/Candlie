import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import CandlieCareSection from '../components/home/CandlieCareSection';
import ProductCard from '../components/products/ProductCard';
import TrackPageView from '../components/TrackPageView';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowRight } from 'lucide-react';
import EditableText from '../components/editable/EditableText';

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 6),
  });

  return (
    <div>
      <TrackPageView pageName="Home" />
      <HeroSection />
      <FeaturesSection />
      <CandlieCareSection />

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-black">
                  <EditableText
                    as="span"
                    contentKey="home.featured.heading"
                    defaultValue="Kiemelt"
                  />{' '}
                  <span className="text-[var(--candlie-pink-primary)]">
                    <EditableText
                      as="span"
                      contentKey="home.featured.headingEmphasis"
                      defaultValue="termékek"
                    />
                  </span>
                </h2>
                <EditableText
                  as="p"
                  className="text-black/70 max-w-lg"
                  contentKey="home.featured.description"
                  defaultValue="Fedezd fel legnépszerűbb koktélgyertyáinkat!"
                />
              </div>
              <Link
                to={createPageUrl('Products')}
                className="group inline-flex items-center gap-2 mt-6 md:mt-0 text-[var(--candlie-pink-secondary)] font-semibold hover:text-[var(--candlie-pink-primary)] transition-colors"
              >
                <EditableText
                  as="span"
                  contentKey="home.featured.linkText"
                  defaultValue="Összes termék"
                />
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
