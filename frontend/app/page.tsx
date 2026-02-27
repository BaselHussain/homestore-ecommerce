import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureBar from "@/components/FeatureBar";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import AnimatedElement from "@/components/ui/animated-element";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <AnimatedElement animationType="fadeIn">
        <Hero />
      </AnimatedElement>
      <AnimatedElement animationType="slideInUp">
        <FeatureBar />
      </AnimatedElement>
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
