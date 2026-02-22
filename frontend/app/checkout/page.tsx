'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepIndicator from '@/components/checkout/StepIndicator';
import CartReview from '@/components/checkout/CartReview';
import ShippingForm, { type ShippingFormValues } from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import Confirmation from '@/components/checkout/Confirmation';
import { useCartStore } from '@/lib/cart-store';
import type { Order } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());

  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [orderSubtotal, setOrderSubtotal] = useState(0);

  // Redirect if cart is empty and not on confirmation
  useEffect(() => {
    if (items.length === 0 && step < 4) {
      router.push('/cart');
    }
  }, [items.length, step, router]);

  const handleShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    setStep(3);
  };

  const handlePay = async () => {
    if (!shippingData) return;
    setIsProcessing(true);
    setOrderSubtotal(subtotal);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful order
      const mockOrder: Order = {
        id: `HS${Date.now().toString().slice(-6)}`,
        userId: 'guest',
        totalAmount: subtotal + (subtotal >= 50 ? 0 : 5),
        status: 'Confirmed',
        shippingAddress: {
          street: shippingData.street,
          city: shippingData.city,
          state: shippingData.state,
          zip: shippingData.zip,
          country: shippingData.country,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
        createdAt: new Date().toISOString(),
      };

      setCompletedOrder(mockOrder);
      clearCart();
      setStep(4);
    } catch {
      // In a real app, handle error here
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
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

        <StepIndicator currentStep={step} />

        {/* Empty cart guard (before redirect kicks in) */}
        {items.length === 0 && step < 4 ? (
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
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
