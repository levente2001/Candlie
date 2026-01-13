import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import EditableText from '@/components/editable/EditableText';

export default function HeroSection() {
  const features = [
    { icon: Truck, key: 'home.hero.feature_1', defaultText: 'Gyors szállítás' },
    { icon: Shield, key: 'home.hero.feature_2', defaultText: 'Biztonságos fizetés' },
    { icon: RotateCcw, key: 'home.hero.feature_3', defaultText: '30 napos garancia' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F7931A] rounded-full blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#f5a623] rounded-full blur-[128px] opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/20 mb-8"
            >
              <span className="w-2 h-2 bg-[#F7931A] rounded-full animate-pulse" />
              <EditableText
                as="span"
                contentKey="home.hero.badge"
                defaultValue="Új kollekció érkezett! 🔥"
                className="text-sm font-semibold text-[#F7931A]"
              />
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-black leading-tight mb-6"
            >
              <EditableText as="span" contentKey="home.hero.title_1" defaultValue="Nyisd ki a " />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
                <EditableText as="span" contentKey="home.hero.title_2" defaultValue="CRYPTO" />
              </span>
              <EditableText as="span" contentKey="home.hero.title_3" defaultValue=" világ" />
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                <EditableText as="span" contentKey="home.hero.title_4" defaultValue="gardróbját" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              <EditableText
                as="span"
                contentKey="home.hero.subtitle"
                defaultValue="Prémium minőségű crypto témájú pólók, amikkel megmutathatod a stílusod és a szenvedélyed."
              />
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link
                to={createPageUrl('Products')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-bold rounded-xl hover:shadow-2xl hover:shadow-[#F7931A]/25 transition-all duration-300 transform hover:-translate-y-1"
              >
                <EditableText contentKey="home.hero.cta_primary" defaultValue="Termékek" />
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to={createPageUrl('About')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <EditableText contentKey="home.hero.cta_secondary" defaultValue="Rólunk" />
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-400">
                  <feature.icon className="w-5 h-5 text-[#F7931A]" />
                  <EditableText as="span" contentKey={feature.key} defaultValue={feature.defaultText} className="text-sm font-medium" />
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Main Product Card */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-8 border border-white/10 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 to-transparent rounded-3xl" />

                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
                    alt="Crypto T-shirt"
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">
                      <EditableText contentKey="home.hero.card_title" defaultValue="Diamond Hands" />
                    </h3>
                    <div className="px-3 py-1 bg-[#F7931A]/20 rounded-full">
                      <span className="text-[#F7931A] text-sm font-semibold">HOT</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">
                        <EditableText contentKey="home.hero.card_price_label" defaultValue="Már csak" />
                      </p>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
                        <EditableText contentKey="home.hero.card_price" defaultValue="5 890 Ft" />
                      </p>
                    </div>
                    <Link
                      to={createPageUrl('Products')}
                      className="w-12 h-12 bg-gradient-to-r from-[#F7931A] to-[#f5a623] rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all">
                      <ArrowRight className="w-6 h-6 text-black" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-[#1a1a1a] rounded-2xl p-4 border border-white/10 shadow-xl"
              >
                <div className="text-center">
                  <p className="text-[#F7931A] font-bold text-lg">🚀</p>
                  <p className="text-white font-semibold text-sm">
                    <EditableText contentKey="home.hero.float_1" defaultValue="To the Moon" />
                  </p>
                </div>
              </motion.div>

              
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
