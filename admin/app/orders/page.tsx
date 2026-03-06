'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { staggerContainer, staggerItem, modalVariants } from '@/lib/framerVariants';
import { Search, Loader2, ShoppingCart, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
}

interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  fullName?: string;
}

interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  created_at: string;
  user: { email: string; name: string } | null;
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const fmt = (n: number) => `$${Number(n).toFixed(2)}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminApi.getOrders(params);
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(o => o ? { ...o, status } : null);
      }
      load();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const getCustomer = (o: Order) => o.user?.email ?? o.guest_email ?? 'Guest';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{total} orders total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email or order ID…"
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <ShoppingCart className="w-8 h-8 opacity-40" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <motion.tbody initial="hidden" animate="visible" variants={staggerContainer}>
                {orders.map((o, i) => (
                  <motion.tr key={o.id} custom={i} variants={staggerItem}
                    className="border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(o)}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-foreground">{getCustomer(o)}</td>
                    <td className="px-4 py-3 font-medium">{fmt(o.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {VALID_TRANSITIONS[o.status]?.length > 0 && (
                        <select
                          defaultValue=""
                          onChange={e => { if (e.target.value) updateStatus(o.id, e.target.value); }}
                          disabled={updating}
                          className="text-xs border border-border rounded-md px-2 py-1 bg-background focus:outline-none"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="" disabled>Update status</option>
                          {VALID_TRANSITIONS[o.status].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order details modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-lg font-semibold text-foreground">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground mb-0.5">Order ID</p><p className="font-mono text-xs">{selectedOrder.id}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Customer</p><p className="text-foreground">{getCustomer(selectedOrder)}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Date</p><p className="text-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Total</p><p className="font-bold text-foreground">{fmt(selectedOrder.total_amount)}</p></div>
                  {selectedOrder.tracking_number && (
                    <div><p className="text-xs text-muted-foreground mb-0.5">Tracking</p><p className="font-mono text-xs">{selectedOrder.tracking_number}</p></div>
                  )}
                </div>

                {/* Shipping */}
                {selectedOrder.shipping_address && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Shipping Address</p>
                    <div className="text-sm text-foreground bg-muted/30 rounded-lg p-3 space-y-0.5">
                      {selectedOrder.shipping_address.fullName && <p className="font-medium">{selectedOrder.shipping_address.fullName}</p>}
                      {selectedOrder.shipping_address.street && <p>{selectedOrder.shipping_address.street}</p>}
                      <p>{[selectedOrder.shipping_address.city, selectedOrder.shipping_address.state, selectedOrder.shipping_address.zipCode].filter(Boolean).join(', ')}</p>
                      {selectedOrder.shipping_address.country && <p>{selectedOrder.shipping_address.country}</p>}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</p>
                  <div className="space-y-2">
                    {(selectedOrder.items as OrderItem[]).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/60 last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <p className="font-medium">{fmt(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status update */}
                {VALID_TRANSITIONS[selectedOrder.status]?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {VALID_TRANSITIONS[selectedOrder.status].map(s => (
                        <button key={s} disabled={updating} onClick={() => updateStatus(selectedOrder.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-60 ${s === 'cancelled' ? 'border-destructive text-destructive hover:bg-destructive/10' : 'border-primary text-primary hover:bg-primary/10'}`}>
                          {s === 'cancelled' ? 'Cancel Order' : `Mark as ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                        </button>
                      ))}
                      {selectedOrder.status === 'delivered' && (
                        <button disabled={updating} onClick={() => updateStatus(selectedOrder.id, 'refunded')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-400 text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 transition-colors disabled:opacity-60">
                          <RotateCcw className="w-3 h-3" /> Simulate Refund
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
