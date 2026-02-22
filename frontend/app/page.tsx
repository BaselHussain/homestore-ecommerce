import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureBar from "@/components/FeatureBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import AnimatedElement from "@/components/ui/animated-element";

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
            description: "Free shipping on all orders over $50"
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
      <ReviewsCarousel />
      <AnimatedElement animationType="slideInUp" delay={0.3}>
        <PromoBanner />
      </AnimatedElement>
      <Footer />
    </div>
  );
}
