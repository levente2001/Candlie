import React, { useMemo, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCcw, Home as HomeIcon, ShoppingBag, Info } from 'lucide-react';

const PAGES = [
  { label: 'Főoldal', path: '/', icon: HomeIcon },
  { label: 'Termékek', path: '/products', icon: ShoppingBag },
  { label: 'Rólunk', path: '/about', icon: Info },
];

export default function AdminContentEditor() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPath, setSelectedPath] = useState(PAGES[0].path);
  const [reloadNonce, setReloadNonce] = useState(0);

  const iframeSrc = useMemo(() => {
    const url = new URL(window.location.origin + selectedPath);
    url.searchParams.set('adminPreview', '1');
    url.searchParams.set('v', String(reloadNonce)); // cache-bust
    return url.pathname + url.search;
  }, [selectedPath, reloadNonce]);

  const fullUrl = window.location.origin + iframeSrc;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] flex">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] border border-white/5 rounded-2xl p-4 mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
              <div>
                <h1 className="text-xl font-bold">Szerkesztés (inline)</h1>
                <p className="text-gray-400 text-sm">
                  Kattints a kiemelt szövegre → írd át → <b>Enter</b> vagy kattints máshova (mentés). <b>Esc</b> = visszavonás.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {PAGES.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => setSelectedPath(p.path)}
                    className={[
                      'px-3 py-2 rounded-xl text-sm border transition-all inline-flex items-center gap-2',
                      selectedPath === p.path
                        ? 'bg-[#F7931A] text-black border-[#F7931A]'
                        : 'bg-[#1a1a1a] text-white border-white/10 hover:border-[#F7931A]/40',
                    ].join(' ')}
                  >
                    <p.icon className="w-4 h-4" />
                    {p.label}
                  </button>
                ))}

                <button
                  onClick={() => setReloadNonce((n) => n + 1)}
                  className="px-3 py-2 rounded-xl text-sm border bg-[#1a1a1a] text-white border-white/10 hover:border-[#F7931A]/40 inline-flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Frissítés
                </button>

              </div>
            </div>
          </motion.div>

          <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden">
            <iframe
              key={iframeSrc}
              title="Content editor preview"
              src={iframeSrc}
              className="w-full"
              style={{ height: 'calc(100vh - 170px)', border: '0' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
