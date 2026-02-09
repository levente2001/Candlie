import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AdminFeedbacks() {
  const [collapsed, setCollapsed] = useState(false);
  const qc = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: () => base44.entities.Feedback.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Feedback.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-feedbacks'] }),
  });

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-[var(--candlie-pink-primary)]" /> Visszajelzések
              </h1>
              <p className="text-black/60">{feedbacks.length} beérkezett</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--candlie-pink-primary)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {feedbacks.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl p-5 border border-black/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg truncate">{f.name || 'Névtelen'}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            f.approved ? 'bg-emerald-500/20 text-emerald-600' : 'bg-black/10 text-black/50'
                          }`}>
                            {f.approved ? 'Kiemelve' : 'Rejtett'}
                          </span>
                        </div>
                        {f.created_date && (
                          <p className="text-xs text-black/50 mt-1">
                            {new Date(f.created_date).toLocaleString('hu-HU')}
                          </p>
                        )}
                        <p className="text-sm text-black/70 mt-3 whitespace-pre-line">{f.message}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!f.approved}
                          onCheckedChange={(v) => updateMutation.mutate({ id: f.id, data: { approved: v } })}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
