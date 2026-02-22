import Link from "next/link";
import ProductCard from "./ProductCard";
import { products } from "@/lib/products-mock";

const FeaturedProducts = () => (
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProducts;
