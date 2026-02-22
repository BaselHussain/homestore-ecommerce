import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/products-mock";
import AnimatedElement from "@/components/ui/animated-element";

const CategoryGrid = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      {/* Header */}
      <AnimatedElement animationType="fadeIn">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Collections</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">Shop by Category</h2>
          </div>
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline hidden md:block">
            View all
          </Link>
        </div>
      </AnimatedElement>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categories.map((cat, i) => (
          <AnimatedElement
            key={cat.id}
            animationType="fadeIn"
            delay={i * 0.1}
            className="block"
          >
            <Link
              href={`/categories/${cat.slug}`}
              className={`group relative overflow-hidden rounded-lg bg-secondary ${
                i === 0 ? "md:row-span-2" : ""
              }`}
              style={{
                minHeight: i === 0 ? "400px" : "200px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div className="relative flex-grow">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 p-5 z-10">
                <h3 className="font-display text-lg font-bold text-card">{cat.name}</h3>
                <p className="text-card/70 text-xs mt-0.5">{cat.productCount} products</p>
                <span className="inline-block mt-2 text-xs font-semibold text-primary">Shop now</span>
              </div>
            </Link>
          </AnimatedElement>
        ))}
      </div>

      <div className="text-center mt-8 md:hidden">
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          View all categories
        </Link>
      </div>
    </div>
  </section>
);

export default CategoryGrid;
