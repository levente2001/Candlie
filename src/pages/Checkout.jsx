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
  return price;
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
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
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // COD success UX
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    residential_zip: '',
    residential_city: '',
    residential_street: '',
    residential_house: '',
    shipping_zip: '',
    shipping_city: '',
    shipping_street: '',
    shipping_house: '',
    billing_zip: '',
    billing_city: '',
    billing_street: '',
    billing_house: '',
    notes: '',
  });

  const updateField = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (billingSameAsShipping && key.startsWith('shipping_')) {
        const suffix = key.replace('shipping_', '');
        next[`billing_${suffix}`] = value;
      }
      return next;
    });
  };

  const applyShippingToBilling = () => {
    setFormData((prev) => ({
      ...prev,
      billing_zip: prev.shipping_zip,
      billing_city: prev.shipping_city,
      billing_street: prev.shipping_street,
      billing_house: prev.shipping_house,
    }));
  };

  const clearBilling = () => {
    setFormData((prev) => ({
      ...prev,
      billing_zip: '',
      billing_city: '',
      billing_street: '',
      billing_house: '',
    }));
  };

  const formatAddress = (prefix, data) => {
    const zip = data[`${prefix}_zip`]?.trim();
    const city = data[`${prefix}_city`]?.trim();
    const street = data[`${prefix}_street`]?.trim();
    const house = data[`${prefix}_house`]?.trim();
    return [zip, city, street, house].filter(Boolean).join(', ');
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cryptoCart') || '[]');
    setCart(savedCart);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: shippingMethods = [], isLoading: shippingLoading } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => base44.entities.ShippingMethod.list('-created_date'),
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date'),
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
    : 1490;

  const computeDiscount = (coupon, sub) => {
    if (!coupon) return 0;
    if (coupon.active === false) return 0;
    if (coupon.min_subtotal != null && sub < Number(coupon.min_subtotal || 0)) return 0;
    const value = Math.max(0, Number(coupon.value || 0));
    if (coupon.type === 'percent') {
      return Math.min(sub, Math.round((sub * value) / 100));
    }
    return Math.min(sub, Math.round(value));
  };

  const discountAmount = computeDiscount(appliedCoupon, subtotal);
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  const applyCoupon = () => {
    setCouponError('');
    const code = normalizeCode(couponCode);
    if (!code) return;
    const found = coupons.find((c) => normalizeCode(c.code) === code);
    if (!found) {
      setAppliedCoupon(null);
      setCouponError('Nincs ilyen kuponkód.');
      return;
    }
    if (found.active === false) {
      setAppliedCoupon(null);
      setCouponError('Ez a kupon inaktív.');
      return;
    }
    if (found.min_subtotal != null && subtotal < Number(found.min_subtotal || 0)) {
      setAppliedCoupon(null);
      setCouponError(`A kupon minimum kosárértéke ${(found.min_subtotal || 0).toLocaleString('hu-HU')} Ft.`);
      return;
    }
    if (found.max_uses != null && Number(found.max_uses) <= 0) {
      setAppliedCoupon(null);
      setCouponError('A kupon elfogyott.');
      return;
    }
    setAppliedCoupon(found);
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  useEffect(() => {
    if (!appliedCoupon) return;
    if (appliedCoupon.min_subtotal != null && subtotal < Number(appliedCoupon.min_subtotal || 0)) {
      setCouponError(`A kupon minimum kosárértéke ${(appliedCoupon.min_subtotal || 0).toLocaleString('hu-HU')} Ft.`);
      setAppliedCoupon(null);
    }
  }, [appliedCoupon, subtotal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) return setError('A kosarad üres.');
    if (activeShipping.length > 0 && !selectedShipping) return setError('Válassz szállítási módot.');
    if (!careAccepted) return setError('A továbbhaladáshoz el kell fogadnod a CANDLIE Care útmutatót.');

    setIsSubmitting(true);

    try {
      const isCOD = paymentMethod === 'cod';

      const shippingAddress = formatAddress('shipping', formData);
      const residentialAddress = formatAddress('residential', formData);
      const billingAddress = billingSameAsShipping
        ? shippingAddress
        : formatAddress('billing', formData);

      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: shippingAddress,
        residential_address: residentialAddress,
        billing_address: billingAddress,
        notes: formData.notes,
        coupon_code: appliedCoupon?.code || '',
        coupon_name: appliedCoupon?.name || '',
        coupon_type: appliedCoupon?.type || '',
        coupon_value: appliedCoupon?.value ?? null,
        coupon_campaign: appliedCoupon?.campaign || '',
        coupon_discount: discountAmount,

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
              free_over: null,
              amount: shippingAmount,
            }
          : {
              id: null,
              name: 'Szállítás',
              description: '',
              eta: '',
              price: shippingAmount,
              free_over: null,
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
          discountAmount,
          couponCode: appliedCoupon?.code || '',
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
                    onChange={(e) => updateField('name', e.target.value)}
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
                    onChange={(e) => updateField('email', e.target.value)}
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
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="+36 30 123 4567"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div>
                  <Label htmlFor="residential_zip" className="text-black/70">Lakcím irányítószám *</Label>
                  <Input
                    id="residential_zip"
                    required
                    value={formData.residential_zip}
                    onChange={(e) => updateField('residential_zip', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <Label htmlFor="residential_city" className="text-black/70">Lakcím város *</Label>
                  <Input
                    id="residential_city"
                    required
                    value={formData.residential_city}
                    onChange={(e) => updateField('residential_city', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Budapest"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="residential_street" className="text-black/70">Lakcím utca *</Label>
                  <Input
                    id="residential_street"
                    required
                    value={formData.residential_street}
                    onChange={(e) => updateField('residential_street', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Példa utca"
                  />
                </div>
                <div>
                  <Label htmlFor="residential_house" className="text-black/70">Lakcím házszám *</Label>
                  <Input
                    id="residential_house"
                    required
                    value={formData.residential_house}
                    onChange={(e) => updateField('residential_house', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="12"
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
                </div>
              )}

              <div className="mt-6 grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="shipping_zip" className="text-black/70">Szállítási irányítószám *</Label>
                  <Input
                    id="shipping_zip"
                    required
                    value={formData.shipping_zip}
                    onChange={(e) => updateField('shipping_zip', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_city" className="text-black/70">Szállítási város *</Label>
                  <Input
                    id="shipping_city"
                    required
                    value={formData.shipping_city}
                    onChange={(e) => updateField('shipping_city', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Budapest"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="shipping_street" className="text-black/70">Szállítási utca *</Label>
                  <Input
                    id="shipping_street"
                    required
                    value={formData.shipping_street}
                    onChange={(e) => updateField('shipping_street', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Példa utca"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_house" className="text-black/70">Szállítási házszám *</Label>
                  <Input
                    id="shipping_house"
                    required
                    value={formData.shipping_house}
                    onChange={(e) => updateField('shipping_house', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="notes" className="text-black/70">Megjegyzés (opcionális)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="mt-2 rounded-xl"
                  placeholder="Pl.: csengőnél hívjon"
                  rows={2}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold">Számlázási cím</h2>
                <label className="flex items-center gap-2 text-sm text-black/70">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBillingSameAsShipping(checked);
                      if (checked) applyShippingToBilling();
                      else clearBilling();
                    }}
                    className="h-4 w-4 rounded border-black/20 text-[var(--candlie-pink-primary)]"
                  />
                  Számlázási cím megegyezik a szállítási címmel
                </label>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="billing_zip" className="text-black/70">Számlázási irányítószám *</Label>
                  <Input
                    id="billing_zip"
                    required
                    disabled={billingSameAsShipping}
                    value={formData.billing_zip}
                    onChange={(e) => updateField('billing_zip', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <Label htmlFor="billing_city" className="text-black/70">Számlázási város *</Label>
                  <Input
                    id="billing_city"
                    required
                    disabled={billingSameAsShipping}
                    value={formData.billing_city}
                    onChange={(e) => updateField('billing_city', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Budapest"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="billing_street" className="text-black/70">Számlázási utca *</Label>
                  <Input
                    id="billing_street"
                    required
                    disabled={billingSameAsShipping}
                    value={formData.billing_street}
                    onChange={(e) => updateField('billing_street', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="Példa utca"
                  />
                </div>
                <div>
                  <Label htmlFor="billing_house" className="text-black/70">Számlázási házszám *</Label>
                  <Input
                    id="billing_house"
                    required
                    disabled={billingSameAsShipping}
                    value={formData.billing_house}
                    onChange={(e) => updateField('billing_house', e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    placeholder="12"
                  />
                </div>
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
              <h2 className="text-xl font-semibold mb-4">Kupon</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="Kuponkód"
                />
                <Button
                  type="button"
                  onClick={applyCoupon}
                  className="h-12 bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white"
                >
                  Alkalmaz
                </Button>
                {appliedCoupon && (
                  <Button type="button" variant="outline" onClick={clearCoupon} className="h-12 border-black/10">
                    Törlés
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <div className="mt-3 inline-flex items-center gap-2 text-sm">
                  <span
                    className="px-2.5 py-1 rounded-full text-white font-semibold"
                    style={{ backgroundColor: appliedCoupon.color || '#735573' }}
                  >
                    {appliedCoupon.code}
                  </span>
                  <span className="text-black/60">
                    {appliedCoupon.type === 'percent'
                      ? `${appliedCoupon.value || 0}%`
                      : `${(appliedCoupon.value || 0).toLocaleString('hu-HU')} Ft`}{' '}
                    kedvezmény
                  </span>
                </div>
              )}
              {couponError && <p className="text-sm text-red-600 mt-2">{couponError}</p>}
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

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Kedvezmény</span>
                    <span>-{discountAmount.toLocaleString('hu-HU')} Ft</span>
                  </div>
                )}

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
                * Az árak forintban értendők.
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
