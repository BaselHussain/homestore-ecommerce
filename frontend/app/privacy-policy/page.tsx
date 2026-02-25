import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Eye, Share2, Lock, Cookie, UserCheck, Bell, Mail } from "lucide-react";
import AnimatedElement from "@/components/ui/animated-element";

const sections = [
  {
    number: "01",
    icon: Eye,
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase. We also collect information automatically when you visit our site, including your IP address, browser type, and pages visited.",
  },
  {
    number: "02",
    icon: Bell,
    title: "How We Use Your Information",
    content:
      "We use the information we collect to process your orders, send order confirmations and updates, respond to your questions and requests, send you promotional communications (with your consent), and improve our website and services.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Information Sharing",
    content:
      "We do not sell, trade, or otherwise transfer your personal information to outside parties except as needed to fulfil your orders (e.g., shipping carriers) or as required by law. All third-party partners are required to maintain the confidentiality of your information.",
  },
  {
    number: "04",
    icon: Lock,
    title: "Data Security",
    content:
      "We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. Your payment information is encrypted using SSL technology.",
  },
  {
    number: "05",
    icon: Cookie,
    title: "Cookies",
    content:
      "We use cookies to enhance your experience on our site, analyse site traffic, and personalise content. You can control cookie settings through your browser preferences. Disabling cookies may affect certain features of our website.",
  },
  {
    number: "06",
    icon: UserCheck,
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us at info@homestore.com.",
  },
  {
    number: "07",
    icon: Shield,
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date below.",
  },
];

const trustBadges = [
  { Icon: Lock, label: "SSL Encrypted" },
  { Icon: Eye, label: "No Data Selling" },
  { Icon: Mail, label: "GDPR Compliant" },
];

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <AnimatedElement animationType="fadeIn">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Legal</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-6">
                Your Privacy Matters
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Effective 1 January 2026 · We&apos;re committed to protecting your personal data and being transparent about how we use it.
              </p>
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {trustBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className="bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5"
                  >
                    <badge.Icon className="w-4 h-4" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </AnimatedElement>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-6">
            {sections.map((s, i) => (
              <AnimatedElement key={s.title} animationType="slideInUp" delay={i * 0.07}>
                <div className="bg-card border border-border border-l-4 border-l-primary/30 rounded-xl p-8 relative overflow-hidden hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl font-bold text-foreground mb-3">{s.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{s.content}</p>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <AnimatedElement animationType="slideInUp">
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                  Questions about your privacy?
                </h2>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Contact our Data Protection team at{" "}
                  <a href="mailto:info@homestore.com" className="text-primary hover:underline font-medium">
                    info@homestore.com
                  </a>
                  {" "}or write to us at HomeStore, Zebbug, Malta.
                </p>
                <Link
                  href="/contact"
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
                >
                  <Mail className="w-4 h-4" />
                  Get in Touch
                </Link>
              </div>
            </AnimatedElement>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
