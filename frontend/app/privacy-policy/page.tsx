import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase. We also collect information automatically when you visit our site, including your IP address, browser type, and pages visited.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use the information we collect to process your orders, send order confirmations and updates, respond to your questions and requests, send you promotional communications (with your consent), and improve our website and services.",
  },
  {
    title: "Information Sharing",
    content:
      "We do not sell, trade, or otherwise transfer your personal information to outside parties except as needed to fulfil your orders (e.g., shipping carriers) or as required by law. All third-party partners are required to maintain the confidentiality of your information.",
  },
  {
    title: "Data Security",
    content:
      "We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. Your payment information is encrypted using SSL technology.",
  },
  {
    title: "Cookies",
    content:
      "We use cookies to enhance your experience on our site, analyse site traffic, and personalise content. You can control cookie settings through your browser preferences. Disabling cookies may affect certain features of our website.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us at info@homestore.com.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date below.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4 mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Effective date: 1 January 2026. We are committed to protecting your privacy.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-display text-xl font-bold text-foreground mb-3">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            ))}

            <div className="bg-secondary rounded-xl p-6 text-sm text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:info@homestore.com" className="text-primary hover:underline">
                  info@homestore.com
                </a>{" "}
                or write to us at HomeStore, Zebbug, Malta.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
