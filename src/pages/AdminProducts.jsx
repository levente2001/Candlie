import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const categories = [
  { id: 'limited', name: 'Limitált' },
];

const badges = [
  { id: '', name: 'Nincs' },
  { id: 'new', name: 'Új' },
  { id: 'sale', name: 'Akció' },
  { id: 'limited', name: 'Limitált' },
];

export default function AdminProducts() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    hover_image_url: '',
    category: 'bitcoin',
    badge: '',
    stock: '',
    is_active: true,
  });

  const openModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        image_url: product.image_url || '',
        hover_image_url: product.hover_image_url || '',
        category: product.category || 'bitcoin',
        badge: product.badge || '',
        stock: product.stock?.toString() || '',
        is_active: product.is_active !== false,
      });
      setEditingProduct(product);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        image_url: '',
        hover_image_url: '',
        category: 'bitcoin',
        badge: '',
        stock: '',
        is_active: true,
      });
      setEditingProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: formData.stock ? parseInt(formData.stock) : null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, [field]: file_url });
    setIsUploading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--candlie-bg)] text-black">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Termékek</h1>
              <p className="text-black/60">{products.length} termék</p>
            </div>
            <Button
              onClick={() => openModal()}
              className="bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Új termék
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <Input
              placeholder="Keresés név szerint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--candlie-pink-primary)]" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600">
              <p className="font-semibold">Nem sikerült betölteni a termékeket.</p>
              <p className="text-sm">{error?.message || 'Ismeretlen hiba'}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-black/60">
              <p className="font-semibold">Nincs megjeleníthető termék.</p>
              <p className="text-sm">Ellenőrizd a keresést vagy a Firebase kapcsolatot.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl overflow-hidden border border-black/10"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {!product.is_active && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-medium">Inaktív</span>
                        </div>
                      )}
                      {product.badge && (
                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                          product.badge === 'new' ? 'bg-emerald-500' :
                          product.badge === 'sale' ? 'bg-red-500' : 'bg-purple-500'
                        } text-white`}>
                          {product.badge === 'new' && 'Új'}
                          {product.badge === 'sale' && 'Akció'}
                          {product.badge === 'limited' && 'Limitált'}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-semibold text-[var(--candlie-pink-secondary)]">
                          {product.price?.toLocaleString('hu-HU')} Ft
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-black/40 line-through">
                            {product.original_price?.toLocaleString('hu-HU')} Ft
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(product)}
                          className="flex-1 border-black/10 hover:bg-black/5"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Szerkesztés
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
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

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Termék szerkesztése' : 'Új termék'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Termék neve *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                  placeholder="Bitcoin HODL Póló"
                />
              </div>
              <div>
                <Label>Kategória</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Leírás</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={3}
                placeholder="Termék leírása..."
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Ár (Ft) *</Label>
                <Input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-2"
                  placeholder="8500"
                />
              </div>
              <div>
                <Label>Eredeti ár (Ft)</Label>
                <Input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  className="mt-2"
                  placeholder="10990"
                />
              </div>
              <div>
                <Label>Készlet</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="mt-2"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Badge</Label>
                <Select
                  value={formData.badge}
                  onValueChange={(v) => setFormData({ ...formData, badge: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badges.map((badge) => (
                      <SelectItem key={badge.id} value={badge.id}>{badge.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-xl mt-auto">
                <Label>Aktív termék</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Fő kép</Label>
                <div className="mt-2 space-y-2">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1"
                      placeholder="URL vagy feltöltés"
                    />
                    <label className="flex items-center justify-center w-12 h-10 bg-black/5 rounded-lg cursor-pointer hover:bg-black/10 transition-colors border border-black/10">
                      <ImagePlus className="w-5 h-5 text-black/50" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image_url')} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Hover kép (opcionális)</Label>
                <div className="mt-2 space-y-2">
                  {formData.hover_image_url && (
                    <img src={formData.hover_image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={formData.hover_image_url}
                      onChange={(e) => setFormData({ ...formData, hover_image_url: e.target.value })}
                      className="flex-1"
                      placeholder="URL vagy feltöltés"
                    />
                    <label className="flex items-center justify-center w-12 h-10 bg-black/5 rounded-lg cursor-pointer hover:bg-black/10 transition-colors border border-black/10">
                      <ImagePlus className="w-5 h-5 text-black/50" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'hover_image_url')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border-black/10"
              >
                Mégse
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                className="flex-1 bg-[var(--candlie-pink-secondary)] hover:bg-[var(--candlie-pink-primary)] text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingProduct ? 'Mentés' : 'Létrehozás'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
