import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TrackPageView from '../components/TrackPageView';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Award, Heart, Sparkles } from 'lucide-react';
import EditableText from '../components/editable/EditableText';

export default function About() {
  const values = [
    {
      icon: Users,
      titleKey: 'about.values.1.title',
      titleDefault: 'Közösség',
      descKey: 'about.values.1.desc',
      descDefault:
        'A crypto világ közösségének része vagyunk, és ezt a közösségi szellemet visszük bele minden termékünkbe.',
    },
    {
      icon: Award,
      titleKey: 'about.values.2.title',
      titleDefault: 'Minőség',
      descKey: 'about.values.2.desc',
      descDefault:
        'Prémium anyagok, gondos kivitelezés és tartós nyomatok. Olyan pólókat készítünk, amiket öröm viselni.',
    },
    {
      icon: Heart,
      titleKey: 'about.values.3.title',
      titleDefault: 'Szenvedély',
      descKey: 'about.values.3.desc',
      descDefault:
        'Mi is benne élünk a kriptóban. Hisszük, hogy a stílus és a szenvedély együtt igazán ütős.',
    },
    {
      icon: Sparkles,
      titleKey: 'about.values.4.title',
      titleDefault: 'Egyediség',
      descKey: 'about.values.4.desc',
      descDefault:
        'Limitált vibe, kreatív design-ok, amik garantáltan kitűnnek a tömegből.',
    },
  ];

  const stats = [
    { valueKey: 'about.stats.1.value', valueDefault: '1000+', labelKey: 'about.stats.1.label', labelDefault: 'Elégedett vásárló' },
    { valueKey: 'about.stats.2.value', valueDefault: '24h', labelKey: 'about.stats.2.label', labelDefault: 'Gyors feldolgozás' },
    { valueKey: 'about.stats.3.value', valueDefault: '100%', labelKey: 'about.stats.3.label', labelDefault: 'EU gyártás' },
    { valueKey: 'about.stats.4.value', valueDefault: '4.9/5', labelKey: 'about.stats.4.label', labelDefault: 'Értékelés' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] text-white">
      <TrackPageView pageName="About" />

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/20 mb-8">
              <span className="w-2 h-2 bg-[#F7931A] rounded-full animate-pulse" />
              <EditableText
                as="span"
                contentKey="about.hero.badge"
                defaultValue="Ismerd meg a CryptoClub sztoriját"
                className="text-sm font-semibold text-[#F7931A]"
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              <EditableText as="span" contentKey="about.hero.title_1" defaultValue="A CryptoClub " />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
                <EditableText as="span" contentKey="about.hero.title_2" defaultValue="küldetése" />
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              <EditableText
                as="span"
                contentKey="about.hero.subtitle"
                defaultValue="A CryptoClub azért jött létre, hogy a kriptó iránti szenvedélyt egy modern, hordható stílusban is megmutathasd."
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
              <EditableText as="span" contentKey="about.values.title" defaultValue="Ami fontos nekünk" />
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto">
              <EditableText
                as="span"
                contentKey="about.values.subtitle"
                defaultValue="Ezek az értékek határozzák meg a márkát és a termékeinket."
              />
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 hover:border-[#F7931A]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center">
                    <v.icon className="w-6 h-6 text-[#F7931A]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      <EditableText as="span" contentKey={v.titleKey} defaultValue={v.titleDefault} />
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      <EditableText as="span" contentKey={v.descKey} defaultValue={v.descDefault} />
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mt-10 bg-gradient-to-r from-[#F7931A]/10 to-[#1a1a1a] rounded-3xl p-8 md:p-10 border border-white/5"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-[#F7931A] mb-2">
                    <EditableText as="span" contentKey={s.valueKey} defaultValue={s.valueDefault} />
                  </div>
                  <div className="text-gray-300 text-sm">
                    <EditableText as="span" contentKey={s.labelKey} defaultValue={s.labelDefault} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center bg-[#1a1a1a] rounded-3xl p-10 border border-white/5"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              <EditableText as="span" contentKey="about.cta.title" defaultValue="Készen állsz?" />
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              <EditableText
                as="span"
                contentKey="about.cta.subtitle"
                defaultValue="Fedezd fel kollekciónkat és találd meg a neked való pólót!"
              />
            </p>

            <Link
              to={createPageUrl('Products')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all"
            >
              <EditableText as="span" contentKey="about.cta.button" defaultValue="Termékek megtekintése" />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
