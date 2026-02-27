'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function ConfirmationContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-16 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 text-left mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm">What happens next?</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">1.</span>
                Your order is being prepared for shipment.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">2.</span>
                You will receive tracking information via email once shipped.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">3.</span>
                Estimated delivery: 3–7 business days.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-8 py-3 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
