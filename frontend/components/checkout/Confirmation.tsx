'use client';

import Link from 'next/link';
import { CheckCircle, Package, CreditCard, Banknote } from 'lucide-react';
import type { Order } from '@/lib/types';
import type { PaymentMethod } from '@/components/checkout/PaymentForm';
import LightSheenButton from '@/components/ui/light-sheen-button';

interface ConfirmationProps {
  order?: Order | null;
  subtotal: number;
  paymentMethod?: PaymentMethod;
}

const Confirmation = ({ order, subtotal, paymentMethod = 'card' }: ConfirmationProps) => {
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;
  const isCod = paymentMethod === 'cod';

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
            <span className="font-medium">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
            <span className="font-bold text-foreground">{isCod ? 'Total Due on Delivery' : 'Total Paid'}</span>
            <span className="font-bold text-primary">€{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-muted-foreground">Payment</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {isCod ? (
                <>
                  <Banknote className="w-3.5 h-3.5 text-primary" />
                  Cash on Delivery
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  Card Payment
                </>
              )}
            </span>
          </div>
        </div>

        {isCod && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please have <span className="font-semibold text-foreground">€{total.toFixed(2)}</span> ready when your order arrives. Our delivery team will collect payment at your door.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <LightSheenButton variant="outline" className="px-8 py-3 rounded-full font-semibold text-sm border border-border cursor-pointer">
            Back to Home
          </LightSheenButton>
        </Link>
        <Link href="/products">
          <LightSheenButton variant="primary" className="px-8 py-3 rounded-full font-semibold text-sm cursor-pointer">
            Continue Shopping
          </LightSheenButton>
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
