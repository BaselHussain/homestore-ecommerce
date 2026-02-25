'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Leaf, Users, Shield } from "lucide-react";
import AnimatedElement from "@/components/ui/animated-element";

const headingWords = ["We", "believe", "in", "beautiful", "things."];

const About = () => (
  <div className="flex-1 flex flex-col">
    <Header />
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/about-banner.png"
            alt="About HomeStore"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card/90 via-card/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <div className="max-w-4xl">
            <AnimatedElement animationType="fadeIn" delay={0.2}>
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Our Story</span>
            </AnimatedElement>

            {/* Word-by-word animated heading */}
            <motion.h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mt-4 mb-6 text-foreground"
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
              className="text-muted-foreground text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              HomeStore was founded with a simple idea: make it easy to discover and shop the world&apos;s most thoughtfully designed products — all in one place.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <AnimatedElement animationType="slideInLeft">
              <div className="aspect-[4/3] overflow-hidden rounded-xl relative">
                <Image
                  src="/images/about-image.jpg"
                  alt="The HomeStore team workspace"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </AnimatedElement>

            <AnimatedElement animationType="slideInRight">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">Since 2019</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6">
                  From a small studio to a global brand.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  What started as a small storefront in Malta has grown into one of the most respected multi-brand lifestyle destinations. We&apos;ve always kept the same values: exceptional products, honest pricing, and obsessive customer care.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Today, HomeStore carries over 5,000 products from 50+ independent brands across household goods, outdoor furniture, toys, gifts, and souvenirs — each one personally vetted by our buying team.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "50+", label: "Partner brands" },
                    { value: "5.2K", label: "Products" },
                    { value: "120K", label: "Happy customers" },
                  ].map((stat, i) => (
                    <AnimatedElement key={stat.label} animationType="slideInUp" delay={i * 0.1}>
                      <div className="bg-secondary rounded-xl p-4 text-center">
                        <div className="font-display text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                      </div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedElement animationType="fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">What drives us</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">Our Values</h2>
            </div>
          </AnimatedElement>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Curated with Care",
                description: "Every product we carry passes through a rigorous selection process — we only offer what we'd proudly own ourselves.",
              },
              {
                icon: Leaf,
                title: "Sustainably Minded",
                description: "We partner with brands committed to ethical manufacturing, sustainable materials, and fair labour practices.",
              },
              {
                icon: Users,
                title: "Community First",
                description: "Our customers aren't just shoppers — they're part of a growing community of people who value considered living.",
              },
              {
                icon: Shield,
                title: "Quality Guaranteed",
                description: "We stand behind every item we sell. If you're not completely satisfied, we'll make it right.",
              },
            ].map((value, i) => (
              <AnimatedElement key={value.title} animationType="slideInUp" delay={i * 0.1}>
                <div className="bg-card rounded-xl p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedElement animationType="fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">The People</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">Meet the Team</h2>
            </div>
          </AnimatedElement>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { initials: "IL", name: "Isabelle Laurent", role: "Founder & Creative Director" },
              { initials: "MC", name: "Marcus Chen", role: "Head of Buying" },
              { initials: "PN", name: "Priya Nair", role: "Brand Partnerships" },
              { initials: "TW", name: "Tom Webb", role: "Head of Operations" },
            ].map((member, i) => (
              <AnimatedElement key={member.name} animationType="slideInUp" delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-display text-lg font-bold text-foreground">{member.initials}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">{member.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{member.role}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
