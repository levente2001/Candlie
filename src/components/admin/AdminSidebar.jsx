import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { LayoutDashboard, Package, ShoppingBag, Settings, Bitcoin, LogOut, ChevronLeft, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
    { icon: Package, label: 'Termékek', page: 'AdminProducts' },
    { icon: ShoppingBag, label: 'Rendelések', page: 'AdminOrders' },
    { icon: Truck, label: 'Kiszállítás', page: 'AdminShipping' },
  ];

  const isActive = (page) => location.pathname.includes(page.toLowerCase().replace('admin', ''));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 bottom-0 bg-[#0a0a0a] border-r border-white/5 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <Link to={createPageUrl('Home')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7931A] to-[#f5a623] flex items-center justify-center flex-shrink-0">
            <Bitcoin className="w-6 h-6 text-black" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg"
            >
              Admin
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center hover:bg-[#252525] transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.page)
                ? 'bg-[#F7931A] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <Link
          to={createPageUrl('Home')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Kilépés</span>}
        </Link>
      </div>
    </motion.aside>
  );
}