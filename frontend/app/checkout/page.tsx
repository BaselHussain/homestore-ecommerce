'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import StepIndicator from '@/components/checkout/StepIndicator';
import CartReview from '@/components/checkout/CartReview';
import ShippingForm, { type ShippingFormValues } from '@/components/checkout/ShippingForm';
import PaymentForm, { type PaymentMethod } from '@/components/checkout/PaymentForm';
import Confirmation from '@/components/checkout/Confirmation';
import { useCart } from '@/contexts/CartContext';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, clearCart, totalPrice: subtotal, isLoading: cartLoading } = useCart();

  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [orderSubtotal, setOrderSubtotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  // Redirect if cart is empty and not on confirmation step (wait for cart to load)
  useEffect(() => {
    if (!cartLoading && items.length === 0 && step < 4) {
      router.push('/cart');
    }
  }, [cartLoading, items.length, step, router]);

  const handleShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    setStep(3);
  };

  const handleCouponApplied = (code: string, discountAmount: number) => {
    setAppliedCoupon({ code, discountAmount });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  const handlePay = async (method: PaymentMethod) => {
    if (!shippingData) return;
    setIsProcessing(true);
    setOrderSubtotal(subtotal);
    setPaymentMethod(method);

    try {
      // Simulate processing delay (shorter for COD)
      await new Promise((resolve) => setTimeout(resolve, method === 'cod' ? 600 : 1500));

      const shippingAddress = {
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,
        zip: shippingData.zip,
        country: shippingData.country,
      };

      let order: Order;

      const couponPayload = appliedCoupon
        ? { couponCode: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount }
        : {};

      if (user) {
        // Authenticated: backend reads from DB cart
        order = await ordersApi.create({ shippingAddress, ...couponPayload });
      } else {
        // Guest: send items + email in body
        const guestItems = items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        }));
        order = await ordersApi.create({
          shippingAddress,
          guestEmail: shippingData.email,
          items: guestItems,
          total: subtotal,
          ...couponPayload,
        });
      }

      setCompletedOrder(order);
      clearCart();
      setStep(4);
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-8 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
          Checkout
        </h1>

        {!user && step < 4 && (
          <p className="text-center text-sm text-muted-foreground mb-6">
            Checking out as guest.{' '}
            <Link href={`/login?redirect=/checkout`} className="text-primary hover:underline">
              Sign in
            </Link>{' '}
            to save your order history.
          </p>
        )}

        <StepIndicator currentStep={step} />

        {/* Empty cart guard (before redirect kicks in) */}
        {(cartLoading || items.length === 0) && step < 4 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting to cart...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <CartReview
                items={items}
                subtotal={subtotal}
                onNext={() => setStep(2)}
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                appliedCoupon={appliedCoupon}
              />
            )}
            {step === 2 && (
              <ShippingForm
                defaultValues={shippingData ?? undefined}
                onNext={handleShippingSubmit}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <PaymentForm
                subtotal={subtotal}
                onPay={handlePay}
                onBack={() => setStep(2)}
                isLoading={isProcessing}
              />
            )}
            {step === 4 && (
              <Confirmation
                order={completedOrder}
                subtotal={orderSubtotal}
                paymentMethod={paymentMethod}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
