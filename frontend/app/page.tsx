import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureBar from "@/components/FeatureBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import AnimatedElement from "@/components/ui/animated-element";

const Testimonials = () => (
  <section className="py-20 bg-muted">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedElement animationType="fadeIn" className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">Don&apos;t just take our word for it - hear from our satisfied customers</p>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            text: "The quality of the products exceeded my expectations. Delivery was fast and packaging was perfect!",
            author: "Sarah Johnson",
            role: "Furniture Buyer"
          },
          {
            text: "I've been shopping here for years and have never been disappointed. Great customer service!",
            author: "Michael Chen",
            role: "Regular Customer"
          },
          {
            text: "The variety of products is amazing. I found exactly what I was looking for at a great price.",
            author: "Emma Rodriguez",
            role: "Gift Buyer"
          }
        ].map((testimonial, index) => (
          <AnimatedElement key={index} animationType="slideInUp" delay={index * 0.1}>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-primary text-primary" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground mb-4">&quot;{testimonial.text}&quot;</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <AnimatedElement animationType="fadeIn" className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose HomeStore</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">We go above and beyond to make your shopping experience exceptional</p>
      </AnimatedElement>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          {
            icon: "🚚",
            title: "Free Delivery",
            description: "Free shipping on all orders over €50"
          },
          {
            icon: "🔄",
            title: "Easy Returns",
            description: "30-day hassle-free returns"
          },
          {
            icon: "🔒",
            title: "Secure Payment",
            description: "Safe and encrypted transactions"
          },
          {
            icon: "⭐",
            title: "Quality Guarantee",
            description: "Premium products with warranty"
          }
        ].map((feature, index) => (
          <AnimatedElement key={index} animationType="slideInUp" delay={index * 0.1} className="text-center">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </AnimatedElement>
        ))}
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <AnimatedElement animationType="fadeIn">
        <Hero />
      </AnimatedElement>
      <AnimatedElement animationType="slideInUp">
        <FeatureBar />
      </AnimatedElement>
      <Features />
      <AnimatedElement animationType="slideInUp" delay={0.1}>
        <CategoryGrid />
      </AnimatedElement>
      <AnimatedElement animationType="slideInUp" delay={0.2}>
        <FeaturedProducts />
      </AnimatedElement>
      <Testimonials />
      <AnimatedElement animationType="slideInUp" delay={0.3}>
        <PromoBanner />
      </AnimatedElement>
      <Footer />
    </div>
  );
}
