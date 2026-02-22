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
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Shop the Sale
      </Link>
    </div>
  </section>
);

export default PromoBanner;
