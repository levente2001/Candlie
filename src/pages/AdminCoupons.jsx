import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const typeOptions = [
  { id: 'percent', name: '%' },
  { id: 'amount', name: 'Fix összeg' },
];

export default function AdminCoupons() {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const qc = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date'),
  });

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'percent',
    value: '10',
    color: '#735573',
    campaign: '',
    min_subtotal: '',
    max_uses: '',
    active: true,
  });

  const openModal = (c = null) => {
    if (c) {
      setForm({
        code: c.code || '',
        name: c.name || '',
        type: c.type || 'percent',
        value: c.value != null ? String(c.value) : '10',
        color: c.color || '#735573',
        campaign: c.campaign || '',
        min_subtotal: c.min_subtotal != null ? String(c.min_subtotal) : '',
        max_uses: c.max_uses != null ? String(c.max_uses) : '',
        active: c.active !== false,
      });
      setEditing(c);
    } else {
      setForm({
        code: '',
        name: '',
        type: 'percent',
        value: '10',
        color: '#735573',
        campaign: '',
        min_subtotal: '',
        max_uses: '',
        active: true,
      });
      setEditing(null);
    }
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Coupon.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsModalOpen(false);
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Coupon.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsModalOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Coupon.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      value: Math.max(0, Math.round(Number(form.value || 0))),
      color: form.color || '#735573',
      campaign: form.campaign.trim(),
      min_subtotal: form.min_subtotal === '' ? null : Math.max(0, Math.round(Number(form.min_subtotal || 0))),
      max_uses: form.max_uses === '' ? null : Math.max(0, Math.round(Number(form.max_uses || 0))),
      active: !!form.active,
    };

    if (!payload.code || !payload.name) return;

    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
                <Tag className="w-7 h-7 text-[var(--candlie-pink-primary)]" /> Kuponok
              </h1>
              <p className="text-black/60">{coupons.length} kupon</p>
            </div>
            <Button
              onClick={() => openModal()}
              className="bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Új kupon
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--candlie-pink-primary)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {coupons.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-5 border border-black/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: c.color || '#735573' }}
                          >
                            {c.code}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              c.active === false
                                ? 'bg-black/10 text-black/50'
                                : 'bg-emerald-500/20 text-emerald-600'
                            }`}
                          >
                            {c.active === false ? 'Inaktív' : 'Aktív'}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mt-2 truncate">{c.name}</h3>
                        <p className="text-sm text-black/60 mt-1">
                          {c.type === 'percent' ? `${c.value || 0}%` : `${(c.value || 0).toLocaleString('hu-HU')} Ft`} kedvezmény
                        </p>
                        {c.campaign && <p className="text-xs text-black/50 mt-1">Kampány: {c.campaign}</p>}
                        {c.min_subtotal != null && (
                          <p className="text-xs text-black/50 mt-1">
                            Minimum kosár: {(c.min_subtotal || 0).toLocaleString('hu-HU')} Ft
                          </p>
                        )}
                        {c.max_uses != null && (
                          <p className="text-xs text-black/50 mt-1">Max felhasználás: {c.max_uses}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(c)}
                          className="text-black/60 hover:text-black"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(c.id)}
                          className="text-black/60 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kupon szerkesztése' : 'Új kupon'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Kód *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  placeholder="PL10"
                  required
                />
              </div>
              <div>
                <Label>Név *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  placeholder="Téli akció"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Típus</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Érték</Label>
                <Input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Szín</Label>
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  placeholder="#735573"
                />
              </div>
              <div>
                <Label>Kampány</Label>
                <Input
                  value={form.campaign}
                  onChange={(e) => setForm({ ...form, campaign: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  placeholder="Black Friday"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Min. kosár (Ft)</Label>
                <Input
                  value={form.min_subtotal}
                  onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label>Max felhasználás</Label>
                <Input
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  className="mt-2 h-12 rounded-xl"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/5 rounded-xl p-4 border border-black/10">
              <div>
                <p className="font-medium">Aktív</p>
                <p className="text-sm text-black/60">Csak aktív kupon jelenik meg checkouton.</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full h-12 bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white font-semibold rounded-xl"
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mentés'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
