import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { LayoutDashboard, Package, ShoppingBag, Settings, Bitcoin, LogOut, ChevronLeft, Truck, Pencil, Flame, Tag, MessageSquare, Mail } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/api/firebase';
import { motion } from 'framer-motion';

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
    { icon: Package, label: 'Termékek', page: 'AdminProducts' },
    { icon: ShoppingBag, label: 'Rendelések', page: 'AdminOrders' },
    { icon: Truck, label: 'Kiszállítás', page: 'AdminShipping' },
    { icon: Pencil, label: 'Szerkesztés', page: 'AdminContentEditor' },
    { icon: MessageSquare, label: 'Visszajelzések', page: 'AdminFeedbacks' },
    { icon: Settings, label: 'ÁSZF & Adatkezelés', page: 'AdminLegal' },
    { icon: Tag, label: 'Kuponok', page: 'AdminCoupons' },
    { icon: Mail, label: 'Email automatizálás', page: 'AdminEmails' },
  ];

  const isActive = (page) => location.pathname.includes(page.toLowerCase().replace('admin', ''));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 bottom-0 bg-white border-r border-black/10 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-black/10">
        <Link to={createPageUrl('Home')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--candlie-pink-secondary)] flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-lg text-black"
            >
              Admin
            </motion.span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg bg-white border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors"
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
                ? 'bg-[var(--candlie-pink-secondary)] text-white'
                : 'text-black/60 hover:text-black hover:bg-black/5'
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
      <div className="p-4 border-t border-black/10">
        <button
          type="button"
          onClick={async () => {
            await signOut(auth);
            window.location.assign(createPageUrl('Home'));
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-black/60 hover:text-black hover:bg-black/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Kijelentkezés</span>}
        </button>
      </div>
    </motion.aside>
  );
}
