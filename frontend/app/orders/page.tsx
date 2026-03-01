'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Package, ShoppingBag, Truck, CheckCircle, Circle, Clock, XCircle, Loader2 } from "lucide-react";
import LightSheenButton from "@/components/ui/light-sheen-button";
import AnimatedElement from "@/components/ui/animated-element";
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type OrderStatus = "delivered" | "shipped" | "processing" | "pending" | "cancelled";

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  itemName: string;
  itemCount: number;
  tracking?: string;
}

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: Truck,
  },
  processing: {
    label: "Processing",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: Circle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

const trackingSteps = ["Placed", "Processing", "Shipped", "Delivered"];

const getStepIndex = (status: OrderStatus) => {
  switch (status) {
    case "pending": return 0;
    case "processing": return 1;
    case "shipped": return 2;
    case "delivered": return 3;
    default: return -1;
  }
};

function mapBackendStatus(raw: string): OrderStatus {
  switch (raw.toLowerCase()) {
    case "delivered": return "delivered";
    case "shipped": return "shipped";
    case "processing":
    case "confirmed": return "processing";
    case "cancelled":
    case "refunded": return "cancelled";
    default: return "pending";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendOrder(raw: any): Order {
  const items: Array<{ name?: string; quantity?: number }> = Array.isArray(raw.items) ? raw.items : [];
  const itemCount = items.reduce((sum, it) => sum + (it.quantity ?? 1), 0) || items.length || 1;
  const itemName = items[0]?.name ?? "Order";

  const date = raw.created_at
    ? new Date(raw.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return {
    id: `ORD-${raw.id.slice(-8).toUpperCase()}`,
    date,
    status: mapBackendStatus(raw.status ?? ""),
    total: parseFloat(raw.total_amount ?? 0),
    itemName,
    itemCount,
    tracking: raw.tracking_number ?? undefined,
  };
}

function OrderProgressBar({ status }: { status: OrderStatus }) {
  const currentStep = getStepIndex(status);
  if (currentStep === -1) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-border" />
        <div
          className="absolute top-3 left-3 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStep / (trackingSteps.length - 1)) * (100 - 3)}%` }}
        />
        {trackingSteps.map((step, i) => {
          const filled = i <= currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  filled ? "border-primary bg-primary" : "border-border bg-background"
                }`}
              >
                {filled && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
              <span className={`text-[10px] font-medium ${filled ? "text-primary" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/orders');
      return;
    }
    userApi.getOrders()
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = (data.orders as any[]).map(mapBackendOrder);
        setOrders(mapped);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
            <AnimatedElement animationType="fadeIn">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Account</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-4">
                My Orders
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Track your purchases, view order history, and manage returns all in one place.
              </p>
            </AnimatedElement>
          </div>
        </section>

        {/* Orders List */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {loading || authLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              /* Empty State */
              <AnimatedElement animationType="fadeIn">
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-9 h-9 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">No orders yet</h2>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    When you place your first order, it will appear here. Start exploring our collection.
                  </p>
                  <Link
                    href="/products"
                    className="relative overflow-hidden inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
                  >
                    Shop Now
                  </Link>
                </div>
              </AnimatedElement>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => {
                  const { label, bg, text, icon: StatusIcon } = statusConfig[order.status];
                  const showProgress = order.status !== "cancelled" && order.status !== "pending";

                  return (
                    <AnimatedElement key={order.id} animationType="slideInUp" delay={i * 0.08}>
                      <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          {/* Left: Order details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <span className="font-display font-bold text-foreground text-sm">{order.id}</span>
                                <span className="text-muted-foreground text-xs ml-2">· {order.date}</span>
                              </div>
                            </div>
                            <p className="text-base font-medium text-foreground ml-11 truncate">{order.itemName}</p>
                            <p className="text-xs text-muted-foreground ml-11 mt-0.5">
                              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                            </p>
                          </div>

                          {/* Center: Status badge */}
                          <div className="sm:mx-4 shrink-0">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {label}
                            </span>
                          </div>

                          {/* Right: Total + CTA */}
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                            <span className="font-display text-lg font-bold text-foreground">
                              €{order.total.toFixed(2)}
                            </span>
                            <LightSheenButton
                              variant="outline"
                              size="sm"
                              className="rounded-full border border-border text-xs font-semibold px-4 py-2 cursor-pointer"
                            >
                              View Details
                            </LightSheenButton>
                          </div>
                        </div>

                        {/* Tracking number */}
                        {order.tracking && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                            <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Tracking: <span className="font-mono font-medium text-foreground">{order.tracking}</span></span>
                          </div>
                        )}

                        {/* Progress tracker */}
                        {showProgress && <OrderProgressBar status={order.status} />}
                      </div>
                    </AnimatedElement>
                  );
                })}
              </div>
            )}

            {/* Footer link */}
            {!loading && !authLoading && (
              <AnimatedElement animationType="fadeIn" delay={0.2}>
                <div className="mt-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need help with an order?{" "}
                    <Link href="/returns-exchanges" className="text-primary hover:underline font-medium">
                      Returns & Exchanges
                    </Link>
                    {" "}or{" "}
                    <Link href="/contact" className="text-primary hover:underline font-medium">
                      Contact Support
                    </Link>
                  </p>
                </div>
              </AnimatedElement>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
