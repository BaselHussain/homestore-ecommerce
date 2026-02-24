import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import LightSheenButton from "@/components/ui/light-sheen-button";
import AnimatedElement from "@/components/ui/animated-element";

const Contact = () => (
  <div className="flex-1 flex flex-col">
    <Header />
    <main className="flex-1 min-h-[60vh] container mx-auto px-4 lg:px-8 pt-20 pb-24">
      <div className="max-w-4xl mx-auto">
        <AnimatedElement animationType="fadeIn">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">Get In Touch</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Contact Us</h1>
          </div>
        </AnimatedElement>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Phone, title: "Call Us", detail: "+356 2149 1701" },
            { icon: Mail, title: "Email Us", detail: "info@homestore.com" },
            { icon: MapPin, title: "Visit Us", detail: "Zebbug, Malta" },
          ].map((item, i) => (
            <AnimatedElement key={item.title} animationType="slideInUp" delay={i * 0.1}>
              <div className="bg-card rounded-xl p-6 text-center border border-border">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* Contact Form */}
        <AnimatedElement animationType="slideInUp" delay={0.1}>
          <div className="bg-card rounded-xl border border-border p-8 max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <textarea
                rows={4}
                placeholder="Your Message"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <LightSheenButton
                type="submit"
                variant="primary"
                className="w-full py-3.5 rounded-full font-semibold"
              >
                Send Message
              </LightSheenButton>
            </form>
          </div>
        </AnimatedElement>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;
