import React, { useState } from 'react';
import TrackPageView from '../components/TrackPageView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16 3c.6 2.6 2.3 4.3 5 5v3c-2.1-.1-3.8-.7-5-1.7V16a5 5 0 1 1-5-5c.4 0 .7 0 1 .1V14a2 2 0 1 0 2 2V3h2z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
    <circle cx="17" cy="7" r="1" fill="currentColor" />
  </svg>
);

export default function Contact() {
  const [questionOpen, setQuestionOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [form, setForm] = useState({ email: '', question: '' });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuestion = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!form.email || !form.question) {
      setStatus('Kérjük töltsd ki az emailt és a kérdést.');
      return;
    }
    try {
      setIsSubmitting(true);
      await base44.entities.Question.create({
        email: form.email,
        question: form.question.trim(),
      });
      setStatus('Köszönjük! Hamarosan jelentkezünk.');
      setForm({ email: '', question: '' });
    } catch (err) {
      setStatus(err?.message || 'Hiba történt a kérdés elküldésekor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)]">
      <TrackPageView pageName="Contact" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-10">Kapcsolat</h1>

        <div className="bg-white border border-black/10 rounded-2xl p-6 mb-10">
          <div className="space-y-3 text-black/70">
            <div>
              <span className="font-semibold text-black">Email:</span>{' '}
              <span className="text-[var(--candlie-pink-secondary)]">hello@candlie.hu</span>
            </div>
            <div>
              <span className="font-semibold text-black">Telefonszám:</span>{' '}
              <span className="text-[var(--candlie-pink-secondary)]">+36 70 606 1553</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <a
              href="https://www.tiktok.com/@candlie_koktelgyertya"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[var(--candlie-pink-secondary)]/10 text-[var(--candlie-pink-secondary)] flex items-center justify-center"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/candlie_koktelgyertya/"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[var(--candlie-pink-secondary)]/10 text-[var(--candlie-pink-secondary)] flex items-center justify-center"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="h-12 px-6 rounded-xl" onClick={() => setQuestionOpen(true)}>
            Kérdésed van? Írj nekünk!
          </Button>
          <Button
            className="h-12 px-6 rounded-xl bg-[var(--candlie-pink-primary)] hover:bg-[var(--candlie-pink-secondary)]"
            onClick={() => setReturnOpen(true)}
          >
            Visszaküldés
          </Button>
        </div>
      </div>

      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kérdésed van? Írj nekünk!</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitQuestion} className="space-y-4">
            <div>
              <label className="text-sm text-black/70">Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm text-black/70">Kérdés</label>
              <Textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="mt-2"
                rows={4}
                placeholder="Írd le a kérdésed..."
              />
            </div>
            {status && <div className="text-sm text-black/70">{status}</div>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Küldés
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visszaküldés</DialogTitle>
          </DialogHeader>
          <p className="text-red-600">Még szerkesztés alatt van a szöveg</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
