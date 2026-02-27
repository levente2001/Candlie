import React, { useMemo, useState } from 'react';
import { useSiteContentMap, useSaveSiteContent } from '@/hooks/useSiteContent';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { EMAIL_CONTENT_KEYS } from '@/lib/emailNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Függőben' },
  { value: 'processing', label: 'Feldolgozás' },
  { value: 'shipped', label: 'Szállítva' },
  { value: 'delivered', label: 'Kézbesítve' },
  { value: 'cancelled', label: 'Törölve' },
  { value: 'payment_pending', label: 'Fizetésre vár' },
  { value: 'paid', label: 'Fizetve' },
];

const DEFAULTS = {
  [EMAIL_CONTENT_KEYS.orderConfirmSubject]: 'Rendeles visszaigazolas - {{order_id}}',
  [EMAIL_CONTENT_KEYS.orderConfirmBody]:
    'Szia {{customer_name}}!\\n\\nKoszonjuk a rendelesedet.\\nRendeles azonosito: {{order_id}}\\nStatusz: {{order_status_label}}\\nVegosszeg: {{total_amount}} Ft\\n\\nTetel(ek):\\n{{items_summary}}\\n\\nUdvozlettel,\\nCandlie',
  [EMAIL_CONTENT_KEYS.statusSubject]: 'Rendeles statusz frissites - {{order_id}}',
  [EMAIL_CONTENT_KEYS.statusBody]:
    'Szia {{customer_name}}!\\n\\nA rendelesed statusza frissult.\\nRendeles azonosito: {{order_id}}\\nUj statusz: {{order_status_label}}\\n\\nUdvozlettel,\\nCandlie',
  [EMAIL_CONTENT_KEYS.statusTrigger]: 'processing',
};

export default function AdminEmails() {
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { data: content = {}, isLoading } = useSiteContentMap();
  const saveSiteContent = useSaveSiteContent();

  const initialForm = useMemo(
    () => ({
      orderSubject: content[EMAIL_CONTENT_KEYS.orderConfirmSubject] || DEFAULTS[EMAIL_CONTENT_KEYS.orderConfirmSubject],
      orderBody: content[EMAIL_CONTENT_KEYS.orderConfirmBody] || DEFAULTS[EMAIL_CONTENT_KEYS.orderConfirmBody],
      statusSubject: content[EMAIL_CONTENT_KEYS.statusSubject] || DEFAULTS[EMAIL_CONTENT_KEYS.statusSubject],
      statusBody: content[EMAIL_CONTENT_KEYS.statusBody] || DEFAULTS[EMAIL_CONTENT_KEYS.statusBody],
      triggerStatus: content[EMAIL_CONTENT_KEYS.statusTrigger] || DEFAULTS[EMAIL_CONTENT_KEYS.statusTrigger],
    }),
    [content]
  );

  const [form, setForm] = useState(initialForm);

  React.useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const onSave = async () => {
    setSaving(true);
    setStatusMessage('');
    try {
      await Promise.all([
        saveSiteContent(EMAIL_CONTENT_KEYS.orderConfirmSubject, form.orderSubject),
        saveSiteContent(EMAIL_CONTENT_KEYS.orderConfirmBody, form.orderBody),
        saveSiteContent(EMAIL_CONTENT_KEYS.statusSubject, form.statusSubject),
        saveSiteContent(EMAIL_CONTENT_KEYS.statusBody, form.statusBody),
        saveSiteContent(EMAIL_CONTENT_KEYS.statusTrigger, form.triggerStatus),
      ]);
      setStatusMessage('Email beallitasok mentve.');
    } catch (err) {
      setStatusMessage(err?.message || 'Mentési hiba tortent.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8 max-w-5xl">
          <h1 className="text-3xl font-semibold mb-2">Email template</h1>
          <p className="text-black/60 mb-8">
            Valtozok: {'{{customer_name}}'}, {'{{order_id}}'}, {'{{order_status_label}}'}, {'{{total_amount}}'}, {'{{items_summary}}'}
          </p>

          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--candlie-pink-primary)]" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-black/10 space-y-4">
                <h2 className="text-xl font-semibold">1) Rendelés visszaigazoló email</h2>
                <div className="space-y-2">
                  <Label>Targy</Label>
                  <Input
                    value={form.orderSubject}
                    onChange={(e) => setForm((prev) => ({ ...prev, orderSubject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uzenet</Label>
                  <Textarea
                    rows={10}
                    value={form.orderBody}
                    onChange={(e) => setForm((prev) => ({ ...prev, orderBody: e.target.value }))}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-black/10 space-y-4">
                <h2 className="text-xl font-semibold">2) Státusz email</h2>
                <div className="space-y-2">
                  <Label>Trigger státusz </Label>
                  <Select
                    value={form.triggerStatus}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, triggerStatus: value }))}
                  >
                    <SelectTrigger className="h-11 max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Targy</Label>
                  <Input
                    value={form.statusSubject}
                    onChange={(e) => setForm((prev) => ({ ...prev, statusSubject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uzenet</Label>
                  <Textarea
                    rows={8}
                    value={form.statusBody}
                    onChange={(e) => setForm((prev) => ({ ...prev, statusBody: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button type="button" onClick={onSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mentes'}
                </Button>
                {statusMessage && <p className="text-sm text-black/70">{statusMessage}</p>}
              </div>

              
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
