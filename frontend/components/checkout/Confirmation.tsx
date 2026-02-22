'use client';

import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';
import type { Order } from '@/lib/types';
import LightSheenButton from '@/components/ui/light-sheen-button';

interface ConfirmationProps {
  order?: Order | null;
  subtotal: number;
}

const Confirmation = ({ order, subtotal }: ConfirmationProps) => {
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
      </div>

      <h2 className="font-display text-3xl font-bold text-foreground mb-2">Order Placed!</h2>
      <p className="text-muted-foreground mb-2">
        Thank you for your purchase. Your order has been confirmed.
      </p>

      {order?.id && (
        <p className="text-sm text-muted-foreground mb-8">
          Order ID: <span className="font-semibold text-foreground">#{order.id}</span>
        </p>
      )}

      <div className="bg-card border border-border rounded-xl p-6 text-left mb-8 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Order Summary</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-bold text-foreground">Total Paid</span>
            <span className="font-bold text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <LightSheenButton variant="outline" className="px-8 py-3 rounded-full font-semibold text-sm border border-border">
            Back to Home
          </LightSheenButton>
        </Link>
        <Link href="/products">
          <LightSheenButton variant="primary" className="px-8 py-3 rounded-full font-semibold text-sm">
            Continue Shopping
          </LightSheenButton>
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
