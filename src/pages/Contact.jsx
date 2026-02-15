import React, { useState } from 'react';
import TrackPageView from '../components/TrackPageView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import EditableText from '../components/editable/EditableText';

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

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.78-3.88 1.1 0 2.25.2 2.25.2v2.46H15.2c-1.25 0-1.64.78-1.64 1.58V12h2.8l-.45 2.9h-2.35v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

export default function Contact() {
  const [questionOpen, setQuestionOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', question: '' });
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
      const subject = 'CANDLIE kérdés';
      const bodyLines = [
        form.name ? `Név: ${form.name}` : null,
        `Email: ${form.email}`,
        '',
        form.question.trim(),
      ].filter(Boolean);
      const mailto = `mailto:candliegyertya@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      window.location.href = mailto;
      setStatus('Köszönjük! Az email kliens megnyitásához elkészítettük az üzenetet.');
      setForm({ name: '', email: '', question: '' });
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
        <h1 className="text-3xl md:text-4xl font-semibold mb-10">
          <EditableText as="span" contentKey="contact.title" defaultValue="Kapcsolat" />
        </h1>

        <div className="bg-white border border-black/10 rounded-2xl p-6 mb-10">
          <div className="space-y-3 text-black/70">
            <div>
              <span className="font-semibold text-black">
                <EditableText as="span" contentKey="contact.email_label" defaultValue="Email:" />
              </span>{' '}
              <span className="text-[var(--candlie-pink-secondary)]">
                <EditableText as="span" contentKey="contact.email_value" defaultValue="candliegyertya@gmail.com" />
              </span>
            </div>
            <div>
              <span className="font-semibold text-black">
                <EditableText as="span" contentKey="contact.phone_label" defaultValue="Telefonszám:" />
              </span>{' '}
              <span className="text-[var(--candlie-pink-secondary)]">
                <EditableText as="span" contentKey="contact.phone_value" defaultValue="+36 70 606 1553" />
              </span>
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
            <a
              href="https://www.facebook.com/profile.php?id=61587490810995"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-[var(--candlie-pink-secondary)]/10 text-[var(--candlie-pink-secondary)] flex items-center justify-center"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="h-12 px-6 rounded-xl" onClick={() => setQuestionOpen(true)}>
            <EditableText as="span" contentKey="contact.question_cta" defaultValue="Kérdésed van? Írj nekünk!" />
          </Button>
          <Button
            className="h-12 px-6 rounded-xl bg-[var(--candlie-pink-primary)] hover:bg-[var(--candlie-pink-secondary)]"
            onClick={() => setReturnOpen(true)}
          >
            <EditableText as="span" contentKey="contact.return_cta" defaultValue="Visszaküldés" />
          </Button>
        </div>
      </div>

      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <EditableText as="span" contentKey="contact.question_title" defaultValue="Kérdésed van? Írj nekünk!" />
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitQuestion} className="space-y-4">
            <div>
              <label className="text-sm text-black/70">
                <EditableText as="span" contentKey="contact.name_label" defaultValue="Teljes név (opcionális)" />
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
                <EditableText as="span" contentKey="contact.email_input_label" defaultValue="Email" />
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm text-black/70">
                <EditableText as="span" contentKey="contact.question_label" defaultValue="Kérdés" />
              </label>
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
              <EditableText as="span" contentKey="contact.submit" defaultValue="Küldés" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <EditableText as="span" contentKey="contact.return_title" defaultValue="Visszaküldés" />
            </DialogTitle>
          </DialogHeader>
          <div style={{ fontFamily: 'Times New Roman, Times, serif', color: '#000000' }} className="space-y-4 text-sm leading-relaxed">
            <EditableText
              as="p"
              contentKey="contact.return.p1"
              defaultValue="A visszaküldéssel és reklamációval kapcsolatos ügyintézés kizárólag írásban, e-mailben történik."
            />

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h1" defaultValue="Elállási jog" />
            </h3>
            <EditableText
              as="p"
              contentKey="contact.return.p2"
              defaultValue="A fogyasztót a termék kézhezvételétől számított 14 naptári napon belül indokolás nélküli elállási jog illeti meg. Több termék egyidejű rendelése esetén az elállási jog a rendelés egyes termékeire külön-külön is gyakorolható. Az elállási jog gyakorlásához a vásárlónak egyértelmű nyilatkozatot kell tennie az alábbi elérhetőségen: E-mail cím: hello@candlie.hu A vásárló az elállási jogát a jelen tájékoztató végén található elállási nyilatkozat-minta felhasználásával is gyakorolhatja."
            />

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h2" defaultValue="Termék visszaküldés" />
            </h3>
            <EditableText
              as="p"
              contentKey="contact.return.p3"
              defaultValue="Elállás esetén a vásárló köteles a terméket haladéktalanul, de legkésőbb az elállás közlésétől számított 14 napon belül visszaküldeni. A visszaküldés közvetlen költsége a vásárlót terheli. A terméket nem használt, sértetlen állapotban, lehetőség szerint az eredeti csomagolásban kérjük visszaküldeni. A szolgáltató fenntartja a jogot, hogy visszaélésszerű elállás vagy ismétlődő indokolatlan visszaküldés esetén a további rendelések teljesítését megtagadja."
            />

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h3" defaultValue="Át nem vett csomag" />
            </h3>
            <EditableText
              as="p"
              contentKey="contact.return.p4"
              defaultValue="Amennyiben a vásárló a megrendelt csomagot nem veszi át, és az a szolgáltatóhoz visszaérkezik, az nem minősül az elállási jog gyakorlásának. Ebben az esetben a szolgáltató jogosult a felmerült szállítási és kezelési költségeket a visszatérítendő összegből levonni, vagy - utánvétes rendelés esetén - a vásárlóval szemben érvényesíteni. A vásárló a csomag újbóli kiküldését kizárólag a szállítási költségek előzetes megfizetését követően kérheti."
            />

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h4" defaultValue="Visszatérítés" />
            </h3>
            <EditableText
              as="p"
              contentKey="contact.return.p5"
              defaultValue="Az elállás elfogadását követően a szolgáltató a visszaküldött termék beérkezésétől számított, de legkésőbb az elállásról való tudomásszerzéstől számított 14 napon belül visszatéríti a termék vételárát. A visszatérítés az eredeti fizetési móddal megegyező módon történik, kivéve, ha a felek ettől eltérően állapodnak meg. Utánvétes fizetés esetén a visszatérítés banki átutalással történik, a vásárló által megadott bankszámlaszámra. Elállás esetén a szolgáltató a vásárló által megfizetett szállítási díjat legfeljebb a legolcsóbb szállítási mód díjáig téríti vissza; mivel ez a személyes átvétel, amely díjmentes, szállítási díj visszatérítésére nem kerül sor. A szolgáltató jogosult a visszatérítést addig visszatartani, amíg a termék vissza nem érkezik."
            />

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h5" defaultValue="Elállási jog alóli kivételek" />
            </h3>
            <EditableText
              as="p"
              contentKey="contact.return.p6"
              defaultValue="A kézzel készült termékek jellegéből adódóan az egyes darabok között kisebb szín-, forma- vagy díszítésbeli eltérések előfordulhatnak, amelyek nem minősülnek hibának. Az illatérzet szubjektív, ezért az illat intenzitása vagy jellege miatti eltérés nem minősül hibás teljesítésnek. Jelentős hőváltozás esetén előfordul, hogy a gyertya falán jegesedés - úgynevezett frosting - jelenik meg, ami a 100% szójaviaszból készült gyertyák esetén gyakori, a gyertya minőségét igazolja. Az égést és a gyertya illatát nem befolyásolja, nem tekinthető hibának. A fogyasztót nem illeti meg az elállási jog olyan termékek esetében, amelyek a vásárló egyedi kérésére, személyre szabottan készültek (például egyedi felirat, név, dátum, külön kért szín- vagy illatkombináció). A vásárló által hibásan megadott szállítási adatokból eredő késedelemért vagy sikertelen kézbesítésért a szolgáltató nem vállal felelősséget."
            />

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h7" defaultValue="Sérült termék esetén" />
            </h3>
            <div>
              <EditableText
                as="p"
                contentKey="contact.return.p7"
                defaultValue="Amennyiben a vásárló a csomag átvételekor vagy kibontásakor sérült terméket észlel (például törött, repedt gyertya), kérjük, haladéktalanul, de legkésőbb 48 órán belül jelezze azt e-mailben az alábbi elérhetőségen: E-mail: hello@candlie.hu A bejelentéshez kérjük csatolni:"
              />
              <ul className="list-disc pl-5">
                <li>
                  <EditableText as="span" contentKey="contact.return.p7_li1" defaultValue="a sérült termékről készült fotókat" />
                </li>
                <li>
                  <EditableText as="span" contentKey="contact.return.p7_li2" defaultValue="a csomagolásról készült fotót (ha látható rajta sérülés)" />
                </li>
              </ul>
              <EditableText
                as="p"
                contentKey="contact.return.p8"
                defaultValue="Szállítás közben megsérült termék esetén a visszaküldés költsége a szolgáltatót terheli, és a vásárló választása szerint: csereterméket küldünk, vagy a teljes vételárat visszatérítjük."
              />
            </div>

            <h3 className="text-base font-semibold" style={{ color: 'rgb(115, 85, 115)' }}>
              <EditableText as="span" contentKey="contact.return.h6" defaultValue="Elállási nyilatkozat-minta" />
            </h3>
            <EditableText
              as="p"
              contentKey="contact.return.p9"
              defaultValue="Alulírott ……………………………………… kijelentem, hogy elállok a ……………………………………… termék(ek) adásvételére irányuló szerződéstől. Rendelés száma: ……………………Átvétel dátuma: …………………… Név: ………………………………………Cím: ………………………………………Dátum: …………………… Aláírás (papíron történő nyilatkozat esetén)"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
