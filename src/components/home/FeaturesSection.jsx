import React from 'react';
import { motion } from 'framer-motion';
import EditableText from '../editable/EditableText';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Szeretettel öntve',
      description:
        'Minden termékünk kézzel készül, egyedi illatvilággal, maximális odafigyeléssel kiöntve.',
      contentKeyBase: 'featuresSection.items.handmade',
    },
    {
      title: 'Prémium minőség',
      description:
        'Kizárólag minőségi, 100% szója­viaszt használunk, amely káros anyagoktól mentes és hosszabb, tisztább égést biztosít.',
      contentKeyBase: 'featuresSection.items.premium',
    },
    {
      title: 'Újrahasznosítható pohár',
      description:
        'Ha elégetted illatgyertyád, hasznosítsd újra a poharat, hogy kedvenc koktélod ne csak gyertya, de ital formában is megcsodálhasd.',
      contentKeyBase: 'featuresSection.items.reusable',
    },
    {
      title: 'Vásárló barát',
      description:
        'A kedvező árak, részletes tájékoztatás és gyors szállítás mellett mindig rendelkezésre állunk kérdés esetén.',
      contentKeyBase: 'featuresSection.items.friendly',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[var(--candlie-bg)]">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f6f1f6] to-[#f6f6f6]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-black">
            <EditableText
              as="span"
              contentKey="featuresSection.heading"
              defaultValue="A "
            />{' '}
            <span className="text-[var(--candlie-pink-primary)]">
              <EditableText
                as="span"
                contentKey="featuresSection.headingEmphasis"
                defaultValue="CANDLIE"
              />
            </span>{' '}
            <EditableText
              as="span"
              contentKey="featuresSection.headingTail"
              defaultValue="több mint egy gyertya"
            />
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
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--candlie-pink-primary)]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-white border border-black/10 rounded-2xl p-8 h-full hover:border-[var(--candlie-pink-primary)]/50 transition-all overflow-hidden">
                <EditableText
                  as="h3"
                  className="text-xl font-semibold mb-3 text-black"
                  contentKey={`${feature.contentKeyBase}.title`}
                  defaultValue={feature.title}
                />
                <EditableText
                  as="p"
                  className="text-black/70 leading-relaxed text-sm"
                  contentKey={`${feature.contentKeyBase}.description`}
                  defaultValue={feature.description}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
