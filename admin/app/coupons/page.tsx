'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/framerVariants';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_value: string | null;
  max_usage_count: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  status: 'Active' | 'Inactive' | 'Expired';
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-muted text-muted-foreground',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderValue: '',
    maxUsageCount: '',
    expiresAt: '',
  });

  const fetchCoupons = async () => {
    try {
      const res = await adminApi.getCoupons();
      setCoupons(res.data ?? []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxUsageCount: '', expiresAt: '' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      toast.error('Code and discount value are required.');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createCoupon({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined,
        maxUsageCount: form.maxUsageCount ? parseInt(form.maxUsageCount) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      toast.success('Coupon created successfully.');
      resetForm();
      setShowForm(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await adminApi.toggleCoupon(id);
      toast.success('Coupon status updated.');
      fetchCoupons();
    } catch {
      toast.error('Failed to update coupon status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await adminApi.deleteCoupon(id);
      toast.success('Coupon deleted.');
      setConfirmDeleteId(null);
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Discount codes and promotional offers</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Create coupon form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            New Coupon
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER10"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            {/* Discount type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (€)</option>
              </select>
            </div>

            {/* Discount value */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Discount Value * {form.discountType === 'percentage' ? '(0–100)' : '(€)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm(f => ({ ...f, discountValue: e.target.value }))}
                placeholder={form.discountType === 'percentage' ? '10' : '15'}
                min="0.01"
                max={form.discountType === 'percentage' ? '100' : undefined}
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            {/* Min order value */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Minimum Order (€) — optional</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                placeholder="50"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Max usage count */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Uses — optional</label>
              <input
                type="number"
                value={form.maxUsageCount}
                onChange={(e) => setForm(f => ({ ...f, maxUsageCount: e.target.value }))}
                placeholder="100"
                min="1"
                step="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Expiry date */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Expiry Date — optional</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Coupon
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Coupons list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground mb-1">No coupons yet</p>
          <p className="text-sm text-muted-foreground">Click "Create Coupon" to add your first discount code.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Min Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <motion.tr key={coupon.id} variants={staggerItem} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-foreground">{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {coupon.discount_type === 'percentage'
                        ? `${parseFloat(coupon.discount_value).toFixed(0)}%`
                        : `€${parseFloat(coupon.discount_value).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.min_order_value ? `€${parseFloat(coupon.min_order_value).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.usage_count}{coupon.max_usage_count ? ` / ${coupon.max_usage_count}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[coupon.status]}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle active */}
                        {coupon.status !== 'Expired' && (
                          <button
                            onClick={() => handleToggle(coupon.id)}
                            disabled={togglingId === coupon.id}
                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                          >
                            {togglingId === coupon.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : coupon.is_active
                                ? <ToggleRight className="w-4 h-4 text-green-500" />
                                : <ToggleLeft className="w-4 h-4" />
                            }
                          </button>
                        )}

                        {/* Delete with confirmation */}
                        {confirmDeleteId === coupon.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Sure?</span>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              disabled={deletingId === coupon.id}
                              className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                            >
                              {deletingId === coupon.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded border border-border hover:bg-accent"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(coupon.id)}
                            title="Delete coupon"
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
