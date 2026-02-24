import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/products-mock";

const Categories = () => (
  <div className="flex-1 flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 lg:px-8 pt-12 pb-24">
      <h1 className="font-display text-4xl font-bold text-foreground mb-2">All Categories</h1>
      <p className="text-muted-foreground mb-10">Browse our full range of quality products for your home.</p>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative overflow-hidden rounded-lg h-48"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h3 className="font-display text-lg font-bold text-card">{cat.name}</h3>
              <p className="text-card/70 text-xs">{cat.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>

      {/* All Products */}
      <h2 className="font-display text-3xl font-bold text-foreground mb-8">All Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Categories;
