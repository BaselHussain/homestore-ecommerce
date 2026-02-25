'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlistStore } from "@/lib/wishlist-store";
import { categories, products } from "@/lib/products-mock";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "categories" | "account">("menu");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Cleanup mega menu timer on unmount
  useEffect(() => {
    return () => {
      if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    };
  }, []);

  const openMegaMenu = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    setMegaMenuOpen(true);
  };

  const closeMegaMenu = () => {
    megaTimerRef.current = setTimeout(() => setMegaMenuOpen(false), 150);
  };

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

  const closeMobile = () => {
    setMobileOpen(false);
    setActiveTab("menu");
    setOpenCategory(null);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-announcement text-announcement-foreground text-center py-2.5 text-xs font-medium tracking-widest uppercase">
        Free Delivery on Orders Over €50 · New Arrivals Every Week
      </div>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-foreground/40 z-[60] md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      />

      {/* Mobile Left Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-card z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <Link
            href="/"
            onClick={closeMobile}
            className="font-display text-lg font-bold tracking-wider text-foreground uppercase"
          >
            HomeStore
          </Link>
          <button
            onClick={closeMobile}
            className="p-2 cursor-pointer hover:text-primary transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {(
            [
              { id: "menu", label: "Menu" },
              { id: "categories", label: "Categories" },
              { id: "account", label: "Account" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "menu" && (
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={closeMobile}
                  className={`block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                    pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {activeTab === "categories" && (
            <div className="space-y-2">
              {categories.map((category) => {
                const categoryProducts = products
                  .filter((p) => p.category === category.name)
                  .slice(0, 3);
                const isOpen = openCategory === category.id;
                return (
                  <div key={category.id} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenCategory(isOpen ? null : category.id)}
                      className="w-full flex items-center justify-between p-3 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {category.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-200 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-1.5">
                          {categoryProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={closeMobile}
                              className="block text-xs text-muted-foreground hover:text-primary py-1 pl-2 border-l-2 border-border hover:border-primary transition-all"
                            >
                              {product.name}
                            </Link>
                          ))}
                          <Link
                            href={`/categories/${category.slug}`}
                            onClick={closeMobile}
                            className="block text-xs text-primary font-semibold pt-1.5 hover:underline"
                          >
                            View all →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-2">
              <Link
                href="/orders"
                onClick={closeMobile}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/orders"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                My Orders
              </Link>
              <Link
                href="/wishlist"
                onClick={closeMobile}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/wishlist"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                <Heart className="w-4 h-4" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        {/* Container is the positioning context for the mega menu */}
        <div className="container mx-auto px-4 lg:px-8 relative">
          {/* Nav bar row */}
          <div className="flex items-center justify-between h-16">
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
              {/* Category mega menu trigger */}
              <div onMouseEnter={openMegaMenu} onMouseLeave={closeMegaMenu}>
                <button
                  className="text-sm font-medium transition-colors hover:text-primary text-foreground flex items-center gap-1 cursor-pointer"
                  aria-label="Categories"
                >
                  Categories
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      megaMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </nav>

            <div className="flex items-center gap-0.5">
              <button
                className={`p-2 transition-all duration-300 hover:text-primary cursor-pointer ${
                  searchOpen ? "text-primary" : ""
                }`}
                aria-label={searchOpen ? "Close search" : "Open search"}
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search
                  className={`w-5 h-5 transition-transform duration-300 ${
                    searchOpen ? "scale-110" : ""
                  }`}
                />
              </button>
              <Link
                href="/orders"
                className="relative p-2 hover:text-primary transition-colors hidden md:block"
                aria-label="Orders"
              >
                <ClipboardList className="w-5 h-5" />
              </Link>
              <Link
                href="/wishlist"
                className="relative p-2 hover:text-primary transition-colors hidden md:block"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative p-2 hover:text-primary transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                className="md:hidden p-2 cursor-pointer"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mega Menu — positioned relative to container, spans logo→cart */}
          <div
            onMouseEnter={openMegaMenu}
            onMouseLeave={closeMegaMenu}
            className={`hidden md:block absolute top-full left-6 right-6 bg-card border border-border rounded-xl shadow-xl overflow-hidden transition-all duration-200 z-50 ${
              megaMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <div className="flex">
              {/* Left: Categories grid — 3 columns */}
              <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-6 p-8">
                {categories.map((category) => {
                  const catProducts = products
                    .filter((p) => p.category === category.name)
                    .slice(0, 5);
                  return (
                    <div key={category.id}>
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="block font-semibold text-sm text-primary hover:underline mb-1"
                      >
                        {category.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mb-2">
                        {products.filter((p) => p.category === category.name).length} products
                      </p>
                      <div className="space-y-1">
                        {catProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={() => setMegaMenuOpen(false)}
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

              {/* Right: Featured image — full height of dropdown */}
              <div className="relative w-56 shrink-0">
                <Image
                  src="/images/hero-image.jpg"
                  alt="Explore Our Collections"
                  fill
                  className="object-cover"
                  sizes="224px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-[10px] text-white/70 font-semibold uppercase tracking-widest mb-1">
                      Featured
                    </p>
                    <p className="text-white font-display font-bold text-base leading-tight">
                      Explore Our Collections
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setMegaMenuOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
                    >
                      Shop all <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
              <form
                onSubmit={handleSearch}
                className="container mx-auto max-w-xl flex gap-2 items-center"
              >
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
                  className="relative overflow-hidden bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] cursor-pointer before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
