'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, ChevronRight, Package, User, LogOut } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { categories } from "@/lib/products-mock";
import type { Product } from "@/lib/products-mock";

const ANNOUNCEMENTS = [
  "Free Delivery on Orders Over €50 · New Arrivals Every Week",
  "Shop Local · 100% Authentic Maltese Souvenirs & Home Goods",
];

const Header = () => {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementAnim, setAnnouncementAnim] = useState<"idle" | "exit" | "enter">("idle");
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
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';
    fetch(`${base}/products?limit=100`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) setProducts(data.data.map((p: any) => ({
          id: p.id, name: p.name, price: parseFloat(p.price),
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/images/category-household.jpg',
          category: p.category, rating: 0, reviews: 0, itemCode: p.itemCode ?? '',
        })));
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  // Announcement bar cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementAnim("exit");
      setTimeout(() => {
        setAnnouncementIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
        setAnnouncementAnim("enter");
        setTimeout(() => setAnnouncementAnim("idle"), 400);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="bg-announcement text-announcement-foreground text-center py-2.5 text-[8px] md:text-xs font-medium tracking-widest uppercase overflow-hidden h-8 flex items-center justify-center">
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s",
            transform:
              announcementAnim === "exit"
                ? "translateY(100%)"
                : announcementAnim === "enter"
                ? "translateY(-100%)"
                : "translateY(0)",
            opacity: announcementAnim === "idle" ? 1 : 0,
          }}
        >
          {ANNOUNCEMENTS[announcementIndex]}
        </span>
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
                const isOpen = openCategory === category.id;
                const allInCategory = products.filter((p) => p.category === category.name);
                const categoryProducts = allInCategory.slice(0, 4);
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
                        <div className="px-3 pb-3 space-y-1">
                          {categoryProducts.map((p) => (
                            <Link
                              key={p.id}
                              href={`/products/${p.id}`}
                              onClick={closeMobile}
                              className="block text-xs text-foreground hover:text-primary py-1 pl-2 border-l-2 border-border hover:border-primary transition-all"
                            >
                              {p.name}
                            </Link>
                          ))}
                          <Link
                            href={`/products?category=${category.slug}`}
                            onClick={closeMobile}
                            className="block text-xs text-primary font-semibold pt-2 hover:underline"
                          >
                            See all {allInCategory.length} →
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
                href="/track-order"
                onClick={closeMobile}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/track-order"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                <Package className="w-4 h-4" />
                Track Order
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
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
              {/* Auth user menu */}
              {isAuthenticated ? (
                <div className="relative group hidden md:flex">
                  <button className="p-2 hover:text-primary transition-colors cursor-pointer" aria-label="Account">
                    <User className="w-5 h-5" />
                  </button>
                  <div className="absolute top-full right-0 w-48 mt-2 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors p-2" aria-label="Sign in">
                  <User className="w-5 h-5" />
                </Link>
              )}
              <Link
                href="/track-order"
                className="relative p-2 hover:text-primary transition-colors hidden md:block"
                aria-label="Track Order"
              >
                <Package className="w-5 h-5" />
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

          {/* Mega Menu wrapper — handles hover and positioning */}
          <div
            onMouseEnter={openMegaMenu}
            onMouseLeave={closeMegaMenu}
            className={`hidden md:block absolute top-full left-6 right-6 z-50 transition-all duration-200 ${
              megaMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            {/* Dropdown panel — overflow-hidden for clean rounded corners */}
            <div className="bg-card rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-stretch">
                {/* Left: Categories grid */}
                <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-6 p-8">
                  {categories.map((category) => {
                    const allInCategory = products.filter((p) => p.category === category.name);
                    const categoryProducts = allInCategory.slice(0, 4);
                    return (
                      <div key={category.id}>
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="block font-semibold text-sm text-primary hover:underline mb-2"
                        >
                          {category.name}
                        </Link>
                        <ul className="space-y-1.5 mb-2">
                          {categoryProducts.map((p) => (
                            <li key={p.id}>
                              <Link
                                href={`/products/${p.id}`}
                                onClick={() => setMegaMenuOpen(false)}
                                className="block text-xs text-foreground hover:text-primary truncate transition-colors"
                              >
                                {p.name}
                              </Link>
                            </li>
                          ))}
                          {categoryProducts.length === 0 && (
                            <li className="text-xs text-muted-foreground">No products yet</li>
                          )}
                        </ul>
                        <Link
                          href={`/products?category=${category.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          See all {allInCategory.length} →
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Promo card */}
                <div className="w-80 xl:w-90 shrink-0 self-stretch">
                  <div className="h-full bg-primary flex flex-col p-6">
                    <p className="text-[10px] text-primary-foreground/60 font-semibold uppercase tracking-widest mb-2">
                      Special Offer
                    </p>
                    <p className="text-primary-foreground font-display font-bold text-2xl leading-tight mb-1">
                      Shop Our<br />Collections
                    </p>
                    <p className="text-primary-foreground/70 text-xs mb-5">
                      Exclusive deals on premium home goods
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setMegaMenuOpen(false)}
                      className="relative overflow-hidden inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-foreground text-primary px-4 py-2 rounded-full w-fit transition-all duration-300 hover:shadow-lg hover:shadow-primary-foreground/50 hover:scale-[1.02] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]"
                    >
                      Shop now <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chair — sibling of dropdown, free to overflow */}
            <div className="absolute bottom-[-110px] right-[-30px] xl:right-[-0px] w-96 h-96 pointer-events-none">
              <Image
                src="/images/chair-with-table.png"
                alt="Featured product"
                fill
                className="object-contain drop-shadow-2xl"
                sizes="384px"
              />
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
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  onSelect={closeSearch}
                  placeholder="Search products..."
                  autoFocus={searchOpen}
                  className="w-full bg-background border border-border rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
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
        </div>
      </header>
    </>
  );
};

export default Header;
