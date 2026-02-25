'use client';

import Link from 'next/link';
import { Heart, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useWishlistStore } from '@/lib/wishlist-store';
import AnimatedElement from '@/components/ui/animated-element';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 lg:px-8 pt-20 pb-24 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">Save items you love to your wishlist.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-12 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Wishlist</span>
        </nav>

        <AnimatedElement animationType="fadeIn">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Saved Items</span>
              <h1 className="font-display text-4xl font-bold text-foreground mt-1">My Wishlist</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {items.length} item{items.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-primary hover:underline hidden md:block"
            >
              Continue Shopping
            </Link>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {items.map(({ product }, i) => (
            <AnimatedElement key={product.id} animationType="slideInUp" delay={(i % 4) * 0.08}>
              <ProductCard product={product} wishlistMode />
            </AnimatedElement>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
