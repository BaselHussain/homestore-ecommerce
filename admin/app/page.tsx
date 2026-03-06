'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { staggerContainer, staggerItem, slideUp } from '@/lib/framerVariants';
import {
  Users, Package, ShoppingCart, DollarSign, Loader2,
  AlertTriangle, TrendingUp, Clock, CheckCircle2, XCircle, Truck,
} from 'lucide-react';

interface OrderStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  ordersByStatus: OrderStatus;
  totalSales: { today: number; week: number; month: number };
  lowStockProducts: Array<{ id: string; name: string; stock: number; category: string }>;
  recentOrders: Array<{
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    user: { email: string; name: string } | null;
    guest_email: string | null;
  }>;
}

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const topCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
    { label: 'Revenue (Month)', value: fmt(stats?.totalSales.month ?? 0), icon: DollarSign, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
  ];

  const salesCards = [
    { label: 'Today', value: fmt(stats?.totalSales.today ?? 0), icon: TrendingUp },
    { label: 'This Week', value: fmt(stats?.totalSales.week ?? 0), icon: TrendingUp },
    { label: 'This Month', value: fmt(stats?.totalSales.month ?? 0), icon: TrendingUp },
  ];

  const s = stats?.ordersByStatus;
  const orderStatusCards = [
    { label: 'Pending', value: s?.pending ?? 0, icon: Clock, cls: 'text-yellow-600' },
    { label: 'Processing', value: s?.processing ?? 0, icon: Package, cls: 'text-blue-600' },
    { label: 'Shipped', value: s?.shipped ?? 0, icon: Truck, cls: 'text-indigo-600' },
    { label: 'Delivered', value: s?.delivered ?? 0, icon: CheckCircle2, cls: 'text-green-600' },
    { label: 'Cancelled', value: s?.cancelled ?? 0, icon: XCircle, cls: 'text-red-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={slideUp}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome to Homestore Admin Panel</p>
      </motion.div>

      {/* Top summary cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {topCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Sales breakdown */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Sales Overview</h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {salesCards.map(({ label, value }) => (
            <motion.div key={label} variants={staggerItem} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Order status breakdown */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Orders by Status</h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        >
          {orderStatusCards.map(({ label, value, icon: Icon, cls }) => (
            <motion.div key={label} variants={staggerItem} className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${cls}`} />
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders ?? []).map((order, i) => (
                  <motion.tr
                    key={order.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: i * 0.04 } } }}
                    className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-foreground">
                      {order.user?.email ?? order.guest_email ?? 'Guest'}
                    </td>
                    <td className="px-4 py-3 font-medium">{fmt(Number(order.total_amount))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
                {(stats?.recentOrders ?? []).length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-border/60">
            {(stats?.lowStockProducts ?? []).map(p => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
            {(stats?.lowStockProducts ?? []).length === 0 && (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">All products well stocked</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
