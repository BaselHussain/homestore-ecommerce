'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { products as mockProducts, categories } from '@/lib/products-mock';
import type { Product } from '@/lib/products-mock';

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

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(() => {
    setLoading(true);
    // Simulate async fetch — use mock data with filtering
    const timer = setTimeout(() => {
      let filtered = [...mockProducts];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (categoryFilter) {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase().replace(/\s+/g, '-') === categoryFilter
        );
      }
      setProducts(filtered);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    return loadProducts();
  }, [loadProducts]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('search');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Products</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Catalogue</span>
            <h1 className="font-display text-4xl font-bold text-foreground mt-1">All Products</h1>
            {!loading && (
              <p className="text-muted-foreground mt-1 text-sm">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <SearchBar
            defaultValue={searchQuery}
            onSearch={handleSearch}
            className="w-full md:w-72"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              !categoryFilter
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:border-primary hover:text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                categoryFilter === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-16 h-16 text-muted-foreground mb-6" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Products Found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or browse all categories.
            </p>
            <button
              onClick={() => {
                router.push('/products');
              }}
              className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              View All Products
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-24">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
                <div className="aspect-square w-full animate-pulse bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
