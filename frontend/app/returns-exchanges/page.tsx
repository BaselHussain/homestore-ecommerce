import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { RotateCcw, Package, Clock, CheckCircle, RefreshCw, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Package,
    title: "Pack Your Item",
    description:
      "Repack the item securely in its original packaging where possible. Include all original accessories, tags, and documentation.",
  },
  {
    step: "02",
    icon: RotateCcw,
    title: "Initiate a Return",
    description:
      "Email us at info@homestore.com with your order number and reason for return. We will respond within 24 hours with instructions.",
  },
  {
    step: "03",
    icon: Clock,
    title: "Ship It Back",
    description:
      "Send the package to us using your preferred carrier. We recommend using a tracked service. Return shipping costs are covered by the customer unless the item is faulty.",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Refund or Exchange",
    description:
      "Once we receive and inspect the item, we will process your refund within 5–7 business days or dispatch your replacement immediately.",
  },
];

const faqs = [
  {
    q: "What is your return window?",
    a: "We accept returns within 30 days of the delivery date for most items in original, unused condition.",
  },
  {
    q: "Are there any non-returnable items?",
    a: "Perishable goods, personalised items, and products marked as final sale are not eligible for return. Gift cards are non-refundable.",
  },
  {
    q: "Can I exchange for a different product?",
    a: "Yes! If you'd like a different item, colour, or size, simply initiate a return and place a new order. We'll process your refund as soon as we receive the original item.",
  },
  {
    q: "What if my item arrived damaged?",
    a: "We're sorry to hear that. Please email us at info@homestore.com with photos of the damage within 48 hours of delivery. We will arrange a free replacement or full refund.",
  },
  {
    q: "How will I receive my refund?",
    a: "Refunds are returned to the original payment method. Please allow 5–7 business days after we receive your return for the refund to appear.",
  },
];

const highlights = [
  { value: "30 Days", label: "Return Window" },
  { value: "Free", label: "Exchange" },
  { value: "5–7 Days", label: "Refund Processing" },
];

export default function ReturnsExchanges() {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Customer Care</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mt-4 mb-6">
              Returns &amp; Exchanges
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Not completely satisfied? We make it easy to return or exchange within 30 days — no hassle, no questions asked.
            </p>
            {/* Trust pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "✓ 30-Day Returns",
                "✓ Free Exchanges",
                "✓ 5–7 Day Refunds",
              ].map((pill) => (
                <span
                  key={pill}
                  className="bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Policy Highlights Bar */}
        <section className="bg-primary text-primary-foreground py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              {highlights.map((h) => (
                <div key={h.label}>
                  <div className="font-display text-3xl md:text-4xl font-bold">{h.value}</div>
                  <div className="text-primary-foreground/70 text-sm mt-1">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Simple Process</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
                How It Works
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="bg-card border border-border rounded-xl p-6 relative overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Faded step number */}
                  <span className="absolute -top-3 -right-2 font-display text-8xl font-bold text-foreground/5 select-none leading-none">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 relative z-10">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2 relative z-10">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{step.description}</p>
                  {/* Connector arrow (desktop only, not on last item) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <ArrowRight className="w-5 h-5 text-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Common Questions</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-card border border-border border-l-4 border-l-primary/40 rounded-xl p-6 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <h3 className="font-display font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-xl">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our customer care team is available 7 days a week and will get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:info@homestore.com"
                className="relative overflow-hidden inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
              >
                Email Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-accent hover:shadow-md hover:shadow-primary/20 hover:scale-[1.02]"
              >
                Contact Page
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
