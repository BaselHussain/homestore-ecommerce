# Frontend UI Replicator — Agent Memory

## Project: homestore-sparkle → Next.js frontend replication

### Key Paths
- Source demo: `E:/e-commerce claude/homestore-sparkle/src/`
- Target Next.js app: `E:/e-commerce claude/frontend/`
- Public images: `E:/e-commerce claude/frontend/public/images/`
- Mock data: `E:/e-commerce claude/frontend/lib/products-mock.ts`
- Cart context: `E:/e-commerce claude/frontend/contexts/CartContext.tsx`

### Color/Theme System
- Tailwind v4 with `@theme` block in `globals.css` (NOT tailwind.config.ts for colors)
- Custom colors: `announcement`, `announcement-foreground`, `footer`, `footer-foreground`, `badge-new`, `badge-sale`, `badge-out`
- shadcn/ui compat layer: `:root` CSS vars in `hsl(H S% L%)` format (no `hsl()` wrapper)
- Fonts: `DM Serif Display` (display/headings), `Plus Jakarta Sans` (body)
- Primary: orange `hsl(25, 90%, 52%)`

### PostCSS Fix (CRITICAL)
- Next.js + Tailwind v4 requires `@tailwindcss/postcss` in postcss.config.mjs (NOT `tailwindcss`)
- `@import "tailwindcss-animate"` in globals.css causes build error — use ONLY `@plugin 'tailwindcss-animate'`
- postcss.config.mjs must use: `{ "@tailwindcss/postcss": {} }` only

### Tailwind Config Fix
- `darkMode: ["class"]` causes TS error in Tailwind v4 types — use `["class", "[data-theme='dark']"] as ["class", string]`

### Component Conventions
- All components using hooks/browser APIs: `'use client'` at top
- React Router DOM → Next.js: `Link to="..."` → `Link href="..."`, `useLocation` → `usePathname`, `useNavigate` → `useRouter`
- Image assets: `import from "@/assets/"` → `<Image src="/images/filename.jpg" fill />` from `next/image`
- `CartContext` uses `'use client'` + standard React context pattern
- `AnimatedElement` uses framer-motion `motion.div` with `whileInView` + `viewport={{ once }}`

### File Structure Created
```
frontend/
  app/
    layout.tsx          # DM_Serif_Display + Plus_Jakarta_Sans fonts, CartProvider, Toaster
    page.tsx            # Home: Header + Hero + FeatureBar + Features + CategoryGrid + FeaturedProducts + Testimonials + PromoBanner + Footer
    about/page.tsx
    contact/page.tsx
    categories/page.tsx
    not-found.tsx
    globals.css         # Tailwind v4 @theme block with all custom colors
  components/
    Header.tsx          # Sticky, announcement bar, category dropdown, mobile nav, search
    Footer.tsx          # Newsletter, links grid, bottom bar
    Hero.tsx            # Full-height bg image, animated content, stats
    CategoryGrid.tsx    # 2-col/3-col grid with framer-motion AnimatedElement
    FeatureBar.tsx      # 4 feature icons row
    FeaturedProducts.tsx
    ProductCard.tsx     # Hover effects, add-to-cart, badge system
    PromoBanner.tsx
    NavLink.tsx         # usePathname-based active state
    ui/
      animated-element.tsx  # framer-motion whileInView wrapper
      light-sheen-button.tsx
      button.tsx, card.tsx, badge.tsx, input.tsx, separator.tsx, skeleton.tsx
      toast.tsx, toaster.tsx
  contexts/
    CartContext.tsx
  hooks/
    use-toast.ts
    use-mobile.tsx
  lib/
    products-mock.ts    # Categories + Products with /images/ paths
    utils.ts            # cn() + formatPrice()
  public/images/        # All jpg assets copied from homestore-sparkle/src/assets/
```

### Known Issues / Patterns
- `ProductCard` and `Header` need `'use client'` (use hooks/events)
- `AnimatedElement` needs `'use client'` (framer-motion)
- `LightSheenButton` needs `'use client'` (button element)
- Static pages (About, Contact, Categories) do NOT need `'use client'` — they are server components
- `Toaster` component needs `'use client'` (uses useToast hook)
