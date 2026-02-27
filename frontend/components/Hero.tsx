'use client';

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import AnimatedElement from "@/components/ui/animated-element";

interface Stat {
  end: number;
  suffix?: string;
  label: string;
}

const headingWords = ["Live", "What", "You", "Love."];

const stats: Stat[] = [
  { end: 5200, suffix: "+", label: "Products" },
  { end: 98, suffix: "%", label: "Satisfaction" },
  { end: 50, suffix: "+", label: "Brands" },
];

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
        <div className="absolute inset-0 bg-linear-to-r from-card/90 via-card/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl">
          <AnimatedElement animationType="fadeIn" delay={0.2}>
            <span className="inline-flex items-center gap-2 bg-accent/80 backdrop-blur-sm text-accent-foreground text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              ✦ New Collection 2026
            </span>
          </AnimatedElement>

          {/* Word-by-word animated heading */}
          <motion.h1
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-foreground"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.3 },
              },
            }}
          >
            {headingWords.map((word, i) => {
              const isLast = i === headingWords.length - 1;
              return (
                <motion.span
                  key={word}
                  className={isLast ? "text-primary" : undefined}
                  style={{ display: "inline-block", marginRight: "0.3em" }}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.4, ease: "easeOut" },
                    },
                  }}
                >
                  {word}
                </motion.span>
              );
            })}
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Quality household goods, outdoor furniture, gifts & more — everything to make your home special.
          </motion.p>

          <AnimatedElement animationType="slideInUp" delay={0.5} className="flex flex-wrap gap-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-full"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-foreground text-foreground px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-foreground hover:text-background transition-all duration-300 hover:shadow-lg hover:shadow-foreground/30 hover:scale-[1.02] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-full"
            >
              Our Story
            </Link>
          </AnimatedElement>

          {/* Stats with CountUp */}
          <AnimatedElement animationType="slideInUp" delay={0.6}>
            <div className="flex gap-8 mt-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-bold text-foreground">
                    <CountUp
                      start={0}
                      end={stat.end}
                      duration={3}
                      suffix={stat.suffix}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </div>
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
