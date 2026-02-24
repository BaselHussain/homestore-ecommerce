import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AnimatedElement from "@/components/ui/animated-element";
import LightSheenButton from "@/components/ui/light-sheen-button";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-image.jpg"
          alt="HomeStore — quality home goods"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card/90 via-card/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-xl">
          <AnimatedElement animationType="fadeIn" delay={0.2}>
            <span className="inline-flex items-center gap-2 bg-accent/80 backdrop-blur-sm text-accent-foreground text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              ✦ New Collection 2026
            </span>
          </AnimatedElement>

          <AnimatedElement animationType="slideInLeft" delay={0.3}>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-foreground">
              Live What{" "}
              <span className="text-primary">You Love.</span>
            </h1>
          </AnimatedElement>

          <AnimatedElement animationType="slideInLeft" delay={0.4}>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-md">
              Quality household goods, outdoor furniture, gifts & more — everything to make your home special.
            </p>
          </AnimatedElement>

          <AnimatedElement animationType="slideInUp" delay={0.5} className="flex flex-wrap gap-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-foreground text-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-foreground hover:text-background transition-all duration-300 hover:shadow-lg hover:shadow-foreground/30 hover:scale-[1.02] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
            >
              Our Story
            </Link>
          </AnimatedElement>

          {/* Stats */}
          <AnimatedElement animationType="slideInUp" delay={0.6}>
            <div className="flex gap-8 mt-12">
              {[
                { value: "5.2K+", label: "Products" },
                { value: "98%", label: "Satisfaction" },
                { value: "50+", label: "Brands" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default Hero;
