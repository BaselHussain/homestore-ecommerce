'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, ChevronRight, Flame } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartItemRow from '@/components/CartItemRow';
import ProductCard from '@/components/ProductCard';
import LightSheenButton from '@/components/ui/light-sheen-button';
import { useCartStore } from '@/lib/cart-store';
import { products as allProducts } from '@/lib/products-mock';
import AnimatedElement from '@/components/ui/animated-element';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const cartCount = useCartStore((s) => s.cartCount());

  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shipping;

  const COUNTDOWN_START = 3 * 60 + 60; // 4:00 (3 mins + 60 secs)
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? COUNTDOWN_START : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const cartProductIds = new Set(items.map((i) => i.product.id));
  const cartCategories = new Set(items.map((i) => i.product.category));
  const notInCart = allProducts.filter((p) => !cartProductIds.has(p.id));
  const suggested = [
    ...notInCart.filter((p) => cartCategories.has(p.category)),
    ...notInCart.filter((p) => !cartCategories.has(p.category)),
  ].slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 lg:px-8 pt-20 pb-24 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-8 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Cart</span>
        </nav>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Shopping Cart ({cartCount})
        </h1>
        <div className="flex justify-center mb-8 px-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 md:gap-3 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-2 md:px-5 md:py-2.5">
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500 fill-orange-500 shrink-0 animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-foreground">
              Limited stock — complete your checkout in
            </span>
            <span className="font-bold text-orange-500 tabular-nums text-xs md:text-base bg-orange-500/15 px-2 md:px-3 py-0.5 rounded-full border border-orange-500/30">
              {mins}m {secs}s
            </span>
            <span className="text-xs md:text-sm font-medium text-foreground">
              before items sell out!
            </span>
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500 fill-orange-500 shrink-0 animate-pulse" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
            <button
              onClick={clearCart}
              className="text-xs mt-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground font-medium">
                  {shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground mb-6">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <LightSheenButton
              onClick={() => router.push('/checkout')}
              variant="primary"
              className="w-full py-3.5 rounded-full font-semibold text-sm cursor-pointer"
            >
              Proceed to Checkout
            </LightSheenButton>
            {subtotal < 50 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Add €{(50 - subtotal).toFixed(2)} more for free delivery
              </p>
            )}
          </div>
        </div>

        {/* People also buy */}
        {suggested.length > 0 && (
          <div className="mt-16">
            <AnimatedElement animationType="fadeIn">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold tracking-widest uppercase text-primary">Recommendations</span>
                  <h2 className="font-display text-2xl font-bold text-foreground mt-1">People Also Buy</h2>
                </div>
                <Link href="/products" className="text-sm font-medium text-primary hover:underline hidden sm:block">
                  View all
                </Link>
              </div>
            </AnimatedElement>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {suggested.map((product, i) => (
                <AnimatedElement key={product.id} animationType="slideInUp" delay={i * 0.08}>
                  <ProductCard product={product} />
                </AnimatedElement>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
