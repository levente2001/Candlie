import React from 'react';
import { Sparkles, Award, Zap, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import EditableText from '../editable/EditableText';

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'Egyedi minták',
      description: 'Merülj el a különleges mintáink között és találd meg azt, ami igazán neked való. Valamint, ha van egy jó ötleted, küldd el nekünk, ki tudja, talán már a következő kollekcióban benne lehet…',
      emoji: '🎨',
      color: 'from-purple-500 to-pink-500',
      contentKeyBase: 'featuresSection.items.uniquePatterns',
    },
    {
      icon: Award,
      title: 'Proof of Style',
      description: 'Mint a legjobb stake: csak a kiváltságosoknak jár. A limitált Crypto Club kollekciók gyorsabban fogynak, mint a BTC egy dump után!',
      emoji: '🏆',
      color: 'from-[#F7931A] to-yellow-500',
      contentKeyBase: 'featuresSection.items.proofOfStyle',
    },
    {
      icon: Zap,
      title: 'Friss dropok',
      description: 'Nem hagyunk poros trendeket a portfóliódban! Folyamatosan érkező új mintáinkkal segítünk trendi maradni.',
      emoji: '⚡',
      color: 'from-blue-500 to-cyan-500',
      contentKeyBase: 'featuresSection.items.freshDrops',
    },
    {
      icon: Wallet,
      title: 'Stílus minden pénztárcához',
      description: 'Kedvező árainknak köszönhetően még akkor is benne van 1-2 új póló beszerzése, ha a piac éppen nem alakul fényesen. Ha a piac épp padlón van, legalább a stílusod legyen csúcson.',
      emoji: '💰',
      color: 'from-emerald-500 to-green-500',
      contentKeyBase: 'featuresSection.items.forEveryWallet',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <EditableText
              as="span"
              contentKey="featuresSection.heading"
              defaultValue="Mindenki blokkláncra kerülhet..."
            />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#f5a623]">
              <EditableText
                as="span"
                contentKey="featuresSection.headingEmphasis"
                defaultValue="stílusosan"
              />
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-[#1a1a1a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 h-full hover:border-[#F7931A]/30 transition-all overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
                
                {/* Icon Container with Emoji */}
                <div className="relative flex items-center gap-3 mb-6">
                  
                  <motion.span 
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <EditableText
                      as="span"
                      contentKey={`${feature.contentKeyBase}.emoji`}
                      defaultValue={feature.emoji}
                    />
                  </motion.span>
                </div>
                
                <EditableText
                  as="h3"
                  className="text-xl font-bold mb-3 group-hover:text-[#F7931A] transition-colors"
                  contentKey={`${feature.contentKeyBase}.title`}
                  defaultValue={feature.title}
                />
                <EditableText
                  as="p"
                  className="text-gray-400 leading-relaxed text-sm"
                  contentKey={`${feature.contentKeyBase}.description`}
                  defaultValue={feature.description}
                />
                
                {/* Decorative Element */}
                <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
