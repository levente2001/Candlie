import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import TrackPageView from '../components/TrackPageView';

const highlightCards = [
  {
    title: 'Szeretettel öntve',
    description:
      'Minden termékünk kézzel készül, egyedi illatvilággal, maximális odafigyeléssel kiöntve.',
  },
  {
    title: 'Prémium minőség',
    description:
      'Kizárólag minőségi, 100% szója­viaszt használunk, amely káros anyagoktól mentes és hosszabb, tisztább égést biztosít.',
  },
  {
    title: 'Újrahasznosítható pohár',
    description:
      'Ha elégetted illatgyertyád, hasznosítsd újra a poharat, hogy kedvenc koktélod ne csak gyertya, de ital formában is megcsodálhasd.',
  },
  {
    title: 'Vásárló barát',
    description:
      'Kedvező árak, részletes tájékoztatás és gyors szállítás mellett mindig rendelkezésre állunk kérdés esetén.',
  },
];

export default function Candlie() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', message: '' });
  const [status, setStatus] = useState('');

  const wordCount = useMemo(() => {
    return form.message.trim() ? form.message.trim().split(/\s+/).length : 0;
  }, [form.message]);

  const canSubmit = wordCount > 0 && wordCount <= 50 && !isSubmitting;

  const submitFeedback = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!canSubmit) return;
    try {
      setIsSubmitting(true);
      await base44.entities.Feedback.create({
        email: form.email || '',
        message: form.message.trim(),
        word_count: wordCount,
      });
      setStatus('Köszönjük! A visszajelzésedet megkaptuk.');
      setForm({ email: '', message: '' });
    } catch (err) {
      setStatus(err?.message || 'Hiba történt a visszajelzés küldésekor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)]">
      <TrackPageView pageName="Candlie" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            “Üdvözöllek a{' '}
            <span className="text-[var(--candlie-pink-secondary)]">koktélgyertyák</span> világában!”
          </h1>
          <div className="space-y-5 text-black/70 leading-relaxed">
            <p>
              A CANDLIE-nél a koktélok inspirálnak: minden gyertya egy-egy különleges hangulatot idéz, amit 100% természetes
              szója­viaszból készítek. A szója­viasz tiszta égése hosszabb ideig tartja az illatot, és kíméletesebb a
              környezethez, így nemcsak szép, de tudatos választás is.
            </p>
            <p>
              Számomra a gyertyakészítés nem csak kézműves munka, hanem kreatív élmény – szeretek új illatokat és formákat
              felfedezni, hogy otthonodban is különleges pillanatokat teremt­hess.
            </p>
            <p>
              Minden CANDLIE koktélgyertya nagy odafigyeléssel, gondosan összeválogatott illatokkal és hangulattal készül.
              Számomra a minőség az első, ezért rengeteg kísérletezés és tökéletesítés előzi meg a kész termékeket.
            </p>
            <p>
              Fedezd fel a koktélok inspirálta gyertyákat, és engedd, hogy az illat varázsa elrepítsen egy luxus pillanatra!
            </p>
          </div>

          <div className="mt-8">
            <Link to={createPageUrl('Products')}>
              <Button className="h-12 px-6 rounded-xl">Koktélgyertyák</Button>
            </Link>
          </div>
        </motion.div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Visszajelzések</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {highlightCards.map((card) => (
              <div key={card.title} className="bg-white border border-black/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-black/70">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button onClick={() => setModalOpen(true)} className="h-12 px-6 rounded-xl">
              Visszajelzés küldése
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visszajelzés küldése</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitFeedback} className="space-y-4">
            <div>
              <label className="text-sm text-black/70">Email (opcionális)</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm text-black/70">Visszajelzés (max. 50 szó)</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-2"
                rows={4}
                placeholder="Írd le a véleményed..."
              />
              <div className={`text-xs mt-2 ${wordCount > 50 ? 'text-red-600' : 'text-black/50'}`}>
                {wordCount}/50 szó
              </div>
            </div>
            {status && <div className="text-sm text-black/70">{status}</div>}
            <Button type="submit" disabled={!canSubmit} className="w-full">
              Küldés
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
