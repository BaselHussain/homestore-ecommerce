'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { modalVariants } from '@/lib/framerVariants';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  category: string;
  badge?: string | null;
  itemCode?: string | null;
  images: string[];
}

interface Props {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = ['living-room', 'bedroom', 'kitchen', 'bathroom', 'office', 'outdoor', 'lighting', 'storage', 'decor', 'other'];

const emptyForm: Product = { name: '', description: '', price: 0, stock: 0, category: 'living-room', images: [''] };

export default function ProductForm({ product, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Product>(product ? { ...product, images: (product.images as string[]).length ? product.images as string[] : [''] } : emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const setField = <K extends keyof Product>(key: K, value: Product[K]) => setForm(f => ({ ...f, [key]: value }));

  const setImage = (i: number, val: string) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setField('images', imgs);
  };

  const addImage = () => {
    if (form.images.length >= 5) { toast.warning('Maximum 5 images per product'); return; }
    setField('images', [...form.images, '']);
  };

  const removeImage = (i: number) => {
    if (form.images.length <= 1) return;
    setField('images', form.images.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) { toast.error('Name and description are required'); return; }
    if (form.price <= 0) { toast.error('Price must be greater than 0'); return; }
    const images = form.images.filter(u => u.trim());
    if (!images.length) { toast.error('At least one image URL is required'); return; }

    setSaving(true);
    try {
      const payload = { ...form, images, price: Number(form.price), stock: Number(form.stock), originalPrice: form.originalPrice ? Number(form.originalPrice) : null };
      if (form.id) {
        await adminApi.updateProduct(form.id, payload);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Product created');
      }
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="text-lg font-semibold text-foreground">{form.id ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Name *</label>
                <input value={form.name} onChange={e => setField('name', e.target.value)} required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description *</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} required rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price ($) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setField('price', parseFloat(e.target.value) || 0)} required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Original Price ($)</label>
                <input type="number" min="0" step="0.01" value={form.originalPrice ?? ''} onChange={e => setField('originalPrice', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Stock *</label>
                <input type="number" min="0" value={form.stock} onChange={e => setField('stock', parseInt(e.target.value) || 0)} required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category *</label>
                <select value={form.category} onChange={e => setField('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Badge</label>
                <input value={form.badge ?? ''} onChange={e => setField('badge', e.target.value || null)} placeholder="e.g. New, Sale, Hot"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Item Code</label>
                <input value={form.itemCode ?? ''} onChange={e => setField('itemCode', e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Image URLs (max 5)</label>
                <button type="button" onClick={addImage} disabled={form.images.length >= 5}
                  className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-3 h-3" /> Add image
                </button>
              </div>
              <div className="space-y-2">
                {form.images.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={url} onChange={e => setImage(i, e.target.value)} placeholder={`Image URL ${i + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <button type="button" onClick={() => removeImage(i)} disabled={form.images.length <= 1}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : form.id ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
