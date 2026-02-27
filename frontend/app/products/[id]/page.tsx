'use client';

import { useState, use, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Minus, Plus, ShoppingBag, Heart, ChevronRight } from 'lucide-react';
import { useAnimate } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductImageZoom from '@/components/ProductImageZoom';
import LightSheenButton from '@/components/ui/light-sheen-button';
import { Skeleton } from '@/components/ui/skeleton';
import { products as mockProducts } from '@/lib/products-mock';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useToast } from '@/hooks/use-toast';
import AnimatedElement from '@/components/ui/animated-element';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const product = mockProducts.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [scope, animate] = useAnimate();
  const addToCart = useCartStore((s) => s.addItem);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) => s.items.some((i) => i.product.id === id));
  const { toast } = useToast();

  const isOutOfStock = product?.badge === 'out-of-stock';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shake animation: first shake after 2.5s, then every 3s
  useEffect(() => {
    if (isOutOfStock || !scope.current) return;

    const shake = () => {
      if (scope.current) {
        animate(scope.current, { x: [0, -8, 8, -8, 8, -4, 4, 0] }, { duration: 0.6, ease: "easeInOut" });
      }
    };

    const timer = setTimeout(() => {
      shake();
      intervalRef.current = setInterval(shake, 3000);
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOutOfStock, animate, scope]);

  if (!product) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast({
      title: 'Added to cart',
      description: `${qty}× ${product.name} added to your cart.`,
    });
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({ title: 'Removed from wishlist', description: `${product.name} removed.` });
    } else {
      addToWishlist(product);
      toast({ title: 'Added to wishlist', description: `${product.name} saved to wishlist.` });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-8 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image with zoom */}
          <AnimatedElement animationType="fadeIn">
            <ProductImageZoom
              src={product.image}
              alt={product.name}
              className="aspect-square"
            />
          </AnimatedElement>

          {/* Product Info */}
          <AnimatedElement animationType="slideInRight">
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
              {product.category}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-primary text-primary'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">€{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.badge === 'sale' && product.originalPrice && (
                <span className="text-xs font-bold uppercase bg-badge-sale text-primary-foreground px-2 py-0.5 rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              Premium quality product from our {product.category.toLowerCase()} collection.
              Item code: {product.itemCode}. Built to last with excellent craftsmanship and materials.
              Perfect for everyday use and makes a great gift.
            </p>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOutOfStock ? 'bg-badge-out' : 'bg-badge-new'
                }`}
              />
              <span className="text-sm font-medium text-foreground">
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>

            {!isOutOfStock ? (
              <div className="flex items-center gap-4 mb-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 hover:text-primary transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-3 hover:text-primary transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div ref={scope} className="flex-1">
                  <LightSheenButton
                    onClick={handleAddToCart}
                    variant="primary"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </LightSheenButton>
                </div>
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground text-center py-3.5 rounded-full font-semibold text-sm mb-4">
                Out of Stock
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={handleToggleWishlist}
              className={`flex items-center justify-center gap-2 py-3 rounded-full border text-sm font-semibold transition-all duration-300 mb-6 cursor-pointer ${
                isInWishlist
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-foreground hover:border-primary hover:text-primary'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-primary' : ''}`} />
              {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Details */}
            <div className="border-t border-border pt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Item Code</span>
                <span className="font-medium text-foreground">{product.itemCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-medium text-foreground">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-foreground">Free over €50</span>
              </div>
            </div>
          </div>
          </AnimatedElement>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <AnimatedElement animationType="fadeIn">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">You May Also Like</h2>
            </AnimatedElement>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((p, i) => (
                <AnimatedElement key={p.id} animationType="slideInUp" delay={i * 0.08}>
                  <ProductCard product={p} />
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
