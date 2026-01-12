import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CreditCard, AlertTriangle } from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        notes: formData.notes,

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
        status: 'payment_pending',
      };

      const created = await base44.entities.Order.create(orderData);

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

      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Nem sikerült Stripe session-t létrehozni.');
      if (!j?.url) throw new Error('Stripe URL hiányzik a válaszból.');

      window.location.assign(j.url);
    } catch (err) {
      setError(err?.message || 'Hiba történt a checkout során.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">A kosarad üres</h2>
          <Link to={createPageUrl('Products')} className="text-[#F7931A] hover:underline">
            Vissza a termékekhez
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('Cart')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Vissza a kosárhoz
        </Link>

        {canceled && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">A fizetés megszakadt</p>
              <p className="text-sm text-yellow-200/80">Nyugodtan próbáld újra, a kosarad megmaradt.</p>
            </div>
          </div>
        )}

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-8">
          Pénztár
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 flex gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Hiba</p>
                  <p className="text-sm text-red-200/80">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-6">Személyes adatok</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Teljes név *</Label>
                  <Input id="name" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                    placeholder="Kovács János"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">E-mail cím *</Label>
                  <Input id="email" type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone" className="text-gray-300">Telefonszám *</Label>
                  <Input id="phone" required value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                    placeholder="+36 30 123 4567"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-6">Szállítás</h2>

              {shippingLoading ? (
                <div className="flex items-center gap-3 text-gray-300">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Szállítási módok betöltése...
                </div>
              ) : activeShipping.length === 0 ? (
                <p className="text-gray-400">Nincs beállított szállítási mód (Admin → Kiszállítás).</p>
              ) : (
                <div>
                  <Label className="text-gray-300">Szállítási mód *</Label>
                  <Select value={shippingId} onValueChange={setShippingId}>
                    <SelectTrigger className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl">
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

                  {selectedShipping?.description && <p className="text-sm text-gray-400 mt-2">{selectedShipping.description}</p>}
                  {selectedShipping?.eta && <p className="text-xs text-gray-500 mt-1">ETA: {selectedShipping.eta}</p>}
                  {selectedShipping?.free_over != null && subtotal < selectedShipping.free_over && (
                    <p className="text-sm text-[#F7931A] mt-2">
                      Még {(selectedShipping.free_over - subtotal).toLocaleString('hu-HU')} Ft és ingyenes lesz a szállítás ennél a módnál.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <Label htmlFor="address" className="text-gray-300">Szállítási cím *</Label>
                <Textarea id="address" required value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 bg-[#252525] border-white/10 rounded-xl"
                  placeholder="1234 Budapest, Példa utca 12."
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="notes" className="text-gray-300">Megjegyzés (opcionális)</Label>
                <Textarea id="notes" value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-2 bg-[#252525] border-white/10 rounded-xl"
                  placeholder="Pl.: csengőnél hívjon"
                  rows={2}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-[#F7931A] to-[#f5a623] text-black font-semibold text-lg rounded-xl hover:shadow-lg hover:shadow-[#F7931A]/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Átirányítás a fizetéshez...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Fizetés Stripe-pal
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              A gombra kattintva átirányítunk a Stripe biztonságos fizetési oldalára.
            </p>
          </motion.form>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 sticky top-28">
              <h2 className="text-xl font-bold mb-6">Összesítés</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Részösszeg</span>
                  <span>{subtotal.toLocaleString('hu-HU')} Ft</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Szállítás</span>
                  <span>{shippingAmount === 0 ? 'Ingyenes' : `${shippingAmount.toLocaleString('hu-HU')} Ft`}</span>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Összesen</span>
                    <span className="text-[#F7931A]">{total.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                * A fizetés után a rendelés státusza automatikusan <span className="text-gray-300">paid</span> lesz.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
