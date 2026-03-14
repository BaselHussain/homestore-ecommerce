'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, X, Loader2 } from 'lucide-react';
import type { CartItem } from '@/contexts/CartContext';
import LightSheenButton from '@/components/ui/light-sheen-button';
import { couponsApi } from '@/lib/api';

interface CartReviewProps {
  items: CartItem[];
  subtotal: number;
  onNext: () => void;
  onCouponApplied: (code: string, discountAmount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
}

const CartReview = ({ items, subtotal, onNext, onCouponApplied, onCouponRemoved, appliedCoupon }: CartReviewProps) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const shipping = subtotal >= 50 ? 0 : 5;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setIsValidating(true);
    try {
      const result = await couponsApi.validate(couponInput.trim(), subtotal);
      if (result.valid) {
        onCouponApplied(result.code, result.discountAmount);
        setCouponInput('');
      } else {
        setCouponError(result.message);
      }
    } catch {
      setCouponError('Could not validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponError('');
    setCouponInput('');
  };

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

      {/* Coupon input */}
      {!appliedCoupon ? (
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponInput.trim()}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Apply
            </button>
          </div>
          {couponError && (
            <p className="text-xs text-destructive mt-1.5 ml-1">{couponError}</p>
          )}
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {appliedCoupon.code} applied
            </span>
          </div>
          <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground transition-colors ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">€{subtotal.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Coupon {appliedCoupon.code}</span>
            <span className="font-medium">−€{appliedCoupon.discountAmount.toFixed(2)}</span>
          </div>
        )}
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
          className="flex-1 py-3.5 rounded-full font-semibold text-sm cursor-pointer"
        >
          Continue to Shipping
        </LightSheenButton>
      </div>
    </div>
  );
};

export default CartReview;
