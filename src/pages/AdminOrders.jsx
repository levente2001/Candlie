import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { sendStatusUpdateEmail } from '@/lib/emailNotifications';

const statusConfig = {
  pending: { label: 'Függőben', icon: Clock, color: 'bg-yellow-500/20 text-yellow-500' },
  processing: { label: 'Feldolgozás', icon: Package, color: 'bg-blue-500/20 text-blue-500' },
  shipped: { label: 'Szállítva', icon: Truck, color: 'bg-purple-500/20 text-purple-500' },
  delivered: { label: 'Kézbesítve', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-500' },
  cancelled: { label: 'Törölve', icon: XCircle, color: 'bg-red-500/20 text-red-500' },
  payment_pending: { label: 'Fizetésre vár', icon: Clock, color: 'bg-yellow-500/20 text-yellow-500' },
  paid: { label: 'Fizetve', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-500' },
};

export default function AdminOrders() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (order, newStatus) => {
    if (!order?.id) return;
    if (order.status === newStatus) return;

    setStatusMessage('');
    try {
      const updatedOrder = await updateMutation.mutateAsync({ id: order.id, data: { status: newStatus } });

      try {
        const mailResult = await sendStatusUpdateEmail(updatedOrder, newStatus);
        if (mailResult?.ok) {
          setStatusMessage('Státusz mentve és email kiküldve.');
        }
      } catch (mailErr) {
        console.warn('Status email failed:', mailErr);
        setStatusMessage('Státusz mentve, de az email küldése sikertelen.');
      }
    } catch (err) {
      setStatusMessage(err?.message || 'A státusz mentése sikertelen.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Rendelések</h1>
            <p className="text-black/60">{orders.length} rendelés összesen</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
              <Input
                placeholder="Keresés név vagy email alapján..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl">
                <SelectValue placeholder="Státusz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes státusz</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {statusMessage && <p className="mb-4 text-sm text-black/70">{statusMessage}</p>}

          {/* Orders Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--candlie-pink-primary)]" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-black/40 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nincs rendelés</h3>
              <p className="text-black/60">Még nem érkezett rendelés.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10">
                      <th className="text-left p-4 text-black/60 font-medium">Vásárló</th>
                      <th className="text-left p-4 text-black/60 font-medium">Dátum</th>
                      <th className="text-left p-4 text-black/60 font-medium">Tételek</th>
                      <th className="text-left p-4 text-black/60 font-medium">Összeg</th>
                      <th className="text-left p-4 text-black/60 font-medium">Státusz</th>
                      <th className="text-left p-4 text-black/60 font-medium">Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredOrders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-black/10 hover:bg-black/5 transition-colors"
                          >
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{order.customer_name}</p>
                                <p className="text-sm text-black/60">{order.customer_email}</p>
                              </div>
                            </td>
                            <td className="p-4 text-black/60">
                              {format(new Date(order.created_date), 'MMM d, HH:mm', { locale: hu })}
                            </td>
                            <td className="p-4 text-black/60">
                              {order.items?.length || 0} tétel
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-[var(--candlie-pink-secondary)]">
                                {order.total_amount?.toLocaleString('hu-HU')} Ft
                              </span>
                            </td>
                            <td className="p-4">
                              <Badge className={`${status.color} border-0`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-black/60 hover:text-black"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateStatus(order, value)}
                                >
                                  <SelectTrigger className="w-[140px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rendelés részletei</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/5 rounded-xl p-4">
                  <h4 className="text-sm text-black/60 mb-2">Vásárló</h4>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-black/60">{selectedOrder.customer_email}</p>
                  <p className="text-sm text-black/60">{selectedOrder.customer_phone}</p>
                </div>
                <div className="bg-black/5 rounded-xl p-4">
                  <h4 className="text-sm text-black/60 mb-2">Szállítási cím</h4>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                </div>
                <div className="bg-black/5 rounded-xl p-4">
                  <h4 className="text-sm text-black/60 mb-2">Számlázási cím</h4>
                  <p className="text-sm">{selectedOrder.billing_address || 'Nincs megadva'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm text-black/60 mb-3">Tételek</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-black/5 rounded-xl p-4">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-black/60">
                          Méret: {item.size} | Mennyiség: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[var(--candlie-pink-secondary)]">
                        {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                <span className="text-lg font-medium">Összesen:</span>
                <span className="text-2xl font-semibold text-[var(--candlie-pink-secondary)]">
                  {selectedOrder.total_amount?.toLocaleString('hu-HU')} Ft
                </span>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-black/5 rounded-xl p-4">
                  <h4 className="text-sm text-black/60 mb-2">Megjegyzés</h4>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
