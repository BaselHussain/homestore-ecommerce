'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartStoreItem } from '@/lib/cart-store';
import LightSheenButton from '@/components/ui/light-sheen-button';

interface CartReviewProps {
  items: CartStoreItem[];
  subtotal: number;
  onNext: () => void;
}

const CartReview = ({ items, subtotal, onNext }: CartReviewProps) => {
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Review Your Order</h2>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3 bg-card border border-border rounded-xl p-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm line-clamp-1">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Qty: {quantity}</span>
                <span className="text-sm font-bold text-foreground">
                  €{(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 mt-2">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-foreground text-base">€{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/cart"
          className="flex-1 text-center py-3.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-accent transition-colors"
        >
          Edit Cart
        </Link>
        <LightSheenButton
          onClick={onNext}
          variant="primary"
          className="flex-1 py-3.5 rounded-full font-semibold text-sm"
        >
          Continue to Shipping
        </LightSheenButton>
      </div>
    </div>
  );
};

export default CartReview;
