'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Package, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi } from '@/lib/api';
import { categories } from '@/lib/products-mock';
import type { Product } from '@/lib/products-mock';
import AnimatedElement from '@/components/ui/animated-element';
import LightSheenButton from '@/components/ui/light-sheen-button';

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

function ProductsContent({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');
  const limit = 12; // Show 12 products per page

  // If ISR server fetch returned nothing (backend unreachable at render time),
  // fall back to client-side fetch
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    if (initialProducts.length === 0) {
      productsApi
        .getAll({ limit: 100 })
        .then((data) => setAllProducts(data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialProducts.length]);
  const categoryFilter = searchParams.get('category') || '';

  const categoryName = categoryFilter
    ? categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter
    : undefined;

  // Filter locally from ISR-cached products — no API call on search/filter
  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (categoryName) {
      result = result.filter((p) => p.category === categoryName);
    }
    return result;
  }, [allProducts, searchQuery, categoryName]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / limit);
  const currentPage = Math.max(1, Math.min(pageParam, totalPages || 1));
  const startIndex = (currentPage - 1) * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

  const handleSearch = (query: string) => {
    // Preserve existing category filter; only reset page
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (categoryFilter) params.set('category', categoryFilter);
    // Omit page param — page 1 is the default (keeps URL clean)
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryFilter = (slug: string) => {
    // Clear search and reset page when switching category
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-12 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Products</span>
        </nav>

        <AnimatedElement animationType="fadeIn">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Catalogue</span>
              <h1 className="font-display text-4xl font-bold text-foreground mt-1">All Products</h1>
              {!loading && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            <SearchBar
              defaultValue={searchQuery}
              onSearch={handleSearch}
              className="w-full md:w-72"
            />
          </div>
        </AnimatedElement>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              !categoryFilter
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/40'
                : 'bg-card border border-border text-foreground hover:border-primary hover:text-primary hover:shadow-md hover:shadow-primary/20'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                categoryFilter === cat.slug
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/40'
                  : 'bg-card border border-border text-foreground hover:border-primary hover:text-primary hover:shadow-md hover:shadow-primary/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-12">
                <div className="flex items-center gap-2">
                  <LightSheenButton
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </span>
                  </LightSheenButton>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-full text-sm font-medium cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border text-foreground hover:bg-accent'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <LightSheenButton
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </span>
                  </LightSheenButton>
                </div>

                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-16 h-16 text-muted-foreground mb-6" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Products Found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or browse all categories.
            </p>
            <button
              onClick={() => router.push('/products')}
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

export default function ProductsClientPage({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 pt-12 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-24">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductsContent initialProducts={initialProducts} />
    </Suspense>
  );
}
