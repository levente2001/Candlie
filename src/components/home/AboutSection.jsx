import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import EditableText from '../editable/EditableText';

export default function AboutSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop"
                alt="Crypto Community"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
            
            {/* Stats */}
            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4">
              {[
                { value: '1000+', label: 'Elégedett vásárló', contentKeyBase: 'aboutSection.stats.customers' },
                { value: '50+', label: 'Egyedi design', contentKeyBase: 'aboutSection.stats.designs' },
                { value: '100%', label: 'EU gyártás', contentKeyBase: 'aboutSection.stats.euProduction' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1a1a1a]/90 backdrop-blur-sm rounded-xl p-4 text-center border border-white/5"
                >
                  <EditableText
                    as="div"
                    className="text-2xl font-bold text-[#F7931A]"
                    contentKey={`${stat.contentKeyBase}.value`}
                    defaultValue={stat.value}
                  />
                  <EditableText
                    as="div"
                    className="text-xs text-gray-400 mt-1"
                    contentKey={`${stat.contentKeyBase}.label`}
                    defaultValue={stat.label}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7931A]/10 border border-[#F7931A]/30 rounded-full mb-4">
              <EditableText
                as="span"
                className="text-2xl"
                contentKey="aboutSection.badge.emoji"
                defaultValue="📈"
              />
              <EditableText
                as="span"
                className="text-sm font-medium text-[#F7931A]"
                contentKey="aboutSection.badge.text"
                defaultValue="Magyar márka, EU minőség"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <EditableText
                as="span"
                contentKey="aboutSection.heading"
                defaultValue="Stílusos pólók."
              />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
                <EditableText
                  as="span"
                  contentKey="aboutSection.headingEmphasis"
                  defaultValue="Diamond Hands"
                />
              </span>{' '}
              <EditableText
                as="span"
                contentKey="aboutSection.headingTail"
                defaultValue="mentalitás. 💎🙌"
              />
            </h2>
            <EditableText
              as="p"
              className="text-gray-400 text-lg leading-relaxed mb-4"
              contentKey="aboutSection.paragraphs.lead"
              defaultValue="Amikor a portfolio vörösben van, legalább a stílusod legyen zöldben! Mi nem csak crypto-t követünk, hanem trendet is."
            />
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              <EditableText
                as="span"
                contentKey="aboutSection.paragraphs.statementIntro"
                defaultValue="Nálunk minden póló egy statement:"
              />{' '}
              <EditableText
                as="span"
                className="text-white font-semibold"
                contentKey="aboutSection.paragraphs.statementQuoteOne"
                defaultValue="&quot;Igen, tudom mi az a blockchain&quot;"
              />{' '}
              <EditableText
                as="span"
                contentKey="aboutSection.paragraphs.statementConnector"
                defaultValue="és"
              />{' '}
              <EditableText
                as="span"
                className="text-white font-semibold"
                contentKey="aboutSection.paragraphs.statementQuoteTwo"
                defaultValue="&quot;Nem, nem fogom eladni csak mert -20%&quot;"
              />{' '}
              <EditableText
                as="span"
                contentKey="aboutSection.paragraphs.statementEmoji"
                defaultValue="🚀"
              />
            </p>
            <ul className="space-y-4 mb-10">
              {[
                { text: 'Prémium 100% pamut - puha mint egy bull market', icon: '✨', contentKeyBase: 'aboutSection.bullets.premiumCotton' },
                { text: 'Tartós nyomtatás - HODL approved, nem fakuló', icon: '💪', contentKeyBase: 'aboutSection.bullets.durablePrint' },
                { text: 'Unisex szabás - mindenki lehet crypto bro', icon: '👕', contentKeyBase: 'aboutSection.bullets.unisexFit' },
                { text: 'EU gyártás - nincs benne FUD', icon: '🇪🇺', contentKeyBase: 'aboutSection.bullets.euProduction' },
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <EditableText
                    as="span"
                    className="text-xl"
                    contentKey={`${item.contentKeyBase}.icon`}
                    defaultValue={item.icon}
                  />
                  <EditableText
                    as="span"
                    contentKey={`${item.contentKeyBase}.text`}
                    defaultValue={item.text}
                  />
                </motion.li>
              ))}
            </ul>
            <Link
              to={createPageUrl('Products')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all transform hover:-translate-y-1"
            >
              <EditableText
                as="span"
                contentKey="aboutSection.cta"
                defaultValue="Fedezd fel a kollekciókat"
              />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
