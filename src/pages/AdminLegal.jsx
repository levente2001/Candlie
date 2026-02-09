import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '../components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileUp } from 'lucide-react';

export default function AdminLegal() {
  const [collapsed, setCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ aszf_url: '', privacy_url: '' });

  const qc = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['admin-legal-docs'],
    queryFn: () => base44.entities.LegalDoc.list('-created_date'),
  });

  const currentDoc = useMemo(() => docs.find((d) => d.key === 'legal') || docs[0], [docs]);

  React.useEffect(() => {
    if (currentDoc) {
      setForm({
        aszf_url: currentDoc.aszf_url || '',
        privacy_url: currentDoc.privacy_url || '',
      });
    }
  }, [currentDoc]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        key: 'legal',
        aszf_url: form.aszf_url.trim(),
        privacy_url: form.privacy_url.trim(),
      };
      if (currentDoc?.id) {
        return base44.entities.LegalDoc.update(currentDoc.id, payload);
      }
      return base44.entities.LegalDoc.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-legal-docs'] });
    },
  });

  const uploadFile = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, [field]: file_url }));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">ÁSZF és Adatkezelés</h1>
            <p className="text-black/60">Töltsd fel vagy cseréld a jogi dokumentumokat.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-black/10">
            {isLoading ? (
              <div className="flex items-center gap-3 text-black/60">
                <Loader2 className="w-5 h-5 animate-spin" />
                Adatok betöltése...
              </div>
            ) : (
              <>
                <div>
                  <Label>ÁSZF (URL vagy feltöltés)</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={form.aszf_url}
                      onChange={(e) => setForm({ ...form, aszf_url: e.target.value })}
                      className="flex-1"
                      placeholder="https://..."
                    />
                    <label className="flex items-center justify-center w-12 h-10 bg-black/5 rounded-lg cursor-pointer hover:bg-black/10 transition-colors border border-black/10">
                      <FileUp className="w-5 h-5 text-black/50" />
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => uploadFile(e, 'aszf_url')} />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Adatkezelési tájékoztató (URL vagy feltöltés)</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={form.privacy_url}
                      onChange={(e) => setForm({ ...form, privacy_url: e.target.value })}
                      className="flex-1"
                      placeholder="https://..."
                    />
                    <label className="flex items-center justify-center w-12 h-10 bg-black/5 rounded-lg cursor-pointer hover:bg-black/10 transition-colors border border-black/10">
                      <FileUp className="w-5 h-5 text-black/50" />
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => uploadFile(e, 'privacy_url')} />
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saveMutation.isPending || isUploading}
                  className="w-full h-12 bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white font-semibold rounded-xl"
                >
                  {saveMutation.isPending || isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mentés'}
                </Button>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
