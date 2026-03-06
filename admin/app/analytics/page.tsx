'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { staggerContainer, staggerItem } from '@/lib/framerVariants';
import SalesLineChart from '@/components/Charts/SalesLineChart';
import TopProductsChart from '@/components/Charts/TopProductsChart';
import OrderStatusChart from '@/components/Charts/OrderStatusChart';
import UserGrowthChart from '@/components/Charts/UserGrowthChart';
import { Loader2, TrendingUp, ShoppingCart, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  newUsers: number;
  revenueData: Array<{ date: string; revenue: number }>;
  categoryData: Array<{ name: string; count: number }>;
  orderStatusData: Array<{ name: string; value: number }>;
  userGrowthData: Array<{ date: string; newUsers: number }>;
  period: string;
}

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getAnalytics(period)
      .then(data => setAnalytics(data.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Business metrics and insights</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${period === p.value ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted text-foreground'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{fmt(analytics?.totalRevenue ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {period}</p>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-muted-foreground">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics?.totalOrders ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {period}</p>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-muted-foreground">New Users</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics?.newUsers ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {period}</p>
            </motion.div>
          </motion.div>

          {/* Charts grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Revenue line chart */}
            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Over Time</h3>
              {(analytics?.revenueData ?? []).length > 0 ? (
                <SalesLineChart data={analytics!.revenueData} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No orders in this period</div>
              )}
            </motion.div>

            {/* Category bar chart */}
            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">Products by Category</h3>
              {(analytics?.categoryData ?? []).length > 0 ? (
                <TopProductsChart data={analytics!.categoryData} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No products found</div>
              )}
            </motion.div>

            {/* Order status pie — real data from DB */}
            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1">Order Status Distribution</h3>
              <p className="text-xs text-muted-foreground mb-3">All-time order breakdown</p>
              {(analytics?.orderStatusData ?? []).filter(d => d.value > 0).length > 0 ? (
                <OrderStatusChart data={analytics!.orderStatusData.filter(d => d.value > 0)} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No orders yet</div>
              )}
            </motion.div>

            {/* User growth area chart — real data from DB */}
            <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1">User Growth</h3>
              <p className="text-xs text-muted-foreground mb-3">New registrations per day</p>
              {(analytics?.userGrowthData ?? []).length > 0 ? (
                <UserGrowthChart data={analytics!.userGrowthData} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No new users in this period</div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
}
