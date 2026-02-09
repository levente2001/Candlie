import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TrackPageView from '../components/TrackPageView';
import EditableText from '../components/editable/EditableText';

export default function Candlie() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', message: '' });
  const [status, setStatus] = useState('');

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['candlie-feedbacks'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 50),
  });

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
        name: form.name || '',
        message: form.message.trim(),
        word_count: wordCount,
        approved: false,
      });
      setStatus('Köszönjük! A visszajelzésedet megkaptuk.');
      setForm({ name: '', message: '' });
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
            <EditableText as="span" contentKey="candlie.hero.title_1" defaultValue="Üdvözöllek a " />
            <span className="text-[var(--candlie-pink-secondary)]">
              <EditableText as="span" contentKey="candlie.hero.title_2" defaultValue="koktélgyertyák" />
            </span>{' '}
            <EditableText as="span" contentKey="candlie.hero.title_3" defaultValue="világában!" />
          </h1>
          <div className="space-y-5 text-black/70 leading-relaxed">
            <EditableText
              as="p"
              contentKey="candlie.hero.p1"
              defaultValue="A CANDLIE-nél a koktélok inspirálnak: minden gyertya egy-egy különleges hangulatot idéz, amit 100% természetes szója­viaszból készítek. A szója­viasz tiszta égése hosszabb ideig tartja az illatot, és kíméletesebb a környezethez, így nemcsak szép, de tudatos választás is."
            />
            <EditableText
              as="p"
              contentKey="candlie.hero.p2"
              defaultValue="Számomra a gyertyakészítés nem csak kézműves munka, hanem kreatív élmény – szeretek új illatokat és formákat felfedezni, hogy otthonodban is különleges pillanatokat teremt­hess."
            />
            <EditableText
              as="p"
              contentKey="candlie.hero.p3"
              defaultValue="Minden CANDLIE koktélgyertya nagy odafigyeléssel, gondosan összeválogatott illatokkal és hangulattal készül. Számomra a minőség az első, ezért rengeteg kísérletezés és tökéletesítés előzi meg a kész termékeket."
            />
            <EditableText
              as="p"
              contentKey="candlie.hero.p4"
              defaultValue="Fedezd fel a koktélok inspirálta gyertyákat, és engedd, hogy az illat varázsa elrepítsen egy luxus pillanatra!"
            />
          </div>

          <div className="mt-8">
            <Link to={createPageUrl('Products')}>
              <Button className="h-12 px-6 rounded-xl">
                <EditableText as="span" contentKey="candlie.hero.cta" defaultValue="Koktélgyertyák" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">
            <EditableText as="span" contentKey="candlie.feedback.title" defaultValue="Visszajelzések" />
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {feedbacks.filter((f) => f.approved === true || f.approved === 'true').slice(0, 6).length === 0 ? (
              <div className="text-sm text-black/60">Még nincs kiemelt visszajelzés.</div>
            ) : (
              feedbacks
                .filter((f) => f.approved === true || f.approved === 'true')
                .slice(0, 6)
                .map((item) => (
                <div key={item.id} className="bg-white border border-black/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{item.name || 'Névtelen'}</h3>
                    <span className="text-xs text-black/50">
                      {item.created_date ? new Date(item.created_date).toLocaleDateString('hu-HU') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-black/70">{item.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            <Button onClick={() => setModalOpen(true)} className="h-12 px-6 rounded-xl">
              <EditableText as="span" contentKey="candlie.feedback.cta" defaultValue="Visszajelzés küldése" />
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <EditableText as="span" contentKey="candlie.feedback.modal_title" defaultValue="Visszajelzés küldése" />
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitFeedback} className="space-y-4">
            <div>
              <label className="text-sm text-black/70">
                <EditableText as="span" contentKey="candlie.feedback.name_label" defaultValue="Teljes név (opcionális)" />
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2"
                placeholder="Kovács János"
              />
            </div>
            <div>
              <label className="text-sm text-black/70">
                <EditableText
                  as="span"
                  contentKey="candlie.feedback.message_label"
                  defaultValue="Visszajelzés (max. 50 szó)"
                />
              </label>
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
              <EditableText as="span" contentKey="candlie.feedback.submit" defaultValue="Küldés" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
