import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCard from '../components/admin/StatsCard';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, MousePointerClick } from 'lucide-react';
import { format, subDays, startOfMonth, parseISO, startOfDay, endOfDay } from 'date-fns';
import { hu } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#F7931A', '#627EEA', '#2775CA', '#26A17B', '#8247E5'];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd')); // utolsó 30 nap
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: pageViews = [] } = useQuery({
    queryKey: ['admin-pageviews'],
    queryFn: () => base44.entities.PageView.list('-created_date', 1000),
  });

  // --- Date range helpers ---
  const from = fromDate ? startOfDay(parseISO(fromDate)) : null;
  const to = toDate ? endOfDay(parseISO(toDate)) : null;

  const inRange = (d) => {
    if (!d) return false;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return false;
    if (from && dt < from) return false;
    if (to && dt > to) return false;
    return true;
  };

  // --- Filter by date range ---
  const filteredOrders = orders.filter((o) => inRange(o.created_date));
  const filteredPageViews = pageViews.filter((pv) => inRange(pv.created_date));

  // --- Revenue ONLY from paid orders ---
  const paidOrders = filteredOrders.filter((o) => o.status === 'paid' || 'delivered');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Page views stats (within filter)
  const totalPageViews = filteredPageViews.length;
  const todayViews = filteredPageViews.filter(
    (pv) => format(new Date(pv.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;
  const uniqueSessions = new Set(filteredPageViews.map((pv) => pv.session_id).filter(Boolean)).size;

  // Conversion: fizetett rendelések / sessionök
  const conversionRate = uniqueSessions > 0 ? ((paidOrders.length / uniqueSessions) * 100).toFixed(1) : 0;

  // Chart data - Last 7 days (PAID only for revenue)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayPaidOrders = paidOrders.filter(
      (o) => format(new Date(o.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return {
      date: format(date, 'MMM d', { locale: hu }),
      revenue: dayPaidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
      orders: dayPaidOrders.length,
    };
  });

  // Category distribution
  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Order status distribution (within filter)
  const statusData = [
    { name: 'Fizetésre vár', value: filteredOrders.filter((o) => o.status === 'payment_pending').length, color: '#F59E0B' },
    { name: 'Fizetve', value: filteredOrders.filter((o) => o.status === 'paid').length, color: '#10B981' },
    { name: 'Feldolgozás', value: filteredOrders.filter((o) => o.status === 'processing').length, color: '#627EEA' },
    { name: 'Szállítva', value: filteredOrders.filter((o) => o.status === 'shipped').length, color: '#2775CA' },
    { name: 'Kézbesítve', value: filteredOrders.filter((o) => o.status === 'delivered').length, color: '#26A17B' },
  ].filter((s) => s.value > 0);

  // Recent orders (within filter)
  const recentOrders = filteredOrders.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-400">Üdv! Itt követheted a bolt teljesítményét.</p>
            </div>
          </div>

          {/* Dátum szűrés */}
          <div className="mt-6 mb-8 bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm text-gray-400 w-24">Kezdő</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-[#252525] border border-white/10 rounded-xl h-10 px-3 text-gray-200"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm text-gray-400 w-24">Vég</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-[#252525] border border-white/10 rounded-xl h-10 px-3 text-gray-200"
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFromDate(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
                    setToDate(format(new Date(), 'yyyy-MM-dd'));
                  }}
                  className="px-3 h-10 rounded-xl bg-[#252525] border border-white/10 text-sm hover:bg-[#2b2b2b]"
                >
                  Utolsó 7 nap
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFromDate(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
                    setToDate(format(new Date(), 'yyyy-MM-dd'));
                  }}
                  className="px-3 h-10 rounded-xl bg-[#252525] border border-white/10 text-sm hover:bg-[#2b2b2b]"
                >
                  Utolsó 30 nap
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFromDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                    setToDate(format(new Date(), 'yyyy-MM-dd'));
                  }}
                  className="px-3 h-10 rounded-xl bg-[#252525] border border-white/10 text-sm hover:bg-[#2b2b2b]"
                >
                  Ez a hónap
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="px-3 h-10 rounded-xl bg-[#252525] border border-white/10 text-sm hover:bg-[#2b2b2b]"
                >
                  Összes
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Szűrt rendelések: <span className="text-gray-300">{filteredOrders.length}</span> • Fizetett rendelések:{' '}
              <span className="text-gray-300">{paidOrders.length}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Összes bevétel"
              value={`${totalRevenue.toLocaleString('hu-HU')} Ft`}
              icon={DollarSign}
              trend="up"
              trendValue="+12.5%"
              index={0}
            />
            <StatsCard
              title="Rendelések"
              value={filteredOrders.length}
              icon={ShoppingBag}
              trend="up"
              trendValue="+8.2%"
              color="#627EEA"
              index={1}
            />
            <StatsCard
              title="Oldalmegtekintések"
              value={totalPageViews}
              icon={Eye}
              trend="up"
              trendValue={`${todayViews} ma`}
              color="#26A17B"
              index={2}
            />
            <StatsCard
              title="Konverziós ráta"
              value={`${conversionRate}%`}
              icon={MousePointerClick}
              trend="up"
              trendValue="+2.3%"
              color="#8247E5"
              index={3}
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Termékek száma</p>
                  <h3 className="text-2xl font-bold">{products.length}</h3>
                </div>
                <Package className="w-8 h-8 text-[#F7931A]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Átlag rendelés</p>
                  <h3 className="text-2xl font-bold">{Math.round(averageOrderValue).toLocaleString('hu-HU')} Ft</h3>
                </div>
                <TrendingUp className="w-8 h-8 text-[#8247E5]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Egyedi látogatók</p>
                  <h3 className="text-2xl font-bold">{uniqueSessions}</h3>
                </div>
                <Users className="w-8 h-8 text-[#F7931A]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Mai látogatók</p>
                  <h3 className="text-2xl font-bold">{todayViews}</h3>
                </div>
                <Eye className="w-8 h-8 text-[#627EEA]" />
              </div>
            </motion.div>
          </div>

          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 mb-8"
          >
            <h3 className="text-lg font-semibold mb-6">Legnépszerűbb oldalak</h3>
            <div className="space-y-4">
              {(() => {
                const pageCounts = filteredPageViews.reduce((acc, pv) => {
                  acc[pv.page] = (acc[pv.page] || 0) + 1;
                  return acc;
                }, {});
                return Object.entries(pageCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([page, count]) => {
                    const percentage = totalPageViews > 0 ? ((count / totalPageViews) * 100).toFixed(1) : 0;
                    return (
                      <div key={page} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">{page || 'Home'}</span>
                            <span className="text-sm font-semibold text-white">{count} megtekintés</span>
                          </div>
                          <div className="w-full bg-[#252525] rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#F7931A] to-[#f5a623] h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-2 bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Bevétel (fizetett) - Utolsó 7 nap</h3>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">+12.5%</span>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7Days}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${Number(value).toLocaleString('hu-HU')} Ft`, 'Bevétel']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F7931A"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <h3 className="text-lg font-semibold mb-6">Kategóriák</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-3">
                {pieData.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Orders & Status Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <h3 className="text-lg font-semibold mb-6">Legutóbbi rendelések</h3>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-400">Nincs rendelés ebben az időszakban.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-[#252525] rounded-xl">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-400">
                          {format(new Date(order.created_date), 'MMM d, HH:mm', { locale: hu })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#F7931A]">
                          {Number(order.total_amount || 0).toLocaleString('hu-HU')} Ft
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'payment_pending'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : order.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : order.status === 'processing'
                              ? 'bg-blue-500/20 text-blue-500'
                              : order.status === 'shipped'
                              ? 'bg-purple-500/20 text-purple-500'
                              : order.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {order.status === 'payment_pending' && 'Fizetésre vár'}
                          {order.status === 'paid' && 'Fizetve'}
                          {order.status === 'processing' && 'Feldolgozás'}
                          {order.status === 'shipped' && 'Szállítva'}
                          {order.status === 'delivered' && 'Kézbesítve'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5"
            >
              <h3 className="text-lg font-semibold mb-6">Rendelések státusz szerint</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" width={110} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
