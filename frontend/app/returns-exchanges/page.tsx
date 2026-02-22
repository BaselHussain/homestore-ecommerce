import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RotateCcw, Package, Clock, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "1. Pack Your Item",
    description:
      "Repack the item securely in its original packaging where possible. Include all original accessories, tags, and documentation.",
  },
  {
    icon: RotateCcw,
    title: "2. Initiate a Return",
    description:
      "Email us at info@homestore.com with your order number and reason for return. We will respond within 24 hours with instructions.",
  },
  {
    icon: Clock,
    title: "3. Ship It Back",
    description:
      "Send the package to us using your preferred carrier. We recommend using a tracked service. Return shipping costs are covered by the customer unless the item is faulty.",
  },
  {
    icon: CheckCircle,
    title: "4. Refund or Exchange",
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

export default function ReturnsExchanges() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Customer Care</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4 mb-4">
              Returns & Exchanges
            </h1>
            <p className="text-muted-foreground text-lg">
              Not completely satisfied? We make it easy to return or exchange within 30 days.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-10 text-center">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div key={step.title} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-muted-foreground text-sm">
                Still have questions?{" "}
                <a href="mailto:info@homestore.com" className="text-primary hover:underline font-medium">
                  Email us
                </a>{" "}
                and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
