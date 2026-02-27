'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LightSheenButton from '@/components/ui/light-sheen-button';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useCartStore } from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

function WishlistPageContent() {
  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const handleAddToCart = (product: typeof items[0]['product']) => {
    addToCart(product, 1);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast({
      title: 'Removed from wishlist',
      description: `${productName} has been removed.`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 py-20 text-center">
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
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Wishlist</span>
        </nav>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(({ product }) => {
            const isOutOfStock = product.badge === 'out-of-stock';
            return (
              <div
                key={product.id}
                className="group border border-border rounded-xl overflow-hidden bg-card shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                        isOutOfStock ? 'opacity-60' : 'group-hover:brightness-90'
                      }`}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                </Link>

                <div className="p-3">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-body text-sm font-semibold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <LightSheenButton
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      variant="primary"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </LightSheenButton>
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="p-2 rounded-full border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-all duration-200"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
}
