import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import AboutSection from '../components/home/AboutSection';
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
      <AboutSection />

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
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <EditableText
                    as="span"
                    contentKey="home.featured.heading"
                    defaultValue="Kiemelt"
                  />{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
                    <EditableText
                      as="span"
                      contentKey="home.featured.headingEmphasis"
                      defaultValue="termékek"
                    />
                  </span>
                </h2>
                <EditableText
                  as="p"
                  className="text-gray-400 max-w-lg"
                  contentKey="home.featured.description"
                  defaultValue="Fedezd fel legnépszerűbb pólóinkat, amik a közösség kedvencei!"
                />
              </div>
              <Link
                to={createPageUrl('Products')}
                className="group inline-flex items-center gap-2 mt-6 md:mt-0 text-[#F7931A] font-semibold hover:text-[#f5a623] transition-colors"
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7931A]/10 via-purple-500/5 to-[#0a0a0a]" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 text-6xl opacity-20"
        >
          <EditableText
            as="span"
            contentKey="home.cta.floating.rocket"
            defaultValue="🚀"
          />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-10 text-6xl opacity-20"
        >
          <EditableText
            as="span"
            contentKey="home.cta.floating.diamond"
            defaultValue="💎"
          />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
          className="absolute top-40 right-1/4 text-5xl opacity-20"
        >
          <EditableText
            as="span"
            contentKey="home.cta.floating.btc"
            defaultValue="₿"
          />
        </motion.div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <EditableText
                as="span"
                className="text-6xl"
                contentKey="home.cta.moonEmoji"
                defaultValue="🌙"
              />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <EditableText
                as="span"
                contentKey="home.cta.heading"
                defaultValue="To The Moon! 🚀"
              />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
                <EditableText
                  as="span"
                  contentKey="home.cta.headingEmphasis"
                  defaultValue="De Stílusban!"
                />
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              <EditableText
                as="span"
                contentKey="home.cta.paragraphLead"
                defaultValue="Nem csak a portfoliód pumpolhat! Csatlakozz több ezer crypto enthusiast-hoz, akik értik a mémeket ÉS a minőséget is."
              />{' '}
              <EditableText
                as="span"
                className="text-white font-semibold"
                contentKey="home.cta.paragraphEmphasis"
                defaultValue="WAGMI! 💪"
              />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={createPageUrl('Products')}
                className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all transform hover:-translate-y-1"
              >
                <EditableText
                  as="span"
                  className="text-2xl"
                  contentKey="home.cta.buttonEmoji"
                  defaultValue="💰"
                />
                <EditableText
                  as="span"
                  contentKey="home.cta.buttonText"
                  defaultValue="Vásárlás most"
                />
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-gray-400">
                <EditableText
                  as="span"
                  className="text-2xl"
                  contentKey="home.cta.socialProofEmoji"
                  defaultValue="🔥"
                />
                <EditableText
                  as="span"
                  className="text-sm"
                  contentKey="home.cta.socialProofText"
                  defaultValue="125+ vásárló az elmúlt 24 órában"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
