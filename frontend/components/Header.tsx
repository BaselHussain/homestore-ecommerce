'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, ClipboardList } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlistStore } from "@/lib/wishlist-store";
import { categories, products } from "@/lib/products-mock";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-announcement text-announcement-foreground text-center py-2.5 text-xs font-medium tracking-widest uppercase">
        Free Delivery on Orders Over $50 · New Arrivals Every Week
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl font-bold tracking-wider text-foreground uppercase">
            HomeStore
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 ${
                  pathname === link.path ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Category dropdown */}
            <div className="relative group">
              <button
                className="text-sm font-medium transition-colors hover:text-primary text-foreground flex items-center gap-1"
                aria-label="Categories"
              >
                Categories
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full right-0 w-72 mt-2 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <div className="grid grid-cols-2 gap-3 p-4">
                  {categories.map((category) => {
                    const categoryProducts = products.filter(p => p.category === category.name).slice(0, 2);

                    return (
                      <div key={category.id}>
                        <Link
                          href={`/categories/${category.slug}`}
                          className="block py-1 text-sm font-semibold text-primary hover:underline"
                        >
                          {category.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{category.productCount} products</p>

                        <div className="mt-2 space-y-1">
                          {categoryProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              className="block text-xs text-foreground hover:text-primary truncate"
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              className={`p-2 transition-all duration-300 hover:text-primary ${searchOpen ? "text-primary" : ""}`}
              aria-label={searchOpen ? "Close search" : "Open search"}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className={`w-5 h-5 transition-transform duration-300 ${searchOpen ? "scale-110" : ""}`} />
            </button>
            <Link href="/orders" className="relative p-2 hover:text-primary transition-colors" aria-label="Orders">
              <ClipboardList className="w-5 h-5" />
            </Link>
            <Link href="/wishlist" className="relative p-2 hover:text-primary transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative p-2 hover:text-primary transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar — always in DOM, animated via grid-rows */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            searchOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`border-t border-border bg-card px-4 py-3 transition-all duration-300 ${
                searchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              }`}
            >
              <form onSubmit={handleSearch} className="container mx-auto max-w-xl flex gap-2 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  placeholder="Search products..."
                  autoFocus={searchOpen}
                  className="flex-1 bg-background border border-border rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="relative overflow-hidden bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2 ${
                  pathname === link.path ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categories</h3>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-foreground py-1.5 hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
