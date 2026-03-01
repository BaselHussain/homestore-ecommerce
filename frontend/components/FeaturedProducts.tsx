'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/products-mock';
import { Skeleton } from '@/components/ui/skeleton';

const ProductSkeleton = () => (
  <div className="rounded-xl overflow-hidden border border-border bg-card">
    <Skeleton className="aspect-square w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getAll({ limit: 8 })
      .then((data) => setProducts(data.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Trending</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">Featured Products</h2>
          </div>
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline hidden md:block">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
