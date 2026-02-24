import Link from "next/link";

const PromoBanner = () => (
  <section className="py-20 bg-accent">
    <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
      <span className="text-xs font-semibold tracking-widest uppercase text-primary">Limited Time</span>
      <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
        Up to 40% off this season&apos;s favourites.
      </h2>
      <p className="text-muted-foreground mb-8">
        Explore curated offers across all our categories — while stocks last.
      </p>
      <Link
        href="/categories/special-offers"
        className="relative overflow-hidden inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
      >
        Shop the Sale
      </Link>
    </div>
  </section>
);

export default PromoBanner;
