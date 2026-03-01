import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/lib/products-mock';
import { serverGetProducts } from '@/lib/server-api';
import AnimatedElement from '@/components/ui/animated-element';

export const revalidate = 300;

// Pre-generate all known category pages at build time
export function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  const displayName = category?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const categoryName = category?.name ?? displayName;

  const products = await serverGetProducts({ category: categoryName, limit: 100 });

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-12 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{displayName}</span>
        </nav>

        <AnimatedElement animationType="fadeIn">
          <div className="mb-8">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Category</span>
            <h1 className="font-display text-4xl font-bold text-foreground mt-1">{displayName}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </AnimatedElement>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, i) => (
              <AnimatedElement key={product.id} animationType="slideInUp" delay={(i % 4) * 0.07}>
                <ProductCard product={product} />
              </AnimatedElement>
            ))}
          </div>
        ) : (
          <AnimatedElement animationType="fadeIn">
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package className="w-16 h-16 text-muted-foreground mb-6" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Products Found</h2>
              <p className="text-muted-foreground mb-6">
                There are no products in this category yet.
              </p>
              <Link
                href="/products"
                className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                View All Products
              </Link>
            </div>
          </AnimatedElement>
        )}
      </main>
      <Footer />
    </div>
  );
}
