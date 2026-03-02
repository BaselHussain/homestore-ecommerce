'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, Truck, CheckCircle, Circle, Clock, XCircle, MapPin, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LightSheenButton from '@/components/ui/light-sheen-button';
import AnimatedElement from '@/components/ui/animated-element';
import { ordersApi } from '@/lib/api';

const trackSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  email: z.string().email('Please enter a valid email address'),
});

type TrackFormData = z.infer<typeof trackSchema>;

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    bg: 'bg-muted',           text: 'text-muted-foreground',                  icon: Circle },
  processing: { label: 'Processing', bg: 'bg-amber-500/10',    text: 'text-amber-600 dark:text-amber-400',     icon: Clock },
  confirmed:  { label: 'Confirmed',  bg: 'bg-blue-500/10',     text: 'text-blue-600 dark:text-blue-400',       icon: Clock },
  shipped:    { label: 'Shipped',    bg: 'bg-blue-500/10',     text: 'text-blue-600 dark:text-blue-400',       icon: Truck },
  delivered:  { label: 'Delivered',  bg: 'bg-emerald-500/10',  text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-500/10',      text: 'text-red-600 dark:text-red-400',         icon: XCircle },
};

const TRACKING_STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];

const getStepIndex = (status: string) => {
  switch (status) {
    case 'pending': return 0;
    case 'processing': case 'confirmed': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    default: return -1;
  }
};

export default function TrackOrderPage() {
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderId: '', email: '' },
  });

  const onSubmit = async (data: TrackFormData) => {
    setOrder(null);
    setNotFound(false);
    try {
      const result = await ordersApi.track(data.orderId.trim(), data.email.trim());
      setOrder((result as any).order);
    } catch {
      setNotFound(true);
    }
  };

  const rawStatus = order ? (order.status || '').toLowerCase() : '';
  const cfg = rawStatus ? (STATUS_CONFIG[rawStatus] ?? STATUS_CONFIG['pending']) : null;
  const StatusIcon = cfg?.icon;
  const stepIndex = rawStatus ? getStepIndex(rawStatus) : -1;
  const items: Array<{ name: string; price: number; quantity: number }> = order && Array.isArray(order.items) ? order.items : [];
  const addr = order?.shippingAddress as { street?: string; city?: string; state?: string; zipCode?: string; country?: string } | null;

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
            <AnimatedElement animationType="fadeIn">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Order Tracking</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-4">
                Track Your Order
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Enter your order ID and email address to get real-time updates on your delivery.
              </p>
            </AnimatedElement>
          </div>
        </section>

        {/* Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-lg">
            <AnimatedElement animationType="slideInUp">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="orderId" className="block text-sm font-medium text-foreground">
                      Order ID
                    </label>
                    <input
                      id="orderId"
                      {...form.register('orderId')}
                      type="text"
                      placeholder="e.g. G9OZDOFC"
                      className={`w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${
                        form.formState.errors.orderId ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {form.formState.errors.orderId && (
                      <p className="text-xs text-destructive">{form.formState.errors.orderId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      id="email"
                      {...form.register('email')}
                      type="email"
                      placeholder="The email used when placing the order"
                      className={`w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        form.formState.errors.email ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <LightSheenButton
                    type="submit"
                    variant="primary"
                    disabled={form.formState.isSubmitting}
                    className="w-full rounded-full px-8 py-3.5 text-sm font-semibold cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {form.formState.isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Searching...</>
                      ) : (
                        <><Search className="w-4 h-4" />Track Order</>
                      )}
                    </span>
                  </LightSheenButton>
                </form>
              </div>
            </AnimatedElement>

            {/* Not found */}
            {notFound && (
              <AnimatedElement animationType="fadeIn">
                <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                  <XCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Order not found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please check your order ID and email address and try again.
                  </p>
                </div>
              </AnimatedElement>
            )}

            {/* Order result */}
            {order && cfg && StatusIcon && (
              <AnimatedElement animationType="slideInUp">
                <div className="mt-6 space-y-4">
                  {/* Status card */}
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {rawStatus !== 'cancelled' && stepIndex >= 0 && (
                      <div className="mt-2 border-t border-border pt-4">
                        <div className="relative flex justify-between">
                          {/* Background line — centered on the 24px circles */}
                          <div className="absolute top-[12px] left-3 right-3 h-0.5 bg-border" />
                          {/* Progress line */}
                          <div
                            className="absolute top-[12px] left-3 h-0.5 bg-primary transition-all duration-500"
                            style={{ width: `calc(${(stepIndex / (TRACKING_STEPS.length - 1)) * 100}% - 24px)` }}
                          />
                          {TRACKING_STEPS.map((step, i) => {
                            const filled = i <= stepIndex;
                            return (
                              <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${filled ? 'border-primary bg-primary' : 'border-border bg-background'}`}>
                                  {filled && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                                </div>
                                <span className={`text-[10px] font-medium ${filled ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order items */}
                  {items.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Items Ordered</h3>
                      <div className="space-y-3">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                            <div>
                              <span className="font-medium text-foreground">{item.name}</span>
                              <span className="text-muted-foreground text-xs ml-2">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold text-foreground pt-1">
                          <span>Total</span>
                          <span>${Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping address */}
                  {addr && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">Shipping Address</h3>
                          <p className="text-sm text-foreground">{addr.street}</p>
                          <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-sm text-muted-foreground">{addr.country}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking number */}
                  {order.trackingNumber && (
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Carrier tracking:</span>
                        <span className="font-mono font-medium text-foreground">{order.trackingNumber}</span>
                      </div>
                    </div>
                  )}
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
