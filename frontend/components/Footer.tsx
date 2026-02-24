import Link from "next/link";
import LightSheenButton from "@/components/ui/light-sheen-button";

const Footer = () => (
  <footer className="bg-footer text-footer-foreground">
    {/* Newsletter */}
    <div className="border-b border-muted-foreground/20">
      <div className="container mx-auto px-4 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display text-xl font-bold text-card">Stay in the loop</h3>
          <p className="text-sm mt-1 text-footer-foreground/70">Get updates on new arrivals and exclusive offers.</p>
        </div>
        <div className="flex w-full md:w-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="bg-muted-foreground/10 border border-muted-foreground/20 rounded-l-full px-5 py-3 text-sm text-card placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-72"
          />
          <LightSheenButton className="px-8 md:px-6 py-3 rounded-r-full text-sm font-semibold whitespace-nowrap" variant="primary">
            Subscribe
          </LightSheenButton>
        </div>
      </div>
    </div>

    {/* Links */}
    <div className="container mx-auto px-4 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h4 className="font-display text-lg font-bold text-card mb-4">HomeStore</h4>
        <p className="text-sm text-footer-foreground/70 leading-relaxed">
          Quality household goods, outdoor furniture, gifts & souvenirs. Everything for your home.
        </p>
      </div>
      <div>
        <h5 className="text-sm font-semibold text-card mb-3">Shop</h5>
        <ul className="space-y-2 text-sm">
          <li><Link href="/categories/household-goods" className="hover:text-primary transition-colors">Household Goods</Link></li>
          <li><Link href="/categories/gifts" className="hover:text-primary transition-colors">Gifts</Link></li>
          <li><Link href="/categories/toys" className="hover:text-primary transition-colors">Toys</Link></li>
          <li><Link href="/categories/outdoor-furniture" className="hover:text-primary transition-colors">Outdoor Furniture</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="text-sm font-semibold text-card mb-3">Company</h5>
        <ul className="space-y-2 text-sm">
          <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
          <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          <li><Link href="/categories/special-offers" className="hover:text-primary transition-colors">Special Offers</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="text-sm font-semibold text-card mb-3">Support</h5>
        <ul className="space-y-2 text-sm">
          <li><span className="hover:text-primary transition-colors cursor-pointer">Shipping Info</span></li>
          <li><Link href="/returns-exchanges" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
          <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
        </ul>
      </div>
    </div>

    {/* Bottom */}
    <div className="border-t border-muted-foreground/20">
      <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-footer-foreground/50">
        <span>© 2026 HomeStore. All rights reserved.</span>
        <span>Designed with care for your home.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
