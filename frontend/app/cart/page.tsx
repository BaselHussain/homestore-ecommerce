'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartItemRow from '@/components/CartItemRow';
import ProductCard from '@/components/ProductCard';
import LightSheenButton from '@/components/ui/light-sheen-button';
import { useCartStore } from '@/lib/cart-store';
import { products as allProducts } from '@/lib/products-mock';

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

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          Shopping Cart ({cartCount})
        </h1>

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
              className="text-xs mt-2 text-muted-foreground hover:text-destructive transition-colors"
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
                <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground font-medium">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <LightSheenButton
              onClick={() => router.push('/checkout')}
              variant="primary"
              className="w-full py-3.5 rounded-full font-semibold text-sm"
            >
              Proceed to Checkout
            </LightSheenButton>
            {subtotal < 50 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Add ${(50 - subtotal).toFixed(2)} more for free delivery
              </p>
            )}
          </div>
        </div>

        {/* People also buy */}
        {suggested.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">Recommendations</span>
                <h2 className="font-display text-2xl font-bold text-foreground mt-1">People Also Buy</h2>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline hidden sm:block">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {suggested.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
