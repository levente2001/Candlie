import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CreditCard, AlertTriangle, Banknote } from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function calcShippingAmount(method, subtotal) {
  if (!method) return 0;
  const price = Math.max(0, Math.round(Number(method.price ?? 0)));
  const freeOver = method.free_over == null ? null : Math.max(0, Math.round(Number(method.free_over)));
  if (freeOver != null && subtotal >= freeOver) return 0;
  return price;
}

export default function Checkout() {
  const [params] = useSearchParams();
  const canceled = params.get('canceled') === '1';

  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 'stripe' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [careAccepted, setCareAccepted] = useState(false);
  const [showCareModal, setShowCareModal] = useState(false);

  // COD success UX
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
    setCart(savedCart);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: shippingMethods = [], isLoading: shippingLoading } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => base44.entities.ShippingMethod.list('-created_date'),
  });

  const activeShipping = useMemo(() => {
    return [...shippingMethods]
      .filter((m) => m.active !== false)
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [shippingMethods]);

  const [shippingId, setShippingId] = useState('');

  useEffect(() => {
    if (!shippingId && activeShipping.length > 0) setShippingId(activeShipping[0].id);
  }, [activeShipping, shippingId]);

  const selectedShipping = activeShipping.find((m) => m.id === shippingId) || activeShipping[0] || null;

  const shippingAmount = activeShipping.length
    ? calcShippingAmount(selectedShipping, subtotal)
    : (subtotal > 15000 ? 0 : 1490);

  const total = subtotal + shippingAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) return setError('A kosarad üres.');
    if (activeShipping.length > 0 && !selectedShipping) return setError('Válassz szállítási módot.');
    if (!careAccepted) return setError('A továbbhaladáshoz el kell fogadnod a CANDLIE Care útmutatót.');

    setIsSubmitting(true);

    try {
      const isCOD = paymentMethod === 'cod';

      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        notes: formData.notes,

        payment_method: isCOD ? 'cod' : 'stripe',

        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),

        subtotal_amount: subtotal,
        shipping: selectedShipping
          ? {
              id: selectedShipping.id,
              name: selectedShipping.name,
              description: selectedShipping.description || '',
              eta: selectedShipping.eta || '',
              price: Math.max(0, Math.round(Number(selectedShipping.price ?? 0))),
              free_over: selectedShipping.free_over ?? null,
              amount: shippingAmount,
            }
          : {
              id: null,
              name: 'Szállítás',
              description: '',
              eta: '',
              price: shippingAmount,
              free_over: 15000,
              amount: shippingAmount,
            },

        total_amount: total,

        // Stripe: payment_pending
        // COD: pending
        status: isCOD ? 'pending' : 'payment_pending',
      };

      const created = await base44.entities.Order.create(orderData);

      // COD flow: no Stripe redirect
      if (isCOD) {
        localStorage.removeItem('cryptoCart');
        setCart([]);
        setPlacedOrderId(created.id);
        setOrderPlaced(true);
        setIsSubmitting(false);
        return;
      }

      // Stripe flow
      const r = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: created.id,
          customerEmail: formData.email,
          items: cart.map((i) => ({
            id: i.id,
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          shipping: { name: (selectedShipping?.name || 'Szállítás'), amount: shippingAmount },
        }),
      });

      // safer parse (no more "Unexpected end of JSON input")
      const text = await r.text();
      let j = {};
      try { j = text ? JSON.parse(text) : {}; } catch { j = {}; }

      if (!r.ok) throw new Error(j?.error || `Stripe API error (${r.status}): ${text.slice(0, 200)}`);
      if (!j?.url) throw new Error('Stripe URL hiányzik a válaszból.');

      window.location.assign(j.url);
    } catch (err) {
      setError(err?.message || 'Hiba történt a checkout során.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    // COD success után is ide jutunk (cart cleared) — ilyenkor mutassunk visszajelzést
    if (orderPlaced) {
      return (
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[var(--candlie-bg)]">
          <div className="max-w-xl w-full bg-white rounded-2xl p-8 border border-black/10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 mb-4">
              <Banknote className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Rendelés rögzítve (utánvét)</h2>
            <p className="text-black/70 mb-6">
              Köszönjük! A rendelésed státusza <span className="text-black font-semibold">pending</span>.
              <br />
              Rendelés azonosító: <span className="text-black font-semibold">{placedOrderId}</span>
            </p>
            <Link
              to={createPageUrl('Products')}
              className="inline-flex items-center justify-center h-12 px-5 rounded-xl bg-[var(--candlie-pink-secondary)] text-white font-semibold"
            >
              Vissza a termékekhez
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[var(--candlie-bg)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">A kosarad üres</h2>
          <Link to={createPageUrl('Products')} className="text-[var(--candlie-pink-primary)] hover:underline">
            Vissza a termékekhez
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--candlie-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={createPageUrl('Cart')}
          className="inline-flex items-center gap-2 text-black/60 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Vissza a kosárhoz
        </Link>

        {canceled && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-800 flex gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">A fizetés megszakadt</p>
              <p className="text-sm text-yellow-800/80">Nyugodtan próbáld újra, a kosarad megmaradt.</p>
            </div>
          </div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-semibold mb-8"
        >
          Pénztár
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6"
          >
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-800 flex gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Hiba</p>
                  <p className="text-sm text-red-800/80">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 border border-black/10">
              <h2 className="text-xl font-semibold mb-6">Személyes adatok</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-black/70">Teljes név *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Kovács János"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-black/70">E-mail cím *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone" className="text-black/70">Telefonszám *</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="+36 30 123 4567"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/10">
              <h2 className="text-xl font-semibold mb-6">Szállítás</h2>

              {shippingLoading ? (
                <div className="flex items-center gap-3 text-black/60">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Szállítási módok betöltése...
                </div>
              ) : activeShipping.length === 0 ? (
                <p className="text-black/60">Nincs beállított szállítási mód (Admin → Kiszállítás).</p>
              ) : (
                <div>
                  <Label className="text-black/70">Szállítási mód *</Label>
                  <Select value={shippingId} onValueChange={setShippingId}>
                    <SelectTrigger className="mt-2 h-12 rounded-xl">
                      <SelectValue placeholder="Válassz" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeShipping.map((m) => {
                        const amount = calcShippingAmount(m, subtotal);
                        const suffix = amount === 0 ? 'Ingyenes' : `${amount.toLocaleString('hu-HU')} Ft`;
                        return (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} • {suffix}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {selectedShipping?.description && <p className="text-sm text-black/60 mt-2">{selectedShipping.description}</p>}
                  {selectedShipping?.eta && <p className="text-xs text-black/50 mt-1">ETA: {selectedShipping.eta}</p>}
                  {selectedShipping?.free_over != null && subtotal < selectedShipping.free_over && (
                    <p className="text-sm text-[var(--candlie-pink-secondary)] mt-2">
                      Még {(selectedShipping.free_over - subtotal).toLocaleString('hu-HU')} Ft és ingyenes lesz a szállítás
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <Label htmlFor="address" className="text-black/70">Szállítási cím *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="1234 Budapest, Példa utca 12."
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="notes" className="text-black/70">Megjegyzés (opcionális)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-2 rounded-xl"
                  placeholder="Pl.: csengőnél hívjon"
                  rows={2}
                />
              </div>
            </div>

            {/* Fizetési mód */}
            <div className="bg-white rounded-2xl p-6 border border-black/10">
              <h2 className="text-xl font-semibold mb-4">Fizetési mód</h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`text-left rounded-2xl p-4 border transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-[var(--candlie-pink-primary)]/60 bg-[#f7f2f7]'
                      : 'border-black/10 bg-white hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'stripe' ? 'bg-[var(--candlie-pink-primary)]/15 text-[var(--candlie-pink-primary)]' : 'bg-black/5 text-black/50'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Bankkártya (Stripe)</div>
                      <div className="text-xs text-black/60">Biztonságos online fizetés</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`text-left rounded-2xl p-4 border transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[var(--candlie-pink-primary)]/60 bg-[#f7f2f7]'
                      : 'border-black/10 bg-white hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'bg-[var(--candlie-pink-primary)]/15 text-[var(--candlie-pink-primary)]' : 'bg-black/5 text-black/50'
                    }`}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Utánvét</div>
                      <div className="text-xs text-black/60">Fizetés átvételkor</div>
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-xs text-black/50 mt-3">
                {paymentMethod === 'stripe'
                  ? 'A gombra kattintva átirányítunk a Stripe biztonságos fizetési oldalára.'
                  : 'A rendelésed rögzítjük, a fizetés átvételkor történik. A rendelés státusza: pending.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/10">
              <div className="flex items-start gap-3">
                <input
                  id="careAccept"
                  type="checkbox"
                  checked={careAccepted}
                  onChange={(e) => setCareAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/20 text-[var(--candlie-pink-primary)]"
                />
                <label htmlFor="careAccept" className="text-sm text-black/70">
                  Elolvastam és elfogadom a{' '}
                  <button
                    type="button"
                    onClick={() => setShowCareModal(true)}
                    className="text-[var(--candlie-pink-primary)] underline underline-offset-2"
                  >
                    CANDLIE Care – Gyertyakezelés és biztonsági útmutatót
                  </button>
                  .
                </label>
              </div>
            </div>

            {/* CTA */}
            <Button
              type="submit"
              disabled={isSubmitting || !careAccepted}
              className="w-full h-14 bg-[var(--candlie-pink-secondary)] text-white font-semibold text-lg rounded-xl hover:shadow-lg hover:shadow-[var(--candlie-pink-primary)]/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {paymentMethod === 'stripe' ? 'Átirányítás a fizetéshez...' : 'Rendelés rögzítése...'}
                </>
              ) : paymentMethod === 'stripe' ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Fizetés Stripe-pal
                </>
              ) : (
                <>
                  <Banknote className="w-5 h-5 mr-2" />
                  Megrendelem
                </>
              )}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 border border-black/10 sticky top-28">
              <h2 className="text-xl font-semibold mb-6">Összesítés</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-black/60">
                  <span>Részösszeg</span>
                  <span>{subtotal.toLocaleString('hu-HU')} Ft</span>
                </div>

                <div className="flex justify-between text-black/60">
                  <span>Szállítás</span>
                  <span>{shippingAmount === 0 ? 'Ingyenes' : `${shippingAmount.toLocaleString('hu-HU')} Ft`}</span>
                </div>

                <div className="border-t border-black/10 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Összesen</span>
                    <span className="text-[var(--candlie-pink-secondary)]">{total.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-black/50">
                * Az árak forintban értendők, tartalmazzák a <span className="text-black/70">27%-os</span> áfát.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showCareModal} onOpenChange={setShowCareModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              CANDLIE Care – Gyertyakezelés és biztonsági útmutató
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-black/70">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Ne égesd 4 óránál tovább a gyertyád egy huzamban!</li>
              <li>Mindig vágd vissza a kanóc végét a gyertya meggyújtása előtt 0,5 cm-re a tökéletes és tiszta égés érdekében!</li>
              <li>Hagyd, hogy a gyertyád széle is megolvadjon, hogy elkerüld az üregesedést!</li>
              <li>Gyerekek és kisállatok elől távol tartandó!</li>
              <li>Ne tedd ki a gyertyát közvetlen hőforrásnak!</li>
              <li>A gyertyát stabil, egyenes helyen égesd, bármilyen gyúlékony tárgytól távol tartva!</li>
              <li>Soha ne hagyd a gyertyát felügyelet nélkül!</li>
              <li>A gyertya fogyasztásra nem alkalmas, kizárólag dekoráció!</li>
            </ol>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
