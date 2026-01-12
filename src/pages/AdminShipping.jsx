import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/admin/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminShipping() {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const qc = useQueryClient();

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["admin-shipping-methods"],
    queryFn: () => base44.entities.ShippingMethod.list("-created_date"),
  });

  const sorted = useMemo(() => {
    return [...methods].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [methods]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ShippingMethod.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      setIsModalOpen(false);
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShippingMethod.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      setIsModalOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShippingMethod.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] }),
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "1490",
    free_over: "15000",
    sort_order: "10",
    active: true,
    eta: "1-2 munkanap",
  });

  const openModal = (m = null) => {
    if (m) {
      setForm({
        name: m.name || "",
        description: m.description || "",
        price: (m.price ?? 0).toString(),
        free_over: m.free_over != null ? String(m.free_over) : "",
        sort_order: m.sort_order != null ? String(m.sort_order) : "10",
        active: m.active !== false,
        eta: m.eta || "",
      });
      setEditing(m);
    } else {
      setForm({
        name: "",
        description: "",
        price: "1490",
        free_over: "15000",
        sort_order: "10",
        active: true,
        eta: "1-2 munkanap",
      });
      setEditing(null);
    }
    setIsModalOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      eta: form.eta.trim(),
      active: !!form.active,
      price: Math.max(0, Math.round(Number(form.price || 0))),
      free_over: form.free_over === "" ? null : Math.max(0, Math.round(Number(form.free_over || 0))),
      sort_order: form.sort_order === "" ? null : Math.round(Number(form.sort_order || 0)),
    };

    if (!payload.name) return;

    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-[280px]"}`}>
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Truck className="w-7 h-7 text-[#F7931A]" /> Szállítási módok
              </h1>
              <p className="text-gray-400">{methods.length} mód</p>
            </div>
            <Button
              onClick={() => openModal()}
              className="bg-[#F7931A] hover:bg-[#f5a623] text-black font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Új szállítási mód
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#F7931A]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {sorted.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg truncate">{m.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              m.active === false
                                ? "bg-white/10 text-gray-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {m.active === false ? "Inaktív" : "Aktív"}
                          </span>
                        </div>
                        {m.description && <p className="text-sm text-gray-400 mt-1">{m.description}</p>}
                        <p className="text-sm text-gray-400 mt-2">
                          Díj: <span className="text-white">{(m.price ?? 0).toLocaleString("hu-HU")} Ft</span>
                          {m.free_over != null && (
                            <>
                              {" "}
                              • Ingyenes{" "}
                              <span className="text-white">
                                {(m.free_over ?? 0).toLocaleString("hu-HU")} Ft felett
                              </span>
                            </>
                          )}
                        </p>
                        {m.eta && <p className="text-xs text-gray-500 mt-1">ETA: {m.eta}</p>}
                        <p className="text-xs text-gray-500 mt-1">Sort: {m.sort_order ?? "—"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(m)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(m.id)}
                          className="text-gray-400 hover:text-red-400"
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
        <DialogContent className="bg-[#1a1a1a] border-white/10 max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Szállítási mód szerkesztése" : "Új szállítási mód"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Név *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                placeholder="pl.: GLS házhozszállítás"
                required
              />
            </div>

            <div>
              <Label className="text-gray-300">Leírás</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 bg-[#252525] border-white/10 rounded-xl"
                rows={2}
                placeholder="pl.: kézbesítés munkanapokon"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Díj (Ft)</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-gray-300">Ingyenes felett (Ft)</Label>
                <Input
                  value={form.free_over}
                  onChange={(e) => setForm({ ...form, free_over: e.target.value })}
                  className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                  placeholder="üres = nincs"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-gray-300">Sort order</Label>
                <Input
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-gray-300">ETA</Label>
                <Input
                  value={form.eta}
                  onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  className="mt-2 bg-[#252525] border-white/10 h-12 rounded-xl"
                  placeholder="pl.: 1-2 munkanap"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#252525] rounded-xl p-4 border border-white/10">
              <div>
                <p className="font-medium">Aktív</p>
                <p className="text-sm text-gray-400">Checkouton csak az aktív módok látszanak.</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full h-12 bg-[#F7931A] hover:bg-[#f5a623] text-black font-semibold rounded-xl"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Mentés...
                </>
              ) : (
                "Mentés"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
