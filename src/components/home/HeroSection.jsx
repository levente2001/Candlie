import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import EditableText from '@/components/editable/EditableText';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--candlie-bg)]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f6f1f6] to-[#f6f6f6]" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--candlie-pink-primary)] rounded-full blur-[140px] opacity-15" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--candlie-pink-secondary)] rounded-full blur-[140px] opacity-10" />
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
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-semibold leading-tight mb-6 text-black"
            >
              <EditableText as="span" contentKey="home.hero.title_1" defaultValue="A kedvenc italod, " />
              <span className="text-[var(--candlie-pink-primary)]">
                <EditableText as="span" contentKey="home.hero.title_2" defaultValue="gyertya" />
              </span>{' '}
              <EditableText as="span" contentKey="home.hero.title_3" defaultValue="formában!" />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-[var(--candlie-pink-secondary)] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              <EditableText
                as="span"
                contentKey="home.hero.subtitle"
                defaultValue="Kézzel készült, minőségi koktélgyertyák ikonikus koktélok ihletésére."
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
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--candlie-pink-secondary)] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[var(--candlie-pink-primary)]/25 transition-all duration-300 transform hover:-translate-y-1"
              >
                <EditableText contentKey="home.hero.cta_primary" defaultValue="Koktélgyertyák" />
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
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
                className="relative bg-white rounded-3xl p-8 border border-black/10 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--candlie-pink-primary)]/10 to-transparent rounded-3xl" />

                <div className="relative">
                  <img
                    src="https://img.freepik.com/free-photo/cozy-winter-composition-with-candles-blurred-background-with-books_169016-45127.jpg?t=st=1770233202~exp=1770236802~hmac=251b59380919b2c0c219e87cd25936a77c10d5a2d95d46177a71c20e8c29df3a"
                    alt="Crypto T-shirt"
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-black">
                      <EditableText contentKey="home.hero.card_title" defaultValue="CANDLIE" />
                    </h3>
                    <div className="px-3 py-1 bg-[var(--candlie-pink-secondary)]/15 rounded-full">
                      <span className="text-[var(--candlie-pink-secondary)] text-sm font-semibold">HOT</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black/50 text-sm">
                        <EditableText contentKey="home.hero.card_price_label" defaultValue="Már csak" />
                      </p>
                      <p className="text-3xl font-semibold text-[var(--candlie-pink-secondary)]">
                        <EditableText contentKey="home.hero.card_price" defaultValue="7 500 Ft" />
                      </p>
                    </div>
                    <Link
                      to={createPageUrl('Products')}
                      className="w-12 h-12 bg-[var(--candlie-pink-secondary)] rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-[var(--candlie-pink-primary)]/25 transition-all">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 border border-black/10 shadow-xl"
              >
                <div className="text-center">
                  <p className="text-[var(--candlie-pink-secondary)] font-bold text-lg">🔥</p>
                  <p className="text-black font-semibold text-sm">
                    <EditableText contentKey="home.hero.float_1" defaultValue="Új illatok" />
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
