import React from 'react';
import { motion } from 'framer-motion';

const icons = [
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
      <path d="M12 7v6l3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M5 5l14 14" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 6l3 3M14 13l3 3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 4c3 3 4 6 0 10-4-4-3-7 0-10z" strokeWidth="1.5" />
      <path d="M8 20h8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="7" strokeWidth="1.5" />
      <path d="M9 10c1.5-1.5 4.5-1.5 6 0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 16l2-2m6 2l-2-2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 4l8 14H4L12 4z" strokeWidth="1.5" />
      <path d="M12 9v4" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="6" y="7" width="12" height="10" rx="2" strokeWidth="1.5" />
      <path d="M9 7V5m6 2V5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12h6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 20l16-16" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="7" strokeWidth="1.5" />
    </svg>
  ),
  (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M6 8h12v8H6z" strokeWidth="1.5" />
      <path d="M8 6h8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 16l6-6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
];

const items = [
  'Ne égesd 4 óránál tovább a gyertyád egy huzamban!',
  'Mindig vágd vissza a kanóc végét a gyertya meggyújtása előtt 0,5 cm-re a tökéletes és tiszta égés érdekében!',
  'Hagyd, hogy a gyertyád széle is megolvadjon, hogy elkerüld az üregesedést!',
  'Gyerekek és kisállatok elől távol tartandó!',
  'Ne tedd ki a gyertyát közvetlen hőforrásnak!',
  'A gyertyát stabil, egyenes helyen égesd, bármilyen gyúlékony tárgytól távol tartva!',
  'Soha ne hagyd a gyertyát felügyelet nélkül!',
  'A gyertya fogyasztásra nem alkalmas, kizárólag dekoráció!',
];

export default function CandlieCareSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold">
            <span className="text-[var(--candlie-pink-primary)]">CANDLIE</span> Care – Gyertyakezelés és biztonsági útmutató
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((text, index) => {
            const Icon = icons[index];
            return (
              <div key={text} className="bg-white border border-black/10 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--candlie-pink-primary)]/10 text-[var(--candlie-pink-primary)] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-black/80">{text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 space-y-4 text-sm text-black/70">
          <p>
            Jelentős hőváltozás esetén előfordul, hogy a gyertya falán jegesedés – úgynevezett frosting –
            jelenik meg, ami a 100% szója­viaszból készült gyertyák esetén gyakori, a gyertya minőségét igazolja.
            Az égést és a gyertya illatát nem befolyásolja, nem tekinthető hibának!
          </p>
          <p>
            A megrendelés leadásával a vásárló igazolja, hogy elolvasta és megismerte a fenti tájékoztatót,
            valamint a termékek használata során betartja azokban foglalt biztonsági előírásokat.
            A CANDLIE nem vállal felelősséget az előírások be nem tartásából eredő károkért vagy sérülésekért.
          </p>
        </div>
      </div>
    </section>
  );
}
